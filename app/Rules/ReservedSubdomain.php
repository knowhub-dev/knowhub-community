<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class ReservedSubdomain implements ValidationRule
{
    private array $reserved = [
        'admin', 'api', 'www', 'mail', 'support', 'billing', 'status', 'dashboard',
    ];

    public function __construct(private ?array $additional = null)
    {
        if ($additional) {
            $this->reserved = array_values(array_unique(array_merge($this->reserved, $additional)));
        }
    }

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (in_array(strtolower((string) $value), $this->reserved, true)) {
            $fail('The :attribute is reserved and cannot be used.');
        }
    }
}
