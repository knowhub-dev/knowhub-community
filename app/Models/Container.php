<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Container extends Model
{
    protected $fillable = [
        'user_id',
        'container_id',
        'name',
        'image',
        'status',
        'cpu_limit',
        'memory_limit',
        'disk_limit',
        'port',
        'env_vars'
    ];

    protected $casts = [
        'env_vars' => 'array',
        'cpu_limit' => 'integer',
        'memory_limit' => 'integer',
        'disk_limit' => 'integer',
        'port' => 'integer'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function stats()
    {
        return $this->hasMany(ContainerStats::class);
    }
}
