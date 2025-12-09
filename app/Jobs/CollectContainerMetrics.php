<?php

namespace App\Jobs;

use App\Models\Container;
use App\Models\ContainerMetric;
use App\Services\Containers\Adapters\DockerAdapter;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class CollectContainerMetrics implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct() {}

    public function handle(DockerAdapter $adapter): void
    {
        $containers = Container::query()->where('status', Container::STATUS_RUNNING)->get();

        foreach ($containers as $container) {
            try {
                $stats = $adapter->streamStats($container);
                ContainerMetric::create([
                    'container_id' => $container->id,
                    'cpu_percent' => $stats['cpu_percent'],
                    'ram_mb' => $stats['ram_mb'],
                    'disk_mb' => $stats['disk_mb'],
                    'recorded_at' => Carbon::now(),
                ]);
            } catch (\Throwable $exception) {
                Log::warning('Failed to collect container metrics', [
                    'container_id' => $container->id,
                    'error' => $exception->getMessage(),
                ]);
            }
        }
    }
}
