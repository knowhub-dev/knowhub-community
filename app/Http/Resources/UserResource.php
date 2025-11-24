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
            'resume_data' => $this->resume_data,
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
            'stats' => [
                'posts_count' => $this->posts_count ?? $this->posts()->where('status', 'published')->count(),
                'followers_count' => $this->followers_count ?? $this->followers()->count(),
                'following_count' => $this->following_count ?? $this->following()->count(),
            ],
            'featured_projects' => $this->whenLoaded('featuredContainers', function () {
                return $this->featuredContainers->map(fn($container) => [
                    'id' => $container->id,
                    'name' => $container->name,
                    'subdomain' => $container->subdomain,
                    'type' => $container->type,
                    'image' => $container->image,
                    'status' => $container->status,
                    'port' => $container->port,
                    'is_featured' => $container->is_featured,
                    'created_at' => $container->created_at,
                ]);
            }),
            'created_at' => $this->created_at,
            
            // =======================================================
            // MANA O'SHA ENG MUHIM QATOR:
            // =======================================================
            'role' => $this->is_admin ? 'admin' : 'user',
            // =======================================================
        ];
    }
}