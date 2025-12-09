<?php

// file: app/Http/Controllers/Api/V1/CategoryController.php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $cacheKey = 'categories:list';

        return Cache::remember($cacheKey, 1800, function () {
            return Category::select('id', 'name', 'slug', 'description')
                ->withCount(['posts' => function ($q) {
                    $q->where('status', 'published');
                }])
                ->orderBy('name')
                ->get();
        });
    }

    public function show(string $slug)
    {
        $category = Category::where('slug', $slug)->firstOrFail();

        $cacheKey = "category:stats:{$slug}";

        $stats = Cache::remember($cacheKey, 600, function () use ($category) {
            return [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'description' => $category->description,
                'posts_count' => $category->posts()->where('status', 'published')->count(),
                'recent_posts_count' => $category->posts()
                    ->where('status', 'published')
                    ->where('created_at', '>=', now()->subDays(7))
                    ->count(),
                'top_contributors' => DB::table('posts')
                    ->join('users', 'posts.user_id', '=', 'users.id')
                    ->where('posts.category_id', $category->id)
                    ->where('posts.status', 'published')
                    ->select('users.id', 'users.name', 'users.username', 'users.avatar_url', DB::raw('COUNT(*) as posts_count'))
                    ->groupBy('users.id', 'users.name', 'users.username', 'users.avatar_url')
                    ->orderByDesc('posts_count')
                    ->limit(5)
                    ->get(),
                'popular_tags' => DB::table('post_tag')
                    ->join('tags', 'post_tag.tag_id', '=', 'tags.id')
                    ->join('posts', 'post_tag.post_id', '=', 'posts.id')
                    ->where('posts.category_id', $category->id)
                    ->where('posts.status', 'published')
                    ->select('tags.name', 'tags.slug', DB::raw('COUNT(*) as usage_count'))
                    ->groupBy('tags.id', 'tags.name', 'tags.slug')
                    ->orderByDesc('usage_count')
                    ->limit(10)
                    ->get(),
            ];
        });

        return response()->json($stats);
    }
}
