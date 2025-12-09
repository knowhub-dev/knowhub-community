<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\Payments\PaymentGatewayFactory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentCallbackController extends Controller
{
    public function __construct(private readonly PaymentGatewayFactory $gatewayFactory) {}

    public function payme(Request $request): JsonResponse
    {
        return $this->gatewayFactory->make('payme')->handleCallback($request);
    }

    public function click(Request $request): JsonResponse
    {
        return $this->gatewayFactory->make('click')->handleCallback($request);
    }
}
