<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
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
