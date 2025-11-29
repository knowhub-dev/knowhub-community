<?php

namespace App\Services\Containers;

use App\Models\Container;
use App\Models\ContainerMetric;
use App\Services\Containers\Adapters\DockerAdapter;
use Carbon\Carbon;
use Throwable;

class ContainerStatsService
{
    public function __construct(private readonly DockerAdapter $adapter)
    {
    }

    /** @return array<string,mixed> */
    public function show(Container $container): array
    {
        try {
            $live = $this->adapter->streamStats($container);

            $metric = new ContainerMetric([
                'container_id' => $container->id,
                'cpu_percent' => $live['cpu_percent'],
                'ram_mb' => $live['ram_mb'],
                'disk_mb' => $live['disk_mb'],
                'recorded_at' => Carbon::now(),
            ]);
            $metric->save();

            return $metric->toArray();
        } catch (\Throwable) {
            $latest = $container->metrics()->latest('recorded_at')->first();
            if ($latest) {
                return $latest->toArray();
            }
        }

        return [
            'cpu_percent' => 0.0,
            'ram_mb' => 0,
            'disk_mb' => null,
            'recorded_at' => Carbon::now(),
        ];
    }
}
