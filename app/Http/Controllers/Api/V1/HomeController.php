<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\PostResource;
use App\Models\Category;
use App\Models\Post;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class HomeController extends Controller
{
    public function index()
    {
        $cacheKey = 'homepage:data';

        $data = Cache::remember($cacheKey, 600, function () {
            return [
                'trending_posts' => $this->getTrendingPosts(),
                'latest_posts' => $this->getLatestPosts(),
                'popular_categories' => $this->getPopularCategories(),
                'trending_tags' => $this->getTrendingTags(),
                'top_users' => $this->getTopUsers(),
                'stats' => $this->getStats(),
                'featured_post' => $this->getFeaturedPost(),
            ];
        });

        return response()->json($data);
    }

    private function getTrendingPosts()
    {
        return PostResource::collection(
            Post::with(['user.level', 'tags', 'category'])
                ->where('status', 'published')
                ->where('created_at', '>=', now()->subDays(7))
                ->orderByDesc('score')
                ->orderByDesc('answers_count')
                ->limit(6)
                ->get()
        );
    }

    private function getLatestPosts()
    {
        return PostResource::collection(
            Post::with(['user.level', 'tags', 'category'])
                ->where('status', 'published')
                ->latest()
                ->limit(8)
                ->get()
        );
    }

    private function getPopularCategories()
    {
        return Category::select('id', 'name', 'slug', 'description')
            ->withCount(['posts' => function ($q) {
                $q->where('status', 'published')
                    ->where('created_at', '>=', now()->subDays(30));
            }])
            ->having('posts_count', '>', 0)
            ->orderByDesc('posts_count')
            ->limit(8)
            ->get()
            ->map(function ($category) {
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                    'description' => $category->description,
                    'posts_count' => $category->posts_count,
                    'icon' => $this->getCategoryIcon($category->slug),
                ];
            });
    }

    private function getTrendingTags()
    {
        return DB::table('post_tag')
            ->join('tags', 'post_tag.tag_id', '=', 'tags.id')
            ->join('posts', 'post_tag.post_id', '=', 'posts.id')
            ->where('posts.created_at', '>=', now()->subDays(7))
            ->where('posts.status', 'published')
            ->select('tags.id', 'tags.name', 'tags.slug', DB::raw('COUNT(*) as usage_count'))
            ->groupBy('tags.id', 'tags.name', 'tags.slug')
            ->orderByDesc('usage_count')
            ->limit(15)
            ->get();
    }

    private function getTopUsers()
    {
        return User::with('level')
            ->where('xp', '>', 100)
            ->orderByDesc('xp')
            ->limit(5)
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'username' => $user->username,
                    'avatar_url' => $user->avatar_url,
                    'xp' => $user->xp,
                    'level' => $user->level?->only(['id', 'name', 'min_xp']),
                    'posts_count' => $user->posts()->where('status', 'published')->count(),
                ];
            });
    }

    private function getStats()
    {
        return [
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
                'total' => DB::table('comments')->count(),
                'today' => DB::table('comments')->whereDate('created_at', today())->count(),
            ],
            'wiki' => [
                'articles' => DB::table('wiki_articles')->where('status', 'published')->count(),
            ],
        ];
    }

    private function getFeaturedPost()
    {
        $post = Post::with(['user.level', 'tags', 'category'])
            ->where('status', 'published')
            ->where('score', '>=', 10)
            ->where('answers_count', '>=', 3)
            ->orderByDesc('score')
            ->first();

        return $post ? new PostResource($post) : null;
    }

    private function getCategoryIcon($slug)
    {
        $icons = [
            'dasturlash' => '💻',
            'ai' => '🤖',
            'cybersecurity' => '🔒',
            'open-source' => '🌐',
            'devops' => '⚙️',
            'web-development' => '🌍',
            'mobile-development' => '📱',
            'database' => '🗄️',
            'frontend' => '🎨',
            'backend' => '⚡',
        ];

        return $icons[$slug] ?? '📁';
    }
}
