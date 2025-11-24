<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\Comment;
use App\Models\Post;
use App\Models\UserBadge;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ActivityFeedController extends Controller
{
    public function index(Request $request)
    {
        $limit = (int) $request->integer('limit', 20);
        $limit = max(5, min($limit, 50));

        $activities = Activity::query()
            ->with([
                'user:id,name,username,avatar_url',
                'subject' => function (MorphTo $morphTo) {
                    $morphTo->morphWith([
                        Post::class => ['user:id,name,username,avatar_url'],
                        Comment::class => ['user:id,name,username,avatar_url', 'post:id,title,slug'],
                        UserBadge::class => ['badge:id,name,slug,icon,xp_reward', 'user:id,name,username,avatar_url'],
                    ]);
                },
            ])
            ->latest()
            ->limit($limit)
            ->get();

        $morphMap = array_flip(Relation::morphMap());

        $events = $activities
            ->map(function (Activity $activity) use ($morphMap) {
                $subject = $activity->subject;
                $type = $activity->subject_type
                    ? ($morphMap[$activity->subject_type] ?? Str::kebab(class_basename((string) $activity->subject_type)))
                    : 'activity';

                $payload = null;
                if ($subject instanceof Post) {
                    $payload = [
                        'title' => $subject->title,
                        'slug' => $subject->slug,
                    ];
                } elseif ($subject instanceof Comment) {
                    $payload = [
                        'excerpt' => Str::of($subject->content_markdown ?? '')
                            ->replaceMatches('/\s+/', ' ')
                            ->stripTags()
                            ->limit(140, '…')
                            ->value(),
                        'post' => $subject->post ? [
                            'id' => $subject->post->id,
                            'slug' => $subject->post->slug,
                            'title' => $subject->post->title,
                        ] : null,
                    ];
                } elseif ($subject instanceof UserBadge) {
                    $payload = $subject->badge ? [
                        'name' => $subject->badge->name,
                        'slug' => $subject->badge->slug,
                        'icon' => $subject->badge->icon,
                        'xp_reward' => $subject->badge->xp_reward,
                    ] : null;
                }

                return [
                    'type' => $type,
                    'id' => $activity->id,
                    'created_at' => optional($activity->created_at)->toISOString(),
                    'user' => $activity->user ? [
                        'id' => $activity->user->id,
                        'name' => $activity->user->name,
                        'username' => $activity->user->username,
                        'avatar_url' => $activity->user->avatar_url,
                    ] : null,
                    'payload' => $payload,
                    'verb' => $activity->verb ?? 'created',
                ];
            })
            ->take($limit)
            ->values()
            ->all();

        return response()->json([
            'data' => $events,
            'meta' => [
                'limit' => $limit,
            ],
        ]);
    }
}
