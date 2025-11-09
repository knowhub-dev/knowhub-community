<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContainerStats extends Model
{
    protected $fillable = [
        'container_id',
        'cpu_usage',
        'memory_usage',
        'disk_usage',
        'network_rx',
        'network_tx'
    ];

    protected $casts = [
        'cpu_usage' => 'float',
        'memory_usage' => 'float',
        'disk_usage' => 'float',
        'network_rx' => 'integer',
        'network_tx' => 'integer'
    ];

    public function container()
    {
        return $this->belongsTo(Container::class);
    }
}
