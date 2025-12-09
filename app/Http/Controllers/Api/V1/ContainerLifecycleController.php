<?php

namespace App\Http\Controllers\Api\V1;

use App\Exceptions\ContainerRuntimeException;
use App\Http\Controllers\Controller;
use App\Http\Resources\ContainerResource;
use App\Models\Container;
use App\Services\Containers\ContainerLifecycleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;

class ContainerLifecycleController extends Controller
{
    public function __construct(
        private readonly ContainerLifecycleService $lifecycleService,
    ) {}

    public function start(Container $container): JsonResponse
    {
        Gate::authorize('update', $container);

        try {
            $this->lifecycleService->start($container);
        } catch (ContainerRuntimeException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'code' => 'container_start_failed',
            ], 409);
        }

        return (new ContainerResource($container->fresh()))
            ->additional(['meta' => null])
            ->response();
    }

    public function stop(Container $container): JsonResponse
    {
        Gate::authorize('update', $container);

        try {
            $this->lifecycleService->stop($container);
        } catch (ContainerRuntimeException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'code' => 'container_stop_failed',
            ], 409);
        }

        return (new ContainerResource($container->fresh()))
            ->additional(['meta' => null])
            ->response();
    }

    public function restart(Container $container): JsonResponse
    {
        Gate::authorize('update', $container);

        try {
            $this->lifecycleService->restart($container);
        } catch (ContainerRuntimeException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'code' => 'container_restart_failed',
            ], 409);
        }

        return (new ContainerResource($container->fresh()))
            ->additional(['meta' => null])
            ->response();
    }
}
