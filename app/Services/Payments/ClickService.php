<?php

namespace App\Services\Payments;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClickService implements PaymentGatewayInterface
{
    public function __construct(
        private readonly ?string $serviceId,
        private readonly ?string $secretKey,
    ) {}

    public function provider(): string
    {
        return 'click';
    }

    public function validateSignature(Request $request): bool
    {
        $signString = $request->input('sign_string') ?? $request->input('sign');
        $merchantTransId = $request->input('merchant_trans_id');
        $amount = $request->input('amount');
        $action = $request->input('action');
        $signTime = $request->input('sign_time');

        if (! $this->serviceId || ! $this->secretKey || ! $signString) {
            return false;
        }

        $hashSource = $merchantTransId.$this->serviceId.$this->secretKey.$amount.$action.$signTime;
        $expected = md5($hashSource);

        return hash_equals($expected, $signString);
    }

    public function handleCallback(Request $request): JsonResponse
    {
        if (! $this->validateSignature($request)) {
            return response()->json([
                'error' => true,
                'message' => 'Invalid signature',
            ], 401);
        }

        return response()->json([
            'error' => false,
            'provider' => $this->provider(),
            'merchant_trans_id' => $request->input('merchant_trans_id'),
            'status' => 'accepted',
        ]);
    }
}
