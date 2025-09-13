<?php

// file: app/Http/Controllers/Api/V1/PostController.php
namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\PostStoreRequest;
use App\Http\Requests\PostUpdateRequest;
use App\Http\Resources\PostResource;
use App\Models\Post;
use App\Models\Tag;
use App\Models\Category;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use App\Jobs\GeneratePostAiDraft;

class PostController extends Controller
{
    public function index(Request $req)
    {
        $cacheKey = 'posts:' . md5(serialize($req->all()) . ($req->user()?->id ?? 'guest'));
        
        return Cache::remember($cacheKey, 300, function () use ($req) {
            $q = Post::query()->with(['user.level','tags','category'])
                ->where('status','published')
                ->when($req->get('tag'), fn($qq,$tag)=>$qq->whereHas('tags', fn($t)=>$t->where('slug',$tag)))
                ->when($req->get('category'), fn($qq,$cat)=>$qq->whereHas('category', fn($c)=>$c->where('slug',$cat)))
                ->when($req->get('user'), fn($qq,$username)=>$qq->whereHas('user', fn($u)=>$u->where('username',$username)))
                ->when($req->get('search'), function($qq, $search) {
                    $qq->where(function($q) use ($search) {
                        $q->where('title', 'LIKE', "%{$search}%")
                          ->orWhere('content_markdown', 'LIKE', "%{$search}%")
                          ->orWhereHas('tags', fn($t) => $t->where('name', 'LIKE', "%{$search}%"));
                    });
                })
                ->when($req->get('sort') === 'latest', fn($qq) => $qq->orderByDesc('created_at'))
                ->when($req->get('sort') === 'trending', fn($qq) => $qq->orderByDesc('score')->orderByDesc('created_at'))
                ->when($req->get('sort') === 'popular', fn($qq) => $qq->orderByDesc('answers_count')->orderByDesc('score'))
                ->when($req->get('sort') === 'unanswered', fn($qq) => $qq->where('answers_count', 0)->orderByDesc('created_at'))
                ->when(!$req->get('sort'), fn($qq) => $qq->orderByDesc('score')->orderByDesc('id'));

            $perPage = min((int)$req->get('per_page', 20), 50);
            return PostResource::collection($q->paginate($perPage));
        });
    }

    public function show(string $slug)
    {
        $cacheKey = 'post:' . $slug;
        
        $post = Cache::remember($cacheKey, 600, function () use ($slug) {
            return Post::with(['user.level','tags','category'])->where('slug',$slug)->firstOrFail();
        });
        
        return new PostResource($post);
    }

    public function related(string $slug)
    {
        $post = Post::where('slug', $slug)->firstOrFail();
        
        $cacheKey = "post:related:{$slug}";
        
        $relatedPosts = Cache::remember($cacheKey, 1800, function () use ($post) {
            $tagIds = $post->tags->pluck('id');
            
            return Post::with(['user.level', 'tags', 'category'])
                ->where('status', 'published')
                ->where('id', '!=', $post->id)
                ->where(function ($q) use ($post, $tagIds) {
                    // Same category
                    if ($post->category_id) {
                        $q->where('category_id', $post->category_id);
                    }
                    // Or shared tags
                    if ($tagIds->isNotEmpty()) {
                        $q->orWhereHas('tags', fn($t) => $t->whereIn('tags.id', $tagIds));
                    }
                })
                ->orderByDesc('score')
                ->limit(5)
                ->get();
        });
        
        return PostResource::collection($relatedPosts);
    }

    public function trending()
    {
        $cacheKey = 'posts:trending:weekly';
        
        $trendingPosts = Cache::remember($cacheKey, 600, function () {
            return Post::with(['user.level', 'tags', 'category'])
                ->where('status', 'published')
                ->where('created_at', '>=', now()->subDays(7))
                ->orderByDesc('score')
                ->orderByDesc('answers_count')
                ->limit(10)
                ->get();
        });
        
        return PostResource::collection($trendingPosts);
    }

    public function featured()
    {
        $cacheKey = 'posts:featured';
        
        $featuredPosts = Cache::remember($cacheKey, 3600, function () {
            return Post::with(['user.level', 'tags', 'category'])
                ->where('status', 'published')
                ->where('score', '>=', 10)
                ->where('answers_count', '>=', 3)
                ->orderByDesc('score')
                ->limit(5)
                ->get();
        });
        
        return PostResource::collection($featuredPosts);
    }

    public function store(PostStoreRequest $req)
    {
        $data = $req->validated();
        $post = DB::transaction(function () use ($data, $req) {
            $post = Post::create([
                'user_id' => $req->user()->id,
                'category_id' => $data['category_id'] ?? null,
                'title' => $data['title'],
                'content_markdown' => $data['content_markdown'],
                'status' => 'published',
            ]);
            if (!empty($data['tags'])) {
                $tagIds = collect($data['tags'])->map(function ($name) {
                    $name = trim($name);
                    $tag = Tag::firstOrCreate(['name'=>$name], ['slug'=>\Str::slug($name)]);
                    return $tag->id;
                });
                $post->tags()->sync($tagIds);
            }
            return $post->fresh(['user.level','tags','category']);
        });

        // Clear cache
        $this->clearPostCaches();
        
        // Notify followers
        $this->notifyFollowers($post);

        GeneratePostAiDraft::dispatch($post->id);

        return new PostResource($post);
    }

    public function update(PostUpdateRequest $req, string $slug)
    {
        $post = Post::where('slug',$slug)->firstOrFail();
        $this->authorize('update', $post);
        $data = $req->validated();

        DB::transaction(function () use ($post, $data) {
            $post->fill($data)->save();
            if (isset($data['tags'])) {
                $tagIds = collect($data['tags'])->map(function ($name) {
                    $tag = Tag::firstOrCreate(['name'=>$name], ['slug'=>\Str::slug($name)]);
                    return $tag->id;
                });
                $post->tags()->sync($tagIds);
            }
        });

        // Clear cache
        $this->clearPostCaches($slug);

        return new PostResource($post->fresh(['user.level','tags','category']));
    }

    public function destroy(Request $req, string $slug)
    {
        $post = Post::where('slug',$slug)->firstOrFail();
        $this->authorize('delete', $post);
        
        // Clear cache
        $this->clearPostCaches($slug);
        
        $post->delete();
        return response()->json(['ok'=>true]);
    }

    private function clearPostCaches($slug = null)
    {
        // Clear general post caches
        Cache::tags(['posts'])->flush();
        
        if ($slug) {
            Cache::forget("post:{$slug}");
            Cache::forget("post:related:{$slug}");
        }
        
        // Clear trending and featured caches
        Cache::forget('posts:trending:weekly');
        Cache::forget('posts:featured');
    }

    private function notifyFollowers(Post $post): void
    {
        $followers = $post->user->followers()->get();
        
        foreach ($followers as $follower) {
            Notification::create([
                'user_id' => $follower->id,
                'type' => 'new_post',
                'title' => 'Yangi post',
                'message' => "{$post->user->name} yangi post yaratdi: {$post->title}",
                'data' => [
                    'post_id' => $post->id,
                    'post_slug' => $post->slug,
                    'author_name' => $post->user->name
                ],
                'notifiable_id' => $post->id,
                'notifiable_type' => Post::class
            ]);
        }
    }
}

