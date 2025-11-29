<?php

namespace App\Console\Commands;

use App\Jobs\CollectContainerMetrics;
use Illuminate\Console\Command;

class ContainersCollectMetricsCommand extends Command
{
    protected $signature = 'containers:collect-metrics';

    protected $description = 'Collect runtime metrics for running containers';

    public function handle(): int
    {
        CollectContainerMetrics::dispatch();
        $this->info('Dispatched container metrics collection job.');

        return self::SUCCESS;
    }
}
