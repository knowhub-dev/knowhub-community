<?php

namespace App\Services\Payments;

use App\Support\Settings;
use InvalidArgumentException;

class PaymentGatewayFactory
{
    public function __construct(private readonly PaymentCallbackLogger $logger) {}

    public function make(string $provider): PaymentGatewayInterface
    {
        return match (strtolower($provider)) {
            'payme' => new PaymeService(
                Settings::get('payments.payme.merchant_id'),
                Settings::get('payments.payme.secret_key'),
                $this->logger,
            ),
            'click' => new ClickService(
                Settings::get('payments.click.service_id'),
                Settings::get('payments.click.secret_key'),
                $this->logger,
            ),
            default => throw new InvalidArgumentException("Unsupported payment provider [{$provider}]."),
        };
    }
}
