<?php

// file: app/Models/Tag.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Str;

class Tag extends Model
{
    protected $fillable = ['name', 'slug'];

    protected static function booted(): void
    {
        static::creating(function (Tag $tag) {
            $tag->slug = $tag->slug ?: Str::slug($tag->name);
        });
    }

    public function posts(): BelongsToMany
    {
        return $this->belongsToMany(Post::class);
    }

    public function scopePopular($query)
    {
        return $query->withCount(['posts' => function ($q) {
            $q->where('status', 'published')
                ->where('created_at', '>=', now()->subDays(30));
        }])
            ->having('posts_count', '>', 0)
            ->orderByDesc('posts_count');
    }
}
