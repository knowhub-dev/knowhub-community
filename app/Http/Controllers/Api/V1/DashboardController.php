<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\PostResource;
use App\Models\CodeRun;
use App\Models\Comment;
use App\Models\Post;
use App\Models\User;
use App\Models\XpTransaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'profile' => $user,
            'stats' => json_decode($this->stats($request)->getContent(), true),
            'activity' => json_decode($this->activity($request)->getContent(), true),
        ]);
    }

    public function stats(Request $request): JsonResponse
    {
        $user = $request->user();

        $stats = Cache::remember("dashboard:stats:user:{$user->id}", 300, function () use ($user) {
            $publishedPosts = $user->posts()->where('status', 'published');
            $recentComments = $user->comments();

            $postsCount = (int) $publishedPosts->count();
            $lastWeekPosts = (int) $publishedPosts->where('created_at', '>=', now()->subDays(7))->count();

            return [
                'posts' => $postsCount,
                'comments' => (int) $recentComments->count(),
                'answers' => (int) $user->posts()->sum('answers_count'),
                'followers' => (int) $user->followers()->count(),
                'velocity' => $lastWeekPosts,
                'response_time_hours' => null,
                'impact_score' => (int) $user->posts()->sum('score'),
                'reputation' => (int) $user->xpTransactions()->sum('amount'),
            ];
        });

        return response()->json($stats);
    }

    public function trending(): JsonResponse
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

        $highlights = collect($trending['posts'])
            ->take(3)
            ->map(fn (Post $post) => sprintf('%s is trending', $post->title))
            ->values()
            ->toArray();

        $feed = collect($trending['posts'])
            ->take(5)
            ->map(function (Post $post) {
                return [
                    'id' => "trending-post-{$post->id}",
                    'type' => 'achievement',
                    'title' => $post->title,
                    'description' => 'Community highlight',
                    'created_at' => (string) $post->created_at,
                    'href' => url("/api/v1/posts/{$post->slug}"),
                ];
            })
            ->values();

        return response()->json([
            'feed' => $feed,
            'highlights' => $highlights,
            'posts' => $trending['posts'],
            'tags' => $trending['tags'],
            'users' => $trending['users'],
        ]);
    }

    public function activity(Request $request): JsonResponse
    {
        $user = $request->user();
        $cacheKey = "dashboard:activity:{$user->id}";

        $activity = Cache::remember($cacheKey, 300, function () use ($user) {
            $feed = collect();

            $user->posts()
                ->with(['tags', 'category'])
                ->latest()
                ->limit(5)
                ->get()
                ->each(function (Post $post) use ($feed) {
                    $feed->push([
                        'id' => "post-{$post->id}",
                        'type' => 'achievement',
                        'title' => $post->title,
                        'description' => 'Published a new post',
                        'created_at' => (string) $post->created_at,
                        'href' => url("/api/v1/posts/{$post->slug}"),
                        'meta' => [
                            'score' => $post->score,
                            'answers' => $post->answers_count,
                        ],
                    ]);
                });

            $user->comments()
                ->with('post:id,title,slug')
                ->latest()
                ->limit(5)
                ->get()
                ->each(function (Comment $comment) use ($feed) {
                    $feed->push([
                        'id' => "comment-{$comment->id}",
                        'type' => 'comment',
                        'title' => optional($comment->post)->title ? 'Replied to a post' : 'Commented',
                        'description' => $comment->content ?? $comment->body,
                        'created_at' => (string) $comment->created_at,
                        'href' => $comment->post?->slug ? url("/api/v1/posts/{$comment->post->slug}") : null,
                    ]);
                });

            $this->getFollowingActivity($user)
                ->each(function (Post $post) use ($feed) {
                    $feed->push([
                        'id' => "follow-{$post->id}",
                        'type' => 'achievement',
                        'title' => "{$post->user->name} shipped {$post->title}",
                        'description' => 'From your network',
                        'created_at' => (string) $post->created_at,
                    ]);
                });

            $highlights = [
                sprintf('%d posts published', $user->posts()->count()),
                sprintf('%d contributions this week', $user->comments()->where('created_at', '>=', now()->subDays(7))->count()),
            ];

            return [
                'feed' => $feed->sortByDesc('created_at')->values(),
                'highlights' => array_filter($highlights),
                'contributions' => $this->contributionHistory($user),
            ];
        });

        return response()->json($activity);
    }

    private function getFollowingActivity(User $user)
    {
        $followingIds = $user->following()->pluck('users.id');

        if ($followingIds->isEmpty()) {
            return collect();
        }

        return Post::with(['user', 'tags'])
            ->whereIn('user_id', $followingIds)
            ->where('status', 'published')
            ->where('created_at', '>=', now()->subDays(7))
            ->orderByDesc('created_at')
            ->limit(10)
            ->get();
    }

    public function analytics(Request $request): JsonResponse
    {
        $period = $request->get('period', '30'); // days
        $startDate = now()->subDays((int) $period);

        $cacheKey = "dashboard:analytics:{$period}";

        $analytics = Cache::remember($cacheKey, 1800, function () use ($startDate, $request) {
            $user = $request->user();

            return [
                'activity' => [
                    'highlights' => [
                        'Engagement is rising',
                        'XP earned from coding sessions',
                    ],
                    'contributions' => $this->contributionHistory($user),
                ],
                'stats' => [
                    'velocity' => Post::where('user_id', $user->id)
                        ->where('status', 'published')
                        ->where('created_at', '>=', $startDate)
                        ->count(),
                    'impact_score' => (int) Post::where('user_id', $user->id)->sum('score'),
                ],
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

    public function contributions(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'contributions' => $this->contributionHistory($user),
        ]);
    }

    public function missions(Request $request): JsonResponse
    {
        $user = $request->user();
        $postCount = (int) $user->posts()->count();
        $commentCount = (int) $user->comments()->count();

        $missions = [
            [
                'title' => 'Ship your first post',
                'status' => $postCount > 0 ? 'done' : 'in-progress',
                'completion' => min(100, $postCount > 0 ? 100 : 40),
                'reward' => '+50 XP',
            ],
            [
                'title' => 'Join the conversation',
                'status' => $commentCount >= 3 ? 'done' : 'in-progress',
                'completion' => min(100, $commentCount * 30),
                'reward' => '+30 XP',
            ],
            [
                'title' => 'Weekly streak',
                'status' => $postCount >= 3 ? 'in-progress' : 'pending',
                'completion' => min(100, $postCount * 20),
                'reward' => 'Streak booster',
            ],
        ];

        return response()->json(['missions' => $missions]);
    }

    public function posts(Request $request): JsonResponse
    {
        $user = $request->user();

        $posts = $user->posts()
            ->with(['tags', 'category'])
            ->latest()
            ->paginate($request->integer('per_page', 10));

        return PostResource::collection($posts)
            ->additional(['meta' => ['total' => $posts->total()]])
            ->response();
    }

    /**
     * @return array<int,array{day:string,value:int}>
     */
    private function contributionHistory(User $user): array
    {
        $history = $user->xpTransactions()
            ->selectRaw('DATE(created_at) as day, SUM(amount) as value')
            ->groupBy('day')
            ->orderBy('day')
            ->get();

        if ($history->isEmpty()) {
            return collect(range(0, 6))
                ->map(function (int $offset) {
                    $day = Carbon::today()->subDays($offset)->toDateString();

                    return ['day' => $day, 'value' => 0];
                })
                ->values()
                ->toArray();
        }

        return $history
            ->map(fn (XpTransaction $transaction) => [
                'day' => $transaction->day,
                'value' => (int) $transaction->value,
            ])
            ->toArray();
    }
}
