<?php

namespace App\Listeners;

use App\Events\PostCreated;
use App\Services\Gamification\BadgeService;
use App\Models\Post;
use App\Models\XpTransaction;

class GamificationListener
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(PostCreated $event): void
    {
        $user = $event->post->user;

        // Award XP for creating a post (idempotent)
        $alreadyRewarded = XpTransaction::where([
            'user_id' => $user->id,
            'reason' => 'post_created',
            'subject_id' => $event->post->id,
            'subject_type' => Post::class,
        ])->exists();

        if (! $alreadyRewarded) {
            XpTransaction::create([
                'user_id' => $user->id,
                'amount' => 10,
                'reason' => 'post_created',
                'subject_id' => $event->post->id,
                'subject_type' => Post::class,
            ]);

            $user->increment('xp', 10);
        }

        // Check for and award badges
        $user->loadCount([
            'posts as posts_count' => fn ($q) => $q->where('status', 'published'),
        ]);

        app(BadgeService::class)->checkAndAward($user, 'post_created');
    }
}
