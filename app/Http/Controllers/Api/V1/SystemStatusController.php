<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Container;
use Illuminate\Database\Query\Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

class SystemStatusController extends Controller
{
    public function summary(): JsonResponse
    {
        $services = [
            $this->checkDatabase(),
            $this->checkCache(),
            $this->checkQueue(),
            $this->checkStorage(),
        ];

        return response()->json([
            'services' => $services,
            'metrics' => [
                'uptime_seconds' => $this->getSystemUptime(),
                'active_users' => DB::table('users')->count(),
                'queue_backlog' => $this->getQueueSize(),
            ],
            'updated_at' => now()->toIso8601String(),
        ]);
    }

    public function systemResources(): JsonResponse
    {
        [$memoryTotal, $memoryAvailable] = $this->getMemoryStats();
        [$diskTotal, $diskUsed] = $this->getDiskStats();

        return response()->json([
            'cpu_usage' => $this->getCpuUsage(),
            'memory_total' => $memoryTotal,
            'memory_used' => max(0, $memoryTotal - $memoryAvailable),
            'disk_total' => $diskTotal,
            'disk_used' => $diskUsed,
            'container_count' => Container::count(),
            'active_users' => $this->getActiveUsersCount(),
        ]);
    }

    public function containerStats(): JsonResponse
    {
        $statusCounts = Container::query()
            ->select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status');

        return response()->json([
            'total' => $statusCounts->sum(),
            'running' => $statusCounts->get('running', 0),
            'stopped' => $statusCounts->get('stopped', 0) + $statusCounts->get('stopping', 0),
            'error' => $statusCounts->get('error', 0) + $statusCounts->get('failed', 0),
        ]);
    }

    private function checkDatabase(): array
    {
        $start = microtime(true);
        try {
            DB::select('select 1 as ok');
            $status = 'operational';
        } catch (\Throwable $exception) {
            Log::warning('Status check: database unreachable', ['error' => $exception->getMessage()]);
            $status = 'outage';
        }

        return $this->servicePayload(
            'Ma\'lumotlar bazasi',
            $status,
            'Laravel database ulanishi',
            $this->formatLatency($start)
        );
    }

    private function checkCache(): array
    {
        $start = microtime(true);
        try {
            Cache::put('status:ping', 'pong', 5);
            Cache::get('status:ping');
            $status = 'operational';
        } catch (\Throwable $exception) {
            Log::warning('Status check: cache failure', ['error' => $exception->getMessage()]);
            $status = 'degraded';
        }

        return $this->servicePayload(
            'Cache',
            $status,
            'Session va tezkor xotira',
            $this->formatLatency($start)
        );
    }

    private function checkQueue(): array
    {
        $queueSize = $this->getQueueSize();
        $status = 'operational';

        if ($queueSize > 250) {
            $status = 'outage';
        } elseif ($queueSize > 50) {
            $status = 'degraded';
        }

        return [
            'name' => 'Navbatchi vazifalar',
            'status' => $status,
            'description' => 'Jobs jadvali va ishlov berish tezligi',
            'latency_ms' => null,
            'checked_at' => now()->toIso8601String(),
            'details' => [
                'backlog' => $queueSize,
            ],
        ];
    }

    private function checkStorage(): array
    {
        $start = microtime(true);
        try {
            $disk = Storage::disk(config('filesystems.default', 'local'));
            // oddiy o'qish amali
            $disk->exists('.');
            $status = 'operational';
        } catch (\Throwable $exception) {
            Log::warning('Status check: storage failure', ['error' => $exception->getMessage()]);
            $status = 'outage';
        }

        return $this->servicePayload(
            'Fayl saqlash',
            $status,
            'Media va yuklamalar',
            $this->formatLatency($start)
        );
    }

    private function getQueueSize(): int
    {
        try {
            if (Schema::hasTable('jobs')) {
                return (int) DB::table('jobs')->count();
            }
        } catch (\Throwable $exception) {
            Log::warning('Status check: queue count failed', ['error' => $exception->getMessage()]);
        }

        return 0;
    }

    private function getSystemUptime(): ?int
    {
        $path = '/proc/uptime';
        if (is_readable($path)) {
            $contents = @file_get_contents($path);
            if ($contents !== false) {
                [$seconds] = explode(' ', trim($contents));
                return (int) round((float) $seconds);
            }
        }

        return null;
    }

    private function getCpuUsage(): float
    {
        $cores = (int) shell_exec('nproc 2>/dev/null') ?: 1;
        $loadAverages = sys_getloadavg();
        $load = $loadAverages[0] ?? 0;

        return min(100, round(($load / max(1, $cores)) * 100, 2));
    }

    /**
     * @return array{0: int, 1: int} Memory stats [totalMB, availableMB]
     */
    private function getMemoryStats(): array
    {
        $meminfoPath = '/proc/meminfo';
        $totalKb = 0;
        $availableKb = 0;

        if (is_readable($meminfoPath)) {
            foreach (@file($meminfoPath) ?: [] as $line) {
                if (str_starts_with($line, 'MemTotal:')) {
                    $totalKb = (int) filter_var($line, FILTER_SANITIZE_NUMBER_INT);
                }
                if (str_starts_with($line, 'MemAvailable:')) {
                    $availableKb = (int) filter_var($line, FILTER_SANITIZE_NUMBER_INT);
                }
            }
        }

        $totalMb = (int) round($totalKb / 1024);
        $availableMb = (int) round($availableKb / 1024);

        return [$totalMb, $availableMb];
    }

    /**
     * @return array{0: int, 1: int} Disk stats [totalMB, usedMB]
     */
    private function getDiskStats(): array
    {
        $diskTotalBytes = @disk_total_space('/') ?: 0;
        $diskFreeBytes = @disk_free_space('/') ?: 0;

        $diskUsedBytes = max(0, $diskTotalBytes - $diskFreeBytes);

        return [
            (int) round($diskTotalBytes / 1024 / 1024),
            (int) round($diskUsedBytes / 1024 / 1024),
        ];
    }

    private function getActiveUsersCount(): int
    {
        try {
            return (int) DB::table('users')
                ->where('updated_at', '>=', now()->subMinutes(5))
                ->count();
        } catch (Exception $exception) {
            Log::warning('Status check: failed to count active users', ['error' => $exception->getMessage()]);
        }

        return 0;
    }

    private function servicePayload(string $name, string $status, string $description, ?float $latencyMs): array
    {
        return [
            'name' => $name,
            'status' => $status,
            'description' => $description,
            'latency_ms' => $latencyMs,
            'checked_at' => now()->toIso8601String(),
        ];
    }

    private function formatLatency(float $startedAt): ?float
    {
        $ms = (microtime(true) - $startedAt) * 1000;
        return round($ms, 2);
    }
}
