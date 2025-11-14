<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;

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
                    default => $value,
                };
            },
            set: function ($value, array $attributes) {
                $type = $attributes['type'] ?? $this->attributes['type'] ?? 'string';
                return [
                    'value' => match ($type) {
                        'json' => $value !== null ? json_encode($value) : null,
                        'bool' => $value ? '1' : '0',
                        default => $value,
                    },
                ];
            }
        );
    }
}
