<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\Category;
use App\Models\Tag;
use App\Models\User;
use App\Models\Comment;
use App\Models\WikiArticle;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class HomeController extends Controller
{
    public function index()
    {
        try {
            // Try to get data from API first
            $response = Http::timeout(5)->get(config('app.url') . '/api/v1/stats/homepage');
            
            if ($response->successful()) {
                $apiData = $response->json();
                return view('welcome', $apiData);
            }
        } catch (\Exception $e) {
            // Fallback to direct database queries
            Log::warning('API call failed, using fallback data: ' . $e->getMessage());
        }
        
        // Fallback data
        $cacheKey = 'homepage:fallback:data';
        $data = Cache::remember($cacheKey, 300, function () {
            return [
                'stats' => $this->getStats(),
                'trendingPosts' => $this->getTrendingPosts(),
                'latestPosts' => $this->getLatestPosts(),
                'categories' => $this->getPopularCategories(),
                'trendingTags' => $this->getTrendingTags(),
                'topUsers' => $this->getTopUsers(),
                'featuredPost' => $this->getFeaturedPost(),
            ];
        });

        return view('welcome', $data);
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
                'total' => Comment::count(),
                'today' => Comment::whereDate('created_at', today())->count(),
            ],
            'wiki' => [
                'articles' => WikiArticle::where('status', 'published')->count(),
            ],
        ];
    }

    private function getTrendingPosts()
    {
        return Post::with(['user.level', 'tags', 'category'])
            ->where('status', 'published')
            ->where('created_at', '>=', now()->subDays(7))
            ->orderByDesc('score')
            ->orderByDesc('answers_count')
            ->limit(6)
            ->get();
    }

    private function getLatestPosts()
    {
        return Post::with(['user.level', 'tags', 'category'])
            ->where('status', 'published')
            ->latest()
            ->limit(8)
            ->get();
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
                $category->icon = $this->getCategoryIcon($category->slug);
                return $category;
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
            ->where('xp', '>', 50)
            ->withCount(['posts' => fn($q) => $q->where('status', 'published')])
            ->orderByDesc('xp')
            ->limit(5)
            ->get();
    }

    private function getFeaturedPost()
    {
        return Post::with(['user.level', 'tags', 'category'])
            ->where('status', 'published')
            ->where('score', '>=', 5)
            ->where('answers_count', '>=', 2)
            ->orderByDesc('score')
            ->first();
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