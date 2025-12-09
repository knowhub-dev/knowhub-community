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
            'email' => $this->email,
            'avatar_url' => $this->avatar_url,
            'bio' => $this->bio,
            'xp' => $this->xp,
            'plan_type' => $this->plan_type,
            'plan_expires_at' => $this->plan_expires_at?->toISOString(),
            'is_pro' => $this->isPro(),
            'is_legend' => $this->isLegend(),
            'is_verified' => (bool) $this->is_verified,
            'is_current_user' => $request?->user()?->id === $this->id,
            'stats' => [
                'posts_count' => (int) ($this->posts_count ?? 0),
                'followers_count' => (int) ($this->followers_count ?? 0),
                'following_count' => (int) ($this->following_count ?? 0),
            ],
            'level' => $this->level?->only(['id', 'name', 'min_xp', 'icon']),
            'badges' => $this->whenLoaded('badges', function () {
                return $this->badges->map(fn ($badge) => [
                    'id' => $badge->id,
                    'name' => $badge->name,
                    'slug' => $badge->slug,
                    'description' => $badge->description,
                    'icon' => $badge->icon,
                    'icon_key' => $badge->icon_key,
                    'level' => $badge->level,
                    'awarded_at' => $badge->pivot->awarded_at,
                ]);
            }),
        ];
    }
}
