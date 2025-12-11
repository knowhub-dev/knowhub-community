<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Services\Plans\PlanService;
use App\Support\Settings;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentSettingsController extends Controller
{
    public function __construct(private readonly PlanService $planService) {}

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'payme' => 'array',
            'payme.enabled' => 'boolean',
            'payme.merchant_id' => 'nullable|string',
            'payme.secret_key' => 'nullable|string',
            'click' => 'array',
            'click.enabled' => 'boolean',
            'click.service_id' => 'nullable|string',
            'click.secret_key' => 'nullable|string',
            'click.merchant_user_id' => 'nullable|string',
        ]);

        $this->storeGatewaySettings('payme', $data['payme'] ?? []);
        $this->storeGatewaySettings('click', $data['click'] ?? []);

        return response()->json([
            'status' => 'ok',
            'stored' => array_keys(array_filter($data)),
        ]);
    }

    public function getCallbacks(): JsonResponse
    {
        $baseUrl = rtrim(config('app.url'), '/');

        return response()->json([
            'payme' => [
                'callback_url' => $baseUrl.route('payments.payme.callback', [], false),
                'enabled' => (bool) Settings::get('payments.payme.enabled', false),
                'merchant_id' => Settings::get('payments.payme.merchant_id'),
                'secret_key' => Settings::get('payments.payme.secret_key'),
            ],
            'click' => [
                'callback_url' => $baseUrl.route('payments.click.callback', [], false),
                'enabled' => (bool) Settings::get('payments.click.enabled', false),
                'service_id' => Settings::get('payments.click.service_id'),
                'secret_key' => Settings::get('payments.click.secret_key'),
                'merchant_user_id' => Settings::get('payments.click.merchant_user_id'),
            ],
            'plans' => $this->planService->all(),
        ]);
    }

    /**
     * @param  array<string,mixed>  $data
     */
    private function storeGatewaySettings(string $provider, array $data): void
    {
        foreach ($data as $key => $value) {
            $normalizedKey = "payments.{$provider}.{$key}";
            $type = str_contains($key, 'enabled') ? 'boolean' : 'encrypted';
            if ($value !== null) {
                Settings::set($normalizedKey, $value, $type);
            }
        }
    }
}
