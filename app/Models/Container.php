<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Container extends Model
{
    use HasFactory;
    use SoftDeletes;

    public const TYPE_CODE_RUNNER = 'code_runner';

    public const TYPE_DEV_SERVICE = 'dev_service';

    public const TYPE_BOT = 'bot';

    public const STATUS_CREATING = 'creating';

    public const STATUS_RUNNING = 'running';

    public const STATUS_STOPPED = 'stopped';

    public const STATUS_ERROR = 'error';

    protected $fillable = [
        'user_id',
        'name',
        'slug',
        'uuid',
        'container_id',
        'subdomain',
        'image',
        'type',
        'status',
        'cpu_limit',
        'memory_limit',
        'disk_limit',
        'port',
        'env_vars',
        'restart_policy',
        'internal_port',
        'public_port',
    ];

    protected $casts = [
        'cpu_limit' => 'integer',
        'memory_limit' => 'integer',
        'disk_limit' => 'integer',
        'port' => 'integer',
        'internal_port' => 'integer',
        'public_port' => 'integer',
        'env_vars' => 'array',
    ];

    protected static function booted(): void
    {
        static::creating(function (self $container): void {
            if (empty($container->slug)) {
                $container->slug = Str::slug($container->name.'-'.Str::random(6));
            }
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function envVars()
    {
        return $this->hasMany(ContainerEnvVar::class);
    }

    public function events()
    {
        return $this->hasMany(ContainerEvent::class);
    }

    public function metrics()
    {
        return $this->hasMany(ContainerMetric::class);
    }
}
