<?php

namespace App\Services\Payments;

use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClickService implements PaymentGatewayInterface
{
    public function __construct(
        private readonly ?string $serviceId,
        private readonly ?string $secretKey,
        private readonly PaymentCallbackLogger $logger,
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
        if (! $this->serviceId || ! $this->secretKey) {
            throw new HttpResponseException(response()->json([
                'error' => true,
                'message' => 'Payment provider credentials are missing',
            ], 500));
        }

        $signatureValid = $this->validateSignature($request);
        if (! $signatureValid) {
            $this->logger->log($this->provider(), $request, false, 'rejected', 'Invalid signature');

            return response()->json([
                'error' => true,
                'message' => 'Invalid signature',
            ], 401);
        }

        $required = ['merchant_trans_id', 'amount', 'action', 'sign_time'];
        foreach ($required as $field) {
            if (! $request->filled($field)) {
                $this->logger->log($this->provider(), $request, $signatureValid, 'rejected', "Missing field: {$field}");

                return response()->json([
                    'error' => true,
                    'message' => "Missing required field: {$field}",
                ], 422);
            }
        }

        $this->logger->log($this->provider(), $request, $signatureValid, 'accepted', 'Callback accepted');

        return response()->json([
            'error' => false,
            'provider' => $this->provider(),
            'merchant_trans_id' => $request->input('merchant_trans_id'),
            'status' => 'accepted',
        ]);
    }
}
