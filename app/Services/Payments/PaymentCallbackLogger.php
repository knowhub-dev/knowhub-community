<?php

namespace App\Services\Payments;

use App\Models\PaymentCallbackLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaymentCallbackLogger
{
    public function log(string $provider, Request $request, bool $signatureValid, string $status, ?string $message = null): void
    {
        try {
            PaymentCallbackLog::create([
                'provider' => $provider,
                'signature_valid' => $signatureValid,
                'status' => $status,
                'message' => $message,
                'payload' => $request->all(),
                'headers' => collect($request->headers->all())->map(fn ($v) => is_array($v) && count($v) === 1 ? $v[0] : $v)->all(),
                'processed_at' => now(),
            ]);
        } catch (\Throwable $e) {
            Log::warning('Payment callback could not be logged to DB', [
                'provider' => $provider,
                'status' => $status,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
