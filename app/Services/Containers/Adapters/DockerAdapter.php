<?php

namespace App\Services\Containers\Adapters;

use App\Exceptions\ContainerRuntimeException;
use App\Models\Container;
use Symfony\Component\Process\Process;

class DockerAdapter
{
    public function createContainer(Container $container, array $envVars = []): void
    {
        $this->runProcess(['echo', 'create', $container->slug]);
    }

    public function startContainer(Container $container): void
    {
        $this->runProcess(['echo', 'start', $container->slug]);
    }

    public function stopContainer(Container $container): void
    {
        $this->runProcess(['echo', 'stop', $container->slug]);
    }

    public function restartContainer(Container $container): void
    {
        $this->runProcess(['echo', 'restart', $container->slug]);
    }

    public function removeContainer(Container $container): void
    {
        $this->runProcess(['echo', 'remove', $container->slug]);
    }

    /** @return iterable<string> */
    public function followLogs(Container $container): iterable
    {
        yield "Container {$container->slug} log stream started";
    }

    /** @return array{cpu_percent:float, ram_mb:int, disk_mb:?int} */
    public function streamStats(Container $container): array
    {
        return [
            'cpu_percent' => 0.0,
            'ram_mb' => 0,
            'disk_mb' => null,
        ];
    }

    private function runProcess(array $command): void
    {
        $process = new Process($command);
        $process->run();

        if (!$process->isSuccessful()) {
            throw new ContainerRuntimeException($process->getErrorOutput() ?: 'Container runtime error');
        }
    }
}
