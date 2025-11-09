<?php

namespace App\Services\Docker;

use App\Models\Container;
use App\Models\ContainerStats;
use Exception;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;

class ContainerService
{
    private $client;
    private $apiVersion;
    private $socket;

    public function __construct()
    {
        $this->apiVersion = config('services.docker.api_version');
        $this->socket = config('services.docker.socket');

        $this->client = new Client([
            'base_uri' => 'http://localhost',
            'curl' => [
                CURLOPT_UNIX_SOCKET_PATH => $this->socket
            ],
            'headers' => [
                'Content-Type' => 'application/json',
            ]
        ]);
    }

    public function create(Container $container)
    {
        try {
            $config = [
                'Image' => $container->image,
                'Env' => $this->formatEnvVars($container->env_vars),
                'HostConfig' => [
                    'Memory' => $container->memory_limit * 1024 * 1024, // Convert MB to bytes
                    'NanoCPUs' => $container->cpu_limit * 1000000000, // Convert cores to nanoCPUs
                    'DiskQuota' => $container->disk_limit * 1024 * 1024 // Convert MB to bytes
                ]
            ];

            $response = $this->client->post('/containers/create', [
                'json' => $config
            ]);

            $data = json_decode($response->getBody(), true);
            $container->container_id = $data['Id'];
            $container->save();

            return true;
        } catch (Exception $e) {
            Log::error('Container creation failed: ' . $e->getMessage());
            return false;
        }
    }

    public function start(Container $container)
    {
        try {
            $this->client->post("/containers/{$container->container_id}/start");
            $container->status = 'running';
            $container->save();
            return true;
        } catch (Exception $e) {
            Log::error('Container start failed: ' . $e->getMessage());
            return false;
        }
    }

    public function stop(Container $container)
    {
        try {
            $this->client->post("/containers/{$container->container_id}/stop");
            $container->status = 'stopped';
            $container->save();
            return true;
        } catch (Exception $e) {
            Log::error('Container stop failed: ' . $e->getMessage());
            return false;
        }
    }

    public function delete(Container $container)
    {
        try {
            if ($container->status === 'running') {
                $this->stop($container);
            }
            $this->client->delete("/containers/{$container->container_id}");
            $container->delete();
            return true;
        } catch (Exception $e) {
            Log::error('Container deletion failed: ' . $e->getMessage());
            return false;
        }
    }

    public function getStats(Container $container)
    {
        try {
            $response = $this->client->get("/containers/{$container->container_id}/stats?stream=false");
            $stats = json_decode($response->getBody(), true);
            
            $containerStats = new ContainerStats([
                'container_id' => $container->id,
                'cpu_usage' => $this->calculateCpuUsage($stats),
                'memory_usage' => $this->calculateMemoryUsage($stats),
                'disk_usage' => $this->calculateDiskUsage($stats),
                'network_rx' => $stats['networks']['eth0']['rx_bytes'] ?? 0,
                'network_tx' => $stats['networks']['eth0']['tx_bytes'] ?? 0
            ]);
            
            $containerStats->save();
            return $containerStats;
        } catch (Exception $e) {
            Log::error('Failed to get container stats: ' . $e->getMessage());
            return null;
        }
    }

    private function formatEnvVars($envVars)
    {
        if (!$envVars) return [];
        
        $formatted = [];
        foreach ($envVars as $key => $value) {
            $formatted[] = "$key=$value";
        }
        return $formatted;
    }

    private function calculateCpuUsage($stats)
    {
        $cpuStats = $stats['cpu_stats'];
        $precpuStats = $stats['precpu_stats'];
        
        $cpuDelta = $cpuStats['cpu_usage']['total_usage'] - $precpuStats['cpu_usage']['total_usage'];
        $systemDelta = $cpuStats['system_cpu_usage'] - $precpuStats['system_cpu_usage'];
        
        if ($systemDelta > 0 && $cpuDelta > 0) {
            $cpuCount = count($cpuStats['cpu_usage']['percpu_usage'] ?? [1]);
            return ($cpuDelta / $systemDelta) * $cpuCount * 100.0;
        }
        
        return 0;
    }

    private function calculateMemoryUsage($stats)
    {
        $memStats = $stats['memory_stats'];
        // Convert to MB
        return ($memStats['usage'] - $memStats['stats']['cache']) / (1024 * 1024);
    }

    private function calculateDiskUsage($stats)
    {
        // Get disk usage from blkio stats if available
        if (isset($stats['blkio_stats']['io_service_bytes_recursive'])) {
            $total = 0;
            foreach ($stats['blkio_stats']['io_service_bytes_recursive'] as $stat) {
                if ($stat['op'] === 'Total') {
                    $total += $stat['value'];
                }
            }
            return $total / (1024 * 1024); // Convert to MB
        }
        return 0;
    }
}