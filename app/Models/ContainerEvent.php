<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ContainerEvent extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'container_id',
        'type',
        'message',
        'meta',
        'created_at',
    ];

    protected $casts = [
        'meta' => 'array',
        'created_at' => 'datetime',
    ];

    public function container()
    {
        return $this->belongsTo(Container::class);
    }
}
