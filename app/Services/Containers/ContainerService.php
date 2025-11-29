<?php

namespace App\Services\Containers;

use App\Models\Container;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Arr;

class ContainerService
{
    public function __construct(
        private readonly ContainerLifecycleService $lifecycleService,
        private readonly ContainerEnvService $envService,
    )
    {
    }

    /** @return Collection<int, Container> */
    public function listForUser(User $user, array $filters = []): Collection
    {
        $query = $user->containers()->newQuery();

        if ($status = Arr::get($filters, 'status')) {
            $query->where('status', $status);
        }

        if ($type = Arr::get($filters, 'type')) {
            $query->where('type', $type);
        }

        return $query->latest()->get();
    }

    public function paginateForUser(User $user, array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = $user->containers()->newQuery();

        if ($status = Arr::get($filters, 'status')) {
            $query->where('status', $status);
        }

        if ($type = Arr::get($filters, 'type')) {
            $query->where('type', $type);
        }

        return $query->latest()->paginate($perPage);
    }

    public function create(User $user, array $data): Container
    {
        $container = new Container($data);
        $container->user()->associate($user);
        $env = $data['env'] ?? [];

        $this->lifecycleService->create($container, $env);

        foreach ($env as $item) {
            $this->envService->store($container, $item);
        }

        return $container->fresh(['envVars', 'events']);
    }

    public function update(Container $container, array $data): Container
    {
        $container->fill($data);
        $container->save();

        return $container->fresh();
    }

    public function delete(Container $container): void
    {
        $this->lifecycleService->destroy($container);
    }
}
