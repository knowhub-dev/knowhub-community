<?php

// file: app/Http/Controllers/Api/V1/TagController.php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class TagController extends Controller
{
    public function index(Request $request)
    {
        $cacheKey = 'tags:list:'.($request->get('popular') ? 'popular' : 'all');

        return Cache::remember($cacheKey, 1800, function () use ($request) {
            $query = Tag::select('id', 'name', 'slug');

            if ($request->get('popular')) {
                $query->withCount(['posts' => function ($q) {
                    $q->where('status', 'published')
                        ->where('created_at', '>=', now()->subDays(30));
                }])
                    ->having('posts_count', '>', 0)
                    ->orderByDesc('posts_count');
            } else {
                $query->orderBy('name');
            }

            return $query->get();
        });
    }

    public function show(string $slug)
    {
        $tag = Tag::where('slug', $slug)->firstOrFail();

        $cacheKey = "tag:stats:{$slug}";

        $stats = Cache::remember($cacheKey, 600, function () use ($tag) {
            return [
                'id' => $tag->id,
                'name' => $tag->name,
                'slug' => $tag->slug,
                'posts_count' => $tag->posts()->where('status', 'published')->count(),
                'recent_posts_count' => $tag->posts()
                    ->where('status', 'published')
                    ->where('created_at', '>=', now()->subDays(7))
                    ->count(),
                'top_contributors' => DB::table('posts')
                    ->join('post_tag', 'posts.id', '=', 'post_tag.post_id')
                    ->join('users', 'posts.user_id', '=', 'users.id')
                    ->where('post_tag.tag_id', $tag->id)
                    ->where('posts.status', 'published')
                    ->select('users.id', 'users.name', 'users.username', 'users.avatar_url', DB::raw('COUNT(*) as posts_count'))
                    ->groupBy('users.id', 'users.name', 'users.username', 'users.avatar_url')
                    ->orderByDesc('posts_count')
                    ->limit(5)
                    ->get(),
                'related_tags' => $this->getRelatedTags($tag),
            ];
        });

        return response()->json($stats);
    }

    public function trending()
    {
        $cacheKey = 'tags:trending';

        $trendingTags = Cache::remember($cacheKey, 600, function () {
            return DB::table('post_tag')
                ->join('tags', 'post_tag.tag_id', '=', 'tags.id')
                ->join('posts', 'post_tag.post_id', '=', 'posts.id')
                ->where('posts.created_at', '>=', now()->subDays(7))
                ->where('posts.status', 'published')
                ->select('tags.id', 'tags.name', 'tags.slug', DB::raw('COUNT(*) as usage_count'))
                ->groupBy('tags.id', 'tags.name', 'tags.slug')
                ->orderByDesc('usage_count')
                ->limit(20)
                ->get();
        });

        return response()->json($trendingTags);
    }

    private function getRelatedTags(Tag $tag)
    {
        return DB::table('post_tag as pt1')
            ->join('post_tag as pt2', 'pt1.post_id', '=', 'pt2.post_id')
            ->join('tags', 'pt2.tag_id', '=', 'tags.id')
            ->where('pt1.tag_id', $tag->id)
            ->where('pt2.tag_id', '!=', $tag->id)
            ->select('tags.id', 'tags.name', 'tags.slug', DB::raw('COUNT(*) as co_occurrence'))
            ->groupBy('tags.id', 'tags.name', 'tags.slug')
            ->orderByDesc('co_occurrence')
            ->limit(10)
            ->get();
    }
}
