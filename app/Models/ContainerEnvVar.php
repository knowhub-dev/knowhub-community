<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ContainerEnvVar extends Model
{
    use HasFactory;

    protected $fillable = [
        'container_id',
        'key',
        'value',
    ];

    public function container()
    {
        return $this->belongsTo(Container::class);
    }
}
