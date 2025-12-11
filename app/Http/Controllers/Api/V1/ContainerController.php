<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Container\StoreContainerRequest;
use App\Http\Requests\Container\UpdateContainerRequest;
use App\Http\Resources\ContainerResource;
use App\Models\Container;
use App\Services\Containers\ContainerService;
use App\Services\Plans\PlanService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class ContainerController extends Controller
{
    public function __construct(
        private readonly ContainerService $containerService,
        private readonly PlanService $planService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $containers = $this->containerService->paginateForUser(
            $request->user(),
            $request->only(['status', 'type'])
        );

        return ContainerResource::collection($containers)
            ->additional(['meta' => ['total' => $containers->total()]])
            ->response();
    }

    public function store(StoreContainerRequest $request): JsonResponse
    {
        $user = $request->user();

        if (! $user->canCreateContainer()) {
            return response()->json([
                'message' => 'Joriy rejangiz bo\'yicha mini-server limiti tugagan. Kengaytirish uchun yuqori reja tanlang.',
                'upgrade_required' => true,
                'plans' => $this->planService->all(),
                'current_plan' => $user->currentPlan(),
            ], 403);
        }

        $this->authorize('create', Container::class);

        $minXp = (int) config('containers.min_xp_required', 0);
        if ($minXp > 0 && $request->user()->xp < $minXp) {
            return response()->json([
                'message' => 'Mini-server yaratish uchun XP yetarli emas',
                'required_xp' => $minXp,
                'current_xp' => $request->user()->xp,
            ], 403);
        }

        $container = $this->containerService->create($request->user(), $request->validated());

        return (new ContainerResource($container))
            ->additional(['meta' => null])
            ->response()
            ->setStatusCode(201);
    }

    public function show(Container $container): JsonResponse
    {
        Gate::authorize('view', $container);

        return (new ContainerResource($container->load(['envVars', 'events', 'metrics'])))
            ->additional(['meta' => null])
            ->response();
    }

    public function update(UpdateContainerRequest $request, Container $container): JsonResponse
    {
        Gate::authorize('update', $container);

        $updated = $this->containerService->update($container, $request->validated());

        return (new ContainerResource($updated))
            ->additional(['meta' => null])
            ->response();
    }

    public function destroy(Container $container): JsonResponse
    {
        Gate::authorize('delete', $container);

        $this->containerService->delete($container);

        return response()->json(['data' => null, 'meta' => null], 204);
    }
}
