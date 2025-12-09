<?php

namespace App\Services\Gamification;

use App\Models\Badge;
use App\Models\User;
use Illuminate\Support\Str;

class BadgeService
{
    /**
     * Check user actions and award eligible badges without duplicates.
     *
     * @return array<int, Badge> List of newly awarded badges
     */
    public function checkAndAward(User $user, string $actionType): array
    {
        $awarded = [];

        if ($actionType === 'post_published' || $actionType === 'post_created') {
            if ($badge = $this->qualifiesForAuthor($user)) {
                $awarded[] = $badge;
            }
        }

        return $awarded;
    }

    private function qualifiesForAuthor(User $user): ?Badge
    {
        $authorBadge = $this->findBadge('author', 'Author');

        if (! $authorBadge) {
            return null;
        }

        $postsCount = $user->posts_count ?? $user->posts()->where('status', 'published')->count();

        if ($postsCount < 10 || $this->alreadyHasBadge($user, $authorBadge->id)) {
            return null;
        }

        $user->badges()->attach($authorBadge->id, ['awarded_at' => now()]);

        return $authorBadge;
    }

    private function findBadge(string $slug, string $fallbackName): ?Badge
    {
        $badge = Badge::where('slug', $slug)->first();

        if ($badge) {
            return $badge;
        }

        return Badge::where('slug', Str::slug($fallbackName))->first();
    }

    private function alreadyHasBadge(User $user, int $badgeId): bool
    {
        return $user->badges()->where('badges.id', $badgeId)->exists();
    }
}
