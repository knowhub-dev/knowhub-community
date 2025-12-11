<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentCallbackLog extends Model
{
    protected $table = 'payment_callbacks';

    protected $fillable = [
        'provider',
        'signature_valid',
        'status',
        'message',
        'payload',
        'headers',
        'processed_at',
    ];

    protected $casts = [
        'payload' => 'array',
        'headers' => 'array',
        'signature_valid' => 'boolean',
        'processed_at' => 'datetime',
    ];
}
