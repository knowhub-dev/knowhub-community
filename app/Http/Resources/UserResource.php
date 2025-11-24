<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'username' => $this->username,
            'avatar_url' => $this->avatar_url,
            'xp' => $this->xp,
            'level' => $this->level?->only(['id', 'name', 'min_xp', 'icon']),
            'badges' => $this->whenLoaded('badges', function () {
                return $this->badges->map(fn($badge) => [
                    'id' => $badge->id,
                    'name' => $badge->name,
                    'slug' => $badge->slug,
                    'description' => $badge->description,
                    'icon' => $badge->icon,
                    'icon_key' => $badge->icon_key,
                    'level' => $badge->level,
                    'awarded_at' => $badge->pivot->awarded_at
                ]);
            }),
        ];
    }
}