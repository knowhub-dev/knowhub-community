<?php

// file: app/Models/WikiArticle.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class WikiArticle extends Model
{
    protected $fillable = ['title', 'slug', 'content_markdown', 'status', 'created_by', 'updated_by', 'version'];

    protected $hidden = ['created_by', 'updated_by', 'creator', 'updater'];

    protected static function booted(): void
    {
        static::creating(function (WikiArticle $a) {
            $a->slug = $a->slug ?: Str::slug($a->title);
        });
    }

    public function proposals(): HasMany
    {
        return $this->hasMany(WikiProposal::class, 'article_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function getUserAttribute(): ?array
    {
        if (! $this->relationLoaded('creator')) {
            return null;
        }

        $creator = $this->getRelation('creator');

        if (! $creator) {
            return null;
        }

        $level = $creator->relationLoaded('level') ? $creator->level : $creator->level()->select('id', 'name')->first();

        return [
            'id' => $creator->id,
            'name' => $creator->name,
            'username' => $creator->username,
            'avatar_url' => $creator->avatar_url,
            'level' => $level ? [
                'id' => $level->id,
                'name' => $level->name,
            ] : null,
        ];
    }
}
