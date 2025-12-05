<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\PostResource;
use App\Models\Post;
use App\Models\User;
use App\Models\Comment;
use App\Models\WikiArticle;
use App\Models\CodeRun;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats()
    {
        $cacheKey = 'dashboard:stats';

        $stats = Cache::remember($cacheKey, 300, function () {
            return [
                'users' => [
                    'total' => User::count(),
                    'active_today' => User::whereDate('updated_at', today())->count(),
                    'new_this_month' => User::whereMonth('created_at', now()->month)->count(),
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
                    'proposals' => WikiArticle::has('proposals')->count(),
                ],
                'code_runs' => [
                    'total' => CodeRun::count(),
                    'successful' => CodeRun::where('status', 'success')->count(),
                    'today' => CodeRun::whereDate('created_at', today())->count(),
                ],
            ];
        });

        return response()->json($stats);
    }

    public function trending()
    {
        $cacheKey = 'dashboard:trending';
        
        $trending = Cache::remember($cacheKey, 600, function () {
            return [
                'posts' => Post::with(['user', 'tags', 'category'])
                    ->where('status', 'published')
                    ->where('created_at', '>=', now()->subDays(7))
                    ->orderByDesc('score')
                    ->limit(10)
                    ->get(),
                'tags' => DB::table('post_tag')
                    ->join('tags', 'post_tag.tag_id', '=', 'tags.id')
                    ->join('posts', 'post_tag.post_id', '=', 'posts.id')
                    ->where('posts.created_at', '>=', now()->subDays(30))
                    ->where('posts.status', 'published')
                    ->select('tags.name', 'tags.slug', DB::raw('COUNT(*) as usage_count'))
                    ->groupBy('tags.id', 'tags.name', 'tags.slug')
                    ->orderByDesc('usage_count')
                    ->limit(20)
                    ->get(),
                'users' => User::with('level')
                    ->where('created_at', '>=', now()->subDays(30))
                    ->orWhere('updated_at', '>=', now()->subDays(7))
                    ->orderByDesc('xp')
                    ->limit(10)
                    ->get(),
            ];
        });

        return response()->json($trending);
    }

    public function posts(Request $request)
    {
        $perPage = (int) $request->input('per_page', 10);

        $query = Post::query()
            ->with(['user.level', 'tags', 'category'])
            ->where('status', 'published')
            ->latest();

        $pagination = $query->paginate($perPage);

        return response()->json([
            'data' => PostResource::collection($pagination->items()),
            'meta' => [
                'current_page' => $pagination->currentPage(),
                'last_page' => $pagination->lastPage(),
                'per_page' => $pagination->perPage(),
                'total' => $pagination->total(),
                'next_page_url' => $pagination->nextPageUrl(),
            ],
        ]);
    }

    public function activity(Request $request)
    {
        $user = $request->user();
        $cacheKey = "dashboard:activity:{$user->id}";
        
        $activity = Cache::remember($cacheKey, 300, function () use ($user) {
            return [
                'recent_posts' => $user->posts()
                    ->with(['tags', 'category'])
                    ->latest()
                    ->limit(5)
                    ->get(),
                'recent_comments' => $user->comments()
                    ->with('post:id,title,slug')
                    ->latest()
                    ->limit(5)
                    ->get(),
                'bookmarked_posts' => $user->bookmarks()
                    ->with(['post.user', 'post.tags'])
                    ->latest()
                    ->limit(5)
                    ->get()
                    ->pluck('post'),
                'following_activity' => $this->getFollowingActivity($user),
                'notifications_count' => $user->notifications()->unread()->count(),
            ];
        });

        return response()->json($activity);
    }

    private function getFollowingActivity(User $user)
    {
        $followingIds = $user->following()->pluck('users.id');
        
        if ($followingIds->isEmpty()) {
            return [];
        }

        return Post::with(['user', 'tags'])
            ->whereIn('user_id', $followingIds)
            ->where('status', 'published')
            ->where('created_at', '>=', now()->subDays(7))
            ->orderByDesc('created_at')
            ->limit(10)
            ->get();
    }

    public function analytics(Request $request)
    {
        $period = $request->get('period', '30'); // days
        $startDate = now()->subDays((int)$period);
        
        $cacheKey = "dashboard:analytics:{$period}";
        
        $analytics = Cache::remember($cacheKey, 1800, function () use ($startDate) {
            return [
                'posts_over_time' => $this->getPostsOverTime($startDate),
                'users_over_time' => $this->getUsersOverTime($startDate),
                'engagement_metrics' => $this->getEngagementMetrics($startDate),
                'popular_categories' => $this->getPopularCategories($startDate),
                'code_execution_stats' => $this->getCodeExecutionStats($startDate),
            ];
        });

        return response()->json($analytics);
    }

    private function getPostsOverTime($startDate)
    {
        return Post::where('status', 'published')
            ->where('created_at', '>=', $startDate)
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();
    }

    private function getUsersOverTime($startDate)
    {
        return User::where('created_at', '>=', $startDate)
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();
    }

    private function getEngagementMetrics($startDate)
    {
        return [
            'avg_comments_per_post' => Post::where('status', 'published')
                ->where('created_at', '>=', $startDate)
                ->avg('answers_count'),
            'avg_score_per_post' => Post::where('status', 'published')
                ->where('created_at', '>=', $startDate)
                ->avg('score'),
            'total_votes' => DB::table('votes')
                ->where('created_at', '>=', $startDate)
                ->count(),
            'active_users' => User::whereHas('posts', function ($q) use ($startDate) {
                $q->where('created_at', '>=', $startDate);
            })->orWhereHas('comments', function ($q) use ($startDate) {
                $q->where('created_at', '>=', $startDate);
            })->count(),
        ];
    }

    private function getPopularCategories($startDate)
    {
        return DB::table('posts')
            ->join('categories', 'posts.category_id', '=', 'categories.id')
            ->where('posts.status', 'published')
            ->where('posts.created_at', '>=', $startDate)
            ->select('categories.name', 'categories.slug', DB::raw('COUNT(*) as posts_count'))
            ->groupBy('categories.id', 'categories.name', 'categories.slug')
            ->orderByDesc('posts_count')
            ->get();
    }

    private function getCodeExecutionStats($startDate)
    {
        return [
            'total_runs' => CodeRun::where('created_at', '>=', $startDate)->count(),
            'success_rate' => CodeRun::where('created_at', '>=', $startDate)
                ->where('status', 'success')
                ->count() / max(1, CodeRun::where('created_at', '>=', $startDate)->count()) * 100,
            'popular_languages' => CodeRun::where('created_at', '>=', $startDate)
                ->selectRaw('language, COUNT(*) as count')
                ->groupBy('language')
                ->orderByDesc('count')
                ->get(),
            'avg_runtime' => CodeRun::where('created_at', '>=', $startDate)
                ->where('status', 'success')
                ->avg('runtime_ms'),
        ];
    }
}