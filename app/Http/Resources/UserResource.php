<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'username' => $this->username,
            'avatar_url' => $this->avatar_url,
            'bio' => $this->bio,
            'website_url' => $this->website_url,
            'github_url' => $this->github_url,
            'linkedin_url' => $this->linkedin_url,
            'resume' => $this->when($this->whenLoaded('resume'), $this->resume),
            'xp' => $this->xp,
            'level' => $this->level?->only(['id', 'name', 'min_xp', 'icon']),
            'badges' => $this->whenLoaded('badges', function () {
                return $this->badges->map(fn($badge) => [
                    'id' => $badge->id,
                    'name' => $badge->name,
                    'icon' => $badge->icon,
                    'awarded_at' => $badge->pivot->awarded_at
                ]);
            }),
            'stats' => [
                'posts_count' => $this->posts_count ?? $this->posts()->where('status', 'published')->count(),
                'followers_count' => $this->followers_count ?? $this->followers()->count(),
                'following_count' => $this->following_count ?? $this->following()->count(),
            ],
            'created_at' => $this->created_at,
            
            // =======================================================
            // MANA O'SHA ENG MUHIM QATOR:
            // =======================================================
            'role' => $this->is_admin ? 'admin' : 'user',
            // =======================================================
        ];
    }
}