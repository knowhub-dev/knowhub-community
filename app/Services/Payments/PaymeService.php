<?php

namespace App\Services\Payments;

use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymeService implements PaymentGatewayInterface
{
    public function __construct(
        private readonly ?string $merchantId,
        private readonly ?string $secretKey,
        private readonly PaymentCallbackLogger $logger,
    ) {}

    public function provider(): string
    {
        return 'payme';
    }

    public function validateSignature(Request $request): bool
    {
        $authHeader = $request->header('Authorization');

        if (! $authHeader || ! str_starts_with($authHeader, 'Basic ')) {
            return false;
        }

        $credentials = base64_decode(substr($authHeader, 6), true);

        if (! $credentials || ! str_contains($credentials, ':')) {
            return false;
        }

        [$merchantId, $secret] = explode(':', $credentials, 2);

        return $this->merchantId && $this->secretKey
            && hash_equals($this->merchantId, $merchantId)
            && hash_equals($this->secretKey, $secret);
    }

    public function handleCallback(Request $request): JsonResponse
    {
        if (! $this->merchantId || ! $this->secretKey) {
            throw new HttpResponseException(response()->json([
                'jsonrpc' => $request->input('jsonrpc', '2.0'),
                'error' => [
                    'code' => -32400,
                    'message' => 'Payment provider credentials are missing',
                ],
                'id' => $request->input('id'),
            ], 500));
        }

        $signatureValid = $this->validateSignature($request);
        if (! $signatureValid) {
            $this->logger->log($this->provider(), $request, false, 'rejected', 'Invalid signature');

            return response()->json([
                'jsonrpc' => $request->input('jsonrpc', '2.0'),
                'error' => [
                    'code' => -32504,
                    'message' => 'Unauthorized',
                ],
                'id' => $request->input('id'),
            ], 401);
        }

        $payload = $request->json()->all();

        $method = $payload['method'] ?? null;
        if (! in_array($method, ['CheckPerformTransaction', 'PerformTransaction', 'CancelTransaction', 'CheckTransaction'], true)) {
            $this->logger->log($this->provider(), $request, $signatureValid, 'rejected', 'Unsupported method');

            return response()->json([
                'jsonrpc' => $payload['jsonrpc'] ?? '2.0',
                'id' => $payload['id'] ?? null,
                'error' => [
                    'code' => -32601,
                    'message' => 'Method not found',
                ],
            ], 400);
        }

        $this->logger->log($this->provider(), $request, $signatureValid, 'accepted', 'Callback accepted');

        return response()->json([
            'jsonrpc' => $payload['jsonrpc'] ?? '2.0',
            'id' => $payload['id'] ?? null,
            'result' => [
                'status' => 'accepted',
                'method' => $payload['method'] ?? null,
            ],
        ]);
    }
}
