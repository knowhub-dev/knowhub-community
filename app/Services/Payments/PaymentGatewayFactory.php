<?php

namespace App\Services\Payments;

use App\Support\Settings;
use InvalidArgumentException;

class PaymentGatewayFactory
{
    public function make(string $provider): PaymentGatewayInterface
    {
        return match (strtolower($provider)) {
            'payme' => new PaymeService(
                Settings::get('payments.payme_merchant_id'),
                Settings::get('payments.payme_key'),
            ),
            'click' => new ClickService(
                Settings::get('payments.click_service_id'),
                Settings::get('payments.click_secret_key'),
            ),
            default => throw new InvalidArgumentException("Unsupported payment provider [{$provider}]."),
        };
    }
}
