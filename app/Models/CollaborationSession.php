<?php

// file: app/Models/CollaborationSession.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CollaborationSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'post_id',
        'owner_id',
        'status',
        'content_snapshot',
        'ended_at',
    ];

    protected $casts = [
        'ended_at' => 'datetime',
    ];

    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function participants(): HasMany
    {
        return $this->hasMany(CollaborationSessionUser::class, 'session_id');
    }

    public function events(): HasMany
    {
        return $this->hasMany(CollaborationEvent::class, 'session_id');
    }
}
