<?php

// file: app/Http/Resources/PostResource.php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PostResource extends JsonResource
{
    public function toArray($request): array
    {
        $author = $this->relationLoaded('author') ? $this->author : $this->user;

        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'title' => $this->title,
            'content_markdown' => $this->content_markdown,
            'status' => $this->status,
            'score' => $this->score,
            'answers_count' => $this->answers_count,
            'comments_count' => $this->when(isset($this->comments_count), $this->comments_count),
            'votes_count' => $this->when(isset($this->votes_count), $this->votes_count),
            'tags' => $this->tags->map(fn ($t) => ['name' => $t->name, 'slug' => $t->slug]),
            'category' => $this->category?->only(['id', 'name', 'slug']),
            'user' => [
                'id' => $author?->id,
                'name' => $author?->name,
                'username' => $author?->username,
                'avatar_url' => $author?->avatar_url,
                'level' => $author?->level?->only(['id', 'name', 'min_xp']),
                'xp' => $author?->xp,
            ],
            'ai_suggestion' => $this->ai_suggestion,
            'created_at' => $this->created_at,
        ];
    }
}
