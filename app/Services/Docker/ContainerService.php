<?php

namespace App\Services\Docker;

use App\Models\Container;
use App\Models\ContainerStats;
use Exception;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use GuzzleHttp\Exception\RequestException;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ContainerService
{
    private Client $client;

    private string $socket;

    public function __construct()
    {
        $dockerConfig = config('services.docker');
        $this->socket = $dockerConfig['socket'] ?? '/var/run/docker.sock';

        $this->client = new Client([
            'base_uri' => rtrim($dockerConfig['base_uri'] ?? 'http://localhost/v1.41', '/'),
            'curl' => [
                CURLOPT_UNIX_SOCKET_PATH => $this->socket,
            ],
            'headers' => [
                'Content-Type' => 'application/json',
            ],
        ]);
    }

    public function create(Container $container): bool
    {
        try {
            if (! in_array($container->image, config('containers.allowed_images', []), true)) {
                throw new Exception('Attempted to launch a container with a disallowed image.');
            }

            if (! $container->port) {
                $container->port = $this->allocatePort($container);
            }

            $config = [
                'Image' => $container->image,
                'Env' => $this->formatEnvVars($container->env_vars ?? []),
                'HostConfig' => $this->buildHostConfig($container),
            ];

            if ($container->port) {
                $portKey = sprintf('%d/tcp', $container->port);
                $config['ExposedPorts'] = [
                    $portKey => new \stdClass,
                ];
            }

            $response = $this->client->post('/containers/create', [
                'query' => [
                    'name' => $this->generateContainerName($container),
                ],
                'json' => $config,
            ]);

            $data = json_decode((string) $response->getBody(), true);
            $container->container_id = $data['Id'] ?? null;
            $container->save();

            return true;
        } catch (Exception|GuzzleException $e) {
            Log::error('Container creation failed: '.$e->getMessage(), [
                'container_id' => $container->id,
            ]);

            return false;
        }
    }

    public function start(Container $container): bool
    {
        try {
            $this->client->post("/containers/{$container->container_id}/start");
            $container->status = 'running';
            $container->save();

            return true;
        } catch (Exception|GuzzleException $e) {
            Log::error('Container start failed: '.$e->getMessage(), [
                'container_id' => $container->id,
            ]);

            return false;
        }
    }

    public function stop(Container $container): bool
    {
        try {
            $this->client->post("/containers/{$container->container_id}/stop");
            $container->status = 'stopped';
            $container->save();

            return true;
        } catch (Exception|GuzzleException $e) {
            Log::error('Container stop failed: '.$e->getMessage(), [
                'container_id' => $container->id,
            ]);

            return false;
        }
    }

    public function delete(Container $container): bool
    {
        try {
            if ($container->status === 'running') {
                $this->stop($container);
            }

            if ($container->container_id) {
                $this->client->delete("/containers/{$container->container_id}");
            }

            $container->delete();

            return true;
        } catch (Exception|GuzzleException $e) {
            Log::error('Container deletion failed: '.$e->getMessage(), [
                'container_id' => $container->id,
            ]);

            return false;
        }
    }

    public function getStats(Container $container): ?ContainerStats
    {
        try {
            $response = $this->client->get("/containers/{$container->container_id}/stats?stream=false");
            $stats = json_decode((string) $response->getBody(), true);

            $containerStats = new ContainerStats([
                'container_id' => $container->id,
                'cpu_usage' => $this->calculateCpuUsage($stats),
                'memory_usage' => $this->calculateMemoryUsage($stats),
                'disk_usage' => $this->calculateDiskUsage($stats),
                'network_rx' => $stats['networks']['eth0']['rx_bytes'] ?? 0,
                'network_tx' => $stats['networks']['eth0']['tx_bytes'] ?? 0,
            ]);

            $containerStats->save();

            return $containerStats;
        } catch (Exception|GuzzleException $e) {
            Log::error('Failed to get container stats: '.$e->getMessage(), [
                'container_id' => $container->id,
            ]);

            return null;
        }
    }

    public function getLogs(Container $container, int $limit = 100): array
    {
        try {
            $response = $this->client->get(
                "/containers/{$container->container_id}/logs",
                [
                    'query' => [
                        'stdout' => 1,
                        'stderr' => 1,
                        'tail' => $limit,
                    ],
                ],
            );

            $rawLogs = (string) $response->getBody();
            $lines = array_filter(explode("\n", $rawLogs));

            return array_slice($lines, -$limit);
        } catch (RequestException $e) {
            Log::warning('Failed to fetch container logs', [
                'container_id' => $container->id,
                'error' => $e->getMessage(),
            ]);

            return [];
        }
    }

    public function updateEnv(Container $container, array $envVars): bool
    {
        try {
            $container->env_vars = $envVars;
            $container->save();

            if ($container->container_id) {
                $this->client->post(
                    "/containers/{$container->container_id}/update",
                    [
                        'json' => [
                            'Env' => $this->formatEnvVars($envVars),
                        ],
                    ],
                );
            }

            return true;
        } catch (Exception|GuzzleException $e) {
            Log::error('Failed to update container environment variables', [
                'container_id' => $container->id,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    private function formatEnvVars(array $envVars): array
    {
        $formatted = [];
        foreach ($envVars as $key => $value) {
            $formatted[] = sprintf('%s=%s', $key, (string) $value);
        }

        return $formatted;
    }

    private function allocatePort(Container $container): ?int
    {
        $range = config('containers.port_range');
        if (! $range) {
            return null;
        }

        $start = (int) ($range['start'] ?? 0);
        $end = (int) ($range['end'] ?? 0);

        if ($start <= 0 || $end <= 0 || $end < $start) {
            throw new Exception('Invalid container port range configuration.');
        }

        $usedPorts = Container::whereNotNull('port')->pluck('port')->toArray();

        for ($port = $start; $port <= $end; $port++) {
            if (! in_array($port, $usedPorts, true)) {
                return $port;
            }
        }

        throw new Exception('No available ports within the configured range.');
    }

    private function buildHostConfig(Container $container): array
    {
        $security = config('containers.security');
        $hostConfig = [
            'Memory' => $container->memory_limit * 1024 * 1024,
            'NanoCPUs' => $container->cpu_limit * 1000000000,
            'DiskQuota' => $container->disk_limit * 1024 * 1024,
            'Init' => true,
            'SecurityOpt' => [],
        ];

        $workspacePath = $this->ensureWorkspace($container);
        $hostConfig['Binds'] = [sprintf('%s:/app', $workspacePath)];

        if (! empty($security['no_new_privileges'])) {
            $hostConfig['SecurityOpt'][] = 'no-new-privileges:true';
        }

        if (! empty($security['drop_capabilities'])) {
            $hostConfig['CapDrop'] = (array) $security['drop_capabilities'];
        }

        if (! empty($security['readonly_root_filesystem'])) {
            $hostConfig['ReadonlyRootfs'] = true;
        }

        if (! empty($security['pids_limit'])) {
            $hostConfig['PidsLimit'] = (int) $security['pids_limit'];
        }

        if ($container->port) {
            $portKey = sprintf('%d/tcp', $container->port);
            $hostIp = (string) (($security['host_ip'] ?? config('containers.port_range.host_ip')) ?? '127.0.0.1');
            $hostConfig['PortBindings'] = [
                $portKey => [[
                    'HostPort' => (string) $container->port,
                    'HostIp' => $hostIp,
                ]],
            ];
        }

        return $hostConfig;
    }

    private function generateContainerName(Container $container): string
    {
        $prefix = $container->subdomain ?: sprintf('user-%d', $container->user_id);
        $prefix = Str::slug($prefix);

        return sprintf('%s-%s', $prefix, Str::lower(Str::random(8)));
    }

    private function calculateCpuUsage(array $stats): float
    {
        $cpuStats = $stats['cpu_stats'] ?? [];
        $precpuStats = $stats['precpu_stats'] ?? [];

        $cpuDelta = ($cpuStats['cpu_usage']['total_usage'] ?? 0) - ($precpuStats['cpu_usage']['total_usage'] ?? 0);
        $systemDelta = ($cpuStats['system_cpu_usage'] ?? 0) - ($precpuStats['system_cpu_usage'] ?? 0);

        if ($systemDelta > 0 && $cpuDelta > 0) {
            $cpuCount = count($cpuStats['cpu_usage']['percpu_usage'] ?? [1]);

            return ($cpuDelta / $systemDelta) * $cpuCount * 100.0;
        }

        return 0.0;
    }

    private function calculateMemoryUsage(array $stats): float
    {
        $memStats = $stats['memory_stats'] ?? [];
        $usage = ($memStats['usage'] ?? 0) - ($memStats['stats']['cache'] ?? 0);

        return $usage / (1024 * 1024);
    }

    private function calculateDiskUsage(array $stats): float
    {
        $blkio = $stats['blkio_stats']['io_service_bytes_recursive'] ?? [];
        $total = 0;

        foreach ($blkio as $stat) {
            if (($stat['op'] ?? null) === 'Total') {
                $total += $stat['value'] ?? 0;
            }
        }

        return $total / (1024 * 1024);
    }

    private function ensureWorkspace(Container $container): string
    {
        if (! $container->uuid) {
            $container->uuid = (string) Str::uuid();
            $container->save();
        }

        $relativePath = sprintf('containers/%s', $container->uuid);
        Storage::disk('local')->makeDirectory($relativePath);

        return storage_path(sprintf('app/%s', $relativePath));
    }
}
