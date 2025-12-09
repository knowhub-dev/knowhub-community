<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\CodeRun;
use App\Models\Comment;
use App\Models\Post;
use App\Models\User;
use App\Models\WikiArticle;
use App\Models\XpTransaction;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class StatsController extends Controller
{
    public function public()
    {
        $cacheKey = 'public:stats';

        $stats = Cache::remember($cacheKey, 1800, function () {
            return [
                'users' => [
                    'total' => User::count(),
                    'active_today' => User::whereDate('updated_at', today())->count(),
                    'new_this_week' => User::whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
                    'active_this_month' => User::where('updated_at', '>=', now()->subMonth())->count(),
                ],
                'posts' => [
                    'total' => Post::where('status', 'published')->count(),
                    'today' => Post::where('status', 'published')->whereDate('created_at', today())->count(),
                    'this_week' => Post::where('status', 'published')
                        ->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])
                        ->count(),
                    'this_month' => Post::where('status', 'published')
                        ->whereMonth('created_at', now()->month)
                        ->count(),
                ],
                'comments' => [
                    'total' => Comment::count(),
                    'today' => Comment::whereDate('created_at', today())->count(),
                    'this_week' => Comment::whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
                ],
                'wiki' => [
                    'articles' => WikiArticle::where('status', 'published')->count(),
                    'total_versions' => WikiArticle::sum('version'),
                ],
                'code_runs' => [
                    'total' => CodeRun::count(),
                    'successful' => CodeRun::where('status', 'success')->count(),
                    'today' => CodeRun::whereDate('created_at', today())->count(),
                    'languages' => CodeRun::selectRaw('language, COUNT(*) as count')
                        ->groupBy('language')
                        ->orderByDesc('count')
                        ->limit(5)
                        ->get(),
                ],
                'categories' => Category::withCount(['posts' => fn ($q) => $q->where('status', 'published')])
                    ->orderByDesc('posts_count')
                    ->limit(8)
                    ->get(['id', 'name', 'slug', 'posts_count']),
                'trending_tags' => DB::table('post_tag')
                    ->join('tags', 'post_tag.tag_id', '=', 'tags.id')
                    ->join('posts', 'post_tag.post_id', '=', 'posts.id')
                    ->where('posts.created_at', '>=', now()->subDays(7))
                    ->where('posts.status', 'published')
                    ->select('tags.name', 'tags.slug', DB::raw('COUNT(*) as usage_count'))
                    ->groupBy('tags.id', 'tags.name', 'tags.slug')
                    ->orderByDesc('usage_count')
                    ->limit(15)
                    ->get(),
                'top_users' => User::with('level')
                    ->where('xp', '>', 50)
                    ->withCount(['posts' => fn ($q) => $q->where('status', 'published')])
                    ->orderByDesc('xp')
                    ->limit(5)
                    ->get(['id', 'name', 'username', 'avatar_url', 'xp', 'posts_count']),
                'featured_post' => Post::with(['user.level', 'tags', 'category'])
                    ->where('status', 'published')
                    ->where('score', '>=', 5)
                    ->where('answers_count', '>=', 2)
                    ->orderByDesc('score')
                    ->first(),
            ];
        });

        return response()->json($stats);
    }

    public function homepage()
    {
        $cacheKey = 'homepage:stats';

        $data = Cache::remember($cacheKey, 600, function () {
            return [
                'stats' => [
                    'users' => [
                        'total' => User::count(),
                        'active_today' => User::whereDate('updated_at', today())->count(),
                        'new_this_week' => User::whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
                    ],
                    'posts' => [
                        'total' => Post::where('status', 'published')->count(),
                        'today' => Post::where('status', 'published')->whereDate('created_at', today())->count(),
                        'this_week' => Post::where('status', 'published')->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
                    ],
                    'comments' => [
                        'total' => Comment::count(),
                        'today' => Comment::whereDate('created_at', today())->count(),
                    ],
                    'wiki' => [
                        'articles' => WikiArticle::where('status', 'published')->count(),
                    ],
                ],
                'trending_posts' => Post::with(['user.level', 'tags', 'category'])
                    ->where('status', 'published')
                    ->where('created_at', '>=', now()->subDays(7))
                    ->orderByDesc('score')
                    ->orderByDesc('answers_count')
                    ->limit(6)
                    ->get(),
                'latest_posts' => Post::with(['user.level', 'tags', 'category'])
                    ->where('status', 'published')
                    ->latest()
                    ->limit(8)
                    ->get(),
                'categories' => Category::withCount(['posts' => function ($q) {
                    $q->where('status', 'published')
                        ->where('created_at', '>=', now()->subDays(30));
                }])
                    ->having('posts_count', '>', 0)
                    ->orderByDesc('posts_count')
                    ->limit(8)
                    ->get(),
                'trending_tags' => DB::table('post_tag')
                    ->join('tags', 'post_tag.tag_id', '=', 'tags.id')
                    ->join('posts', 'post_tag.post_id', '=', 'posts.id')
                    ->where('posts.created_at', '>=', now()->subDays(7))
                    ->where('posts.status', 'published')
                    ->select('tags.id', 'tags.name', 'tags.slug', DB::raw('COUNT(*) as usage_count'))
                    ->groupBy('tags.id', 'tags.name', 'tags.slug')
                    ->orderByDesc('usage_count')
                    ->limit(15)
                    ->get(),
                'top_users' => User::with('level')
                    ->where('xp', '>', 50)
                    ->withCount(['posts' => fn ($q) => $q->where('status', 'published')])
                    ->orderByDesc('xp')
                    ->limit(5)
                    ->get(),
                'featured_post' => Post::with(['user.level', 'tags', 'category'])
                    ->where('status', 'published')
                    ->where('score', '>=', 5)
                    ->where('answers_count', '>=', 2)
                    ->orderByDesc('score')
                    ->first(),
            ];
        });

        return response()->json($data);
    }

    public function weeklyHeroes()
    {
        $startOfWeek = now()->startOfWeek();
        $endOfWeek = now()->endOfWeek();

        $xpLeaders = XpTransaction::query()
            ->with(['user:id,name,username,avatar_url,xp'])
            ->whereBetween('created_at', [$startOfWeek, $endOfWeek])
            ->select('user_id', DB::raw('SUM(amount) as total_xp'))
            ->groupBy('user_id')
            ->orderByDesc('total_xp')
            ->limit(5)
            ->get()
            ->map(function (XpTransaction $transaction) {
                return [
                    'user' => $transaction->user ? $transaction->user->only(['id', 'name', 'username', 'avatar_url', 'xp']) : null,
                    'total_xp' => (int) $transaction->total_xp,
                ];
            })
            ->filter(fn ($item) => $item['user'] !== null)
            ->values();

        $postLeaders = Post::query()
            ->with(['user:id,name,username,avatar_url,xp'])
            ->where('status', 'published')
            ->whereBetween('created_at', [$startOfWeek, $endOfWeek])
            ->select('user_id', DB::raw('SUM(score) as total_score'), DB::raw('COUNT(*) as posts_count'))
            ->groupBy('user_id')
            ->orderByDesc(DB::raw('SUM(score)'))
            ->orderByDesc(DB::raw('COUNT(*)'))
            ->limit(5)
            ->get()
            ->map(function (Post $post) {
                return [
                    'user' => $post->user ? $post->user->only(['id', 'name', 'username', 'avatar_url', 'xp']) : null,
                    'total_score' => (int) ($post->total_score ?? 0),
                    'posts_count' => (int) ($post->posts_count ?? 0),
                ];
            })
            ->filter(fn ($item) => $item['user'] !== null)
            ->values();

        return response()->json([
            'range' => [
                'start' => $startOfWeek->toISOString(),
                'end' => $endOfWeek->toISOString(),
            ],
            'xp' => $xpLeaders,
            'post_authors' => $postLeaders,
        ]);
    }
}
