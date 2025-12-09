<?php

// file: app/Models/Post.php

namespace App\Models;

use App\Filters\PostFilter;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory; // <-- QO'SHILDI
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Post extends Model
{
    use HasFactory; // <-- QO'SHILDI

    // Faktori ishlashi uchun buni qo'shamiz:
    protected $fillable = [
        'user_id',
        'category_id',
        'title',
        'slug',
        'content_markdown',
        'content_html',
        'status',
        'score',
        'views',
        'answers_count',
        'is_ai_suggested',
        'required_xp',
        'requires_verification',
    ];

    /**
     * Postning muallifi
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Postning kategoriyasi
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Postning kommentlari
     */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    /**
     * Postning teglari
     */
    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class);
    }

    public function collaborationSessions(): HasMany
    {
        return $this->hasMany(CollaborationSession::class);
    }

    public function reports(): MorphMany
    {
        return $this->morphMany(Report::class, 'reportable');
    }

    public function votes(): MorphMany
    {
        return $this->morphMany(Vote::class, 'votable');
    }

    public function scopeFilter(Builder $query, PostFilter $filter, array $filters): Builder
    {
        return $filter->apply($query, $filters);
    }
}
