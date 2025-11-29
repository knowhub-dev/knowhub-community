<?php

namespace App\Console;

use App\Console\Commands\ContainersCollectMetricsCommand;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /** @var array<int,string> */
    protected $commands = [
        ContainersCollectMetricsCommand::class,
    ];

    protected function schedule(Schedule $schedule): void
    {
        $schedule->command('containers:collect-metrics')->everyFiveMinutes();
    }

    protected function commands(): void
    {
        $this->load(__DIR__ . '/Commands');
    }
}
