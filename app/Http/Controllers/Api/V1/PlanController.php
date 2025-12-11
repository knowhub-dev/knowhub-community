<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\Plans\PlanService;
use Illuminate\Http\JsonResponse;

class PlanController extends Controller
{
    public function __construct(private readonly PlanService $planService) {}

    public function index(): JsonResponse
    {
        return response()->json([
            'plans' => $this->planService->all(),
        ]);
    }
}
