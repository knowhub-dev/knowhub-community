<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ContainerMetric extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'container_id',
        'cpu_percent',
        'ram_mb',
        'disk_mb',
        'recorded_at',
    ];

    protected $casts = [
        'cpu_percent' => 'decimal:2',
        'ram_mb' => 'integer',
        'disk_mb' => 'integer',
        'recorded_at' => 'datetime',
    ];

    public function container()
    {
        return $this->belongsTo(Container::class);
    }
}
