<?php

namespace App\Services\Containers;

use App\Exceptions\ContainerRuntimeException;
use App\Models\Container;
use App\Models\ContainerEvent;
use App\Services\Containers\Adapters\DockerAdapter;
use Illuminate\Support\Facades\DB;

class ContainerLifecycleService
{
    public function __construct(private readonly DockerAdapter $adapter)
    {
    }

    public function create(Container $container, array $envVars = []): Container
    {
        return DB::transaction(function () use ($container, $envVars) {
            $container->status = Container::STATUS_CREATING;
            $container->save();

            $this->adapter->createContainer($container, $envVars);
            $this->recordEvent($container, 'created', 'Container created');

            return $container;
        });
    }

    public function start(Container $container): void
    {
        $this->adapter->startContainer($container);
        $container->update(['status' => Container::STATUS_RUNNING]);
        $this->recordEvent($container, 'started', 'Container started');
    }

    public function stop(Container $container): void
    {
        $this->adapter->stopContainer($container);
        $container->update(['status' => Container::STATUS_STOPPED]);
        $this->recordEvent($container, 'stopped', 'Container stopped');
    }

    public function restart(Container $container): void
    {
        $this->adapter->restartContainer($container);
        $container->update(['status' => Container::STATUS_RUNNING]);
        $this->recordEvent($container, 'restarted', 'Container restarted');
    }

    public function destroy(Container $container): void
    {
        try {
            $this->adapter->removeContainer($container);
        } catch (ContainerRuntimeException) {
            // ignore removal errors but still mark as deleted
        }

        $this->recordEvent($container, 'deleted', 'Container deleted');
        $container->delete();
    }

    private function recordEvent(Container $container, string $type, string $message): void
    {
        ContainerEvent::create([
            'container_id' => $container->id,
            'type' => $type,
            'message' => $message,
            'created_at' => now(),
        ]);
    }
}
