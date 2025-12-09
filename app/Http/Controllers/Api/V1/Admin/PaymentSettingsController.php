<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Support\Settings;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentSettingsController extends Controller
{
    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'payme_merchant_id' => 'nullable|string',
            'payme_key' => 'nullable|string',
            'click_service_id' => 'nullable|string',
            'click_secret_key' => 'nullable|string',
        ]);

        foreach ($data as $key => $value) {
            if ($value !== null) {
                Settings::set('payments.'.$key, $value, 'encrypted');
            }
        }

        return response()->json([
            'status' => 'ok',
            'stored' => array_keys(array_filter($data, fn ($value) => $value !== null)),
        ]);
    }

    public function getCallbacks(): JsonResponse
    {
        $baseUrl = rtrim(config('app.url'), '/');

        return response()->json([
            'payme' => $baseUrl.route('payments.payme.callback', [], false),
            'click' => $baseUrl.route('payments.click.callback', [], false),
        ]);
    }
}
