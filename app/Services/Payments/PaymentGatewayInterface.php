<?php

namespace App\Services\Payments;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

interface PaymentGatewayInterface
{
    public function provider(): string;

    public function validateSignature(Request $request): bool;

    public function handleCallback(Request $request): JsonResponse;
}
