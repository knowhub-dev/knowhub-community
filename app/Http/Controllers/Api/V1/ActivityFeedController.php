<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\Post;
use App\Models\UserBadge;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ActivityFeedController extends Controller
{
    public function index(Request $request)
    {
        $limit = (int) $request->integer('limit', 20);
        $limit = max(5, min($limit, 50));

        $posts = Post::query()
            ->with(['user:id,name,username,avatar_url'])
            ->where('status', 'published')
            ->latest()
            ->limit($limit)
            ->get(['id', 'user_id', 'title', 'slug', 'created_at'])
            ->map(function (Post $post) {
                return [
                    'type' => 'post',
                    'id' => $post->id,
                    'created_at' => $post->created_at,
                    'user' => $post->user ? [
                        'id' => $post->user->id,
                        'name' => $post->user->name,
                        'username' => $post->user->username,
                        'avatar_url' => $post->user->avatar_url,
                    ] : null,
                    'payload' => [
                        'title' => $post->title,
                        'slug' => $post->slug,
                    ],
                ];
            });

        $comments = Comment::query()
            ->with(['user:id,name,username,avatar_url', 'post:id,title,slug'])
            ->latest()
            ->limit($limit)
            ->get(['id', 'user_id', 'post_id', 'content_markdown', 'created_at'])
            ->map(function (Comment $comment) {
                $excerpt = Str::of($comment->content_markdown ?? '')
                    ->replaceMatches('/\s+/', ' ')
                    ->stripTags()
                    ->limit(140, '…')
                    ->value();

                return [
                    'type' => 'comment',
                    'id' => $comment->id,
                    'created_at' => $comment->created_at,
                    'user' => $comment->user ? [
                        'id' => $comment->user->id,
                        'name' => $comment->user->name,
                        'username' => $comment->user->username,
                        'avatar_url' => $comment->user->avatar_url,
                    ] : null,
                    'payload' => [
                        'excerpt' => $excerpt,
                        'post' => $comment->post ? [
                            'id' => $comment->post->id,
                            'slug' => $comment->post->slug,
                            'title' => $comment->post->title,
                        ] : null,
                    ],
                ];
            });

        $badges = UserBadge::query()
            ->with(['user:id,name,username,avatar_url', 'badge:id,name,slug,icon,xp_reward'])
            ->latest('awarded_at')
            ->limit($limit)
            ->get(['user_id', 'badge_id', 'awarded_at'])
            ->map(function (UserBadge $userBadge) {
                return [
                    'type' => 'badge',
                    'id' => sprintf('%d-%d', $userBadge->user_id, $userBadge->badge_id),
                    'created_at' => $userBadge->awarded_at,
                    'user' => $userBadge->user ? [
                        'id' => $userBadge->user->id,
                        'name' => $userBadge->user->name,
                        'username' => $userBadge->user->username,
                        'avatar_url' => $userBadge->user->avatar_url,
                    ] : null,
                    'payload' => $userBadge->badge ? [
                        'name' => $userBadge->badge->name,
                        'slug' => $userBadge->badge->slug,
                        'icon' => $userBadge->badge->icon,
                        'xp_reward' => $userBadge->badge->xp_reward,
                    ] : null,
                ];
            });

        $events = $posts
            ->merge($comments)
            ->merge($badges)
            ->sortByDesc(fn (array $event) => $event['created_at'])
            ->values()
            ->take($limit)
            ->map(function (array $event) {
                $event['created_at'] = optional($event['created_at'])->toISOString();
                return $event;
            })
            ->all();

        return response()->json([
            'data' => $events,
            'meta' => [
                'limit' => $limit,
            ],
        ]);
    }
}
