<?php

namespace App\Services\Containers;

use App\Models\Container;
use App\Services\Containers\Adapters\DockerAdapter;

class ContainerLogsService
{
    public function __construct(private readonly DockerAdapter $adapter) {}

    public function stream(Container $container, callable $emit): void
    {
        foreach ($this->adapter->followLogs($container) as $line) {
            $emit($line);
        }
    }
}
