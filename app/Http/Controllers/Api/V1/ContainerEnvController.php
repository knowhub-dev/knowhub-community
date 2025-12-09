<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Container\StoreEnvVarRequest;
use App\Http\Requests\Container\UpdateEnvVarRequest;
use App\Http\Resources\ContainerEnvResource;
use App\Models\Container;
use App\Models\ContainerEnvVar;
use App\Services\Containers\ContainerEnvService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class ContainerEnvController extends Controller
{
    public function __construct(private readonly ContainerEnvService $envService) {}

    public function index(Container $container): JsonResponse
    {
        Gate::authorize('view', $container);

        return ContainerEnvResource::collection($this->envService->index($container))
            ->additional(['meta' => null])
            ->response();
    }

    public function store(Container $container, StoreEnvVarRequest $request): JsonResponse
    {
        Gate::authorize('update', $container);

        $env = $this->envService->store($container, $request->validated());

        return (new ContainerEnvResource($env))
            ->additional(['meta' => null])
            ->response()
            ->setStatusCode(201);
    }

    public function update(Container $container, ContainerEnvVar $env, UpdateEnvVarRequest $request): JsonResponse
    {
        Gate::authorize('update', $container);

        if ($env->container_id !== $container->id) {
            abort(404);
        }

        $env = $this->envService->update($env, $request->validated());

        return (new ContainerEnvResource($env))
            ->additional(['meta' => null])
            ->response();
    }

    public function destroy(Container $container, ContainerEnvVar $env): JsonResponse
    {
        Gate::authorize('update', $container);

        if ($env->container_id !== $container->id) {
            abort(404);
        }

        $this->envService->destroy($env);

        return response()->json(['data' => null, 'meta' => null], 204);
    }

    public function sync(Container $container, Request $request): JsonResponse
    {
        Gate::authorize('update', $container);

        $payload = $request->validate([
            'env_vars' => ['array'],
            'env_vars.*' => ['nullable', 'string'],
        ]);

        $this->envService->syncFromArray($container, $payload['env_vars'] ?? []);

        return ContainerEnvResource::collection($container->envVars)
            ->additional(['meta' => null])
            ->response();
    }
}
