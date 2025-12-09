<?php

namespace App\Models;

use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;

class Setting extends Model
{
    protected $fillable = [
        'key',
        'value',
        'type',
    ];

    protected $casts = [
        'value' => 'string',
    ];

    public function value(): Attribute
    {
        return Attribute::make(
            get: function ($value, array $attributes) {
                return match ($attributes['type'] ?? 'string') {
                    'json' => $value ? json_decode($value, true) : null,
                    'bool' => filter_var($value, FILTER_VALIDATE_BOOL, FILTER_NULL_ON_FAILURE),
                    'int' => $value !== null ? (int) $value : null,
                    'float' => $value !== null ? (float) $value : null,
                    'encrypted' => $this->decryptValue($value),
                    default => $value,
                };
            },
            set: function ($value, array $attributes) {
                $type = $attributes['type'] ?? $this->attributes['type'] ?? 'string';

                return [
                    'value' => match ($type) {
                        'json' => $value !== null ? json_encode($value) : null,
                        'bool' => $value ? '1' : '0',
                        'encrypted' => $value !== null ? Crypt::encryptString($value) : null,
                        default => $value,
                    },
                ];
            }
        );
    }

    private function decryptValue(?string $value): ?string
    {
        if (! $value) {
            return null;
        }

        try {
            return Crypt::decryptString($value);
        } catch (DecryptException) {
            return null;
        }
    }
}
