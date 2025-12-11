<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Services\Plans\PlanService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PlanController extends Controller
{
    public function __construct(private readonly PlanService $planService)
    {
        $this->middleware(function ($request, $next) {
            if (! $request->user() || ! ($request->user()->is_admin ?? false)) {
                return response()->json(['message' => 'Unauthorized - Admin access required'], 403);
            }

            return $next($request);
        });
    }

    public function index(): JsonResponse
    {
        return response()->json([
            'plans' => $this->planService->all(),
        ]);
    }

    public function save(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'plans' => ['required', 'array'],
            'plans.*.id' => ['required', 'string', 'max:50'],
            'plans.*.name' => ['required', 'string', 'max:100'],
            'plans.*.currency' => ['required', 'string', 'max:10'],
            'plans.*.price_monthly' => ['required', 'numeric', 'min:0'],
            'plans.*.price_yearly' => ['required', 'numeric', 'min:0'],
            'plans.*.description' => ['nullable', 'string', 'max:500'],
            'plans.*.features' => ['array'],
            'plans.*.features.*' => ['string', 'max:160'],
            'plans.*.limits' => ['array'],
            'plans.*.highlight' => ['boolean'],
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Invalid payload', 'errors' => $validator->errors()], 422);
        }

        $plans = $validator->validated()['plans'];
        $saved = $this->planService->save($plans);

        return response()->json([
            'message' => 'Plans updated',
            'plans' => $saved,
        ]);
    }
}
