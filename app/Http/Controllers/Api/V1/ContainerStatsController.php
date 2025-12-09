<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Container;
use App\Services\Containers\ContainerStatsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;

class ContainerStatsController extends Controller
{
    public function __construct(private readonly ContainerStatsService $statsService) {}

    public function show(Container $container): JsonResponse
    {
        Gate::authorize('view', $container);

        $metrics = $this->statsService->show($container);

        return response()->json(['data' => $metrics, 'meta' => null]);
    }
}
