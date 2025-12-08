<?php

declare(strict_types=1);

// file: app/Http/Controllers/Api/V1/PostController.php
namespace App\Http\Controllers\Api\V1;

use App\Filters\PostFilter;
use App\Http\Controllers\Controller;
use App\Http\Requests\PostStoreRequest;
use App\Http\Requests\PostUpdateRequest;
use App\Http\Resources\PostResource;
use App\Jobs\GeneratePostAiDraft;
use App\Models\Notification;
use App\Models\Post;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Cache\Repository;
use Illuminate\Cache\TaggedCache;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Throwable;

class PostController extends Controller
{
    public function index(Request $request, PostFilter $filter)
    {
        $validated = $filter->validate($request);
        $perPage = (int) ($validated['per_page'] ?? 20);

        $query = Post::query()
            ->with([
                'author:id,name,username,avatar_url,level_id',
                'author.level:id,name,min_xp,icon',
                'tags:id,name,slug',
                'category:id,name,slug',
            ])
            ->withCount(['comments', 'votes'])
            ->filter($filter, $validated);

        $cacheKey = $filter->cacheKey($validated, $request->user()?->id);

        if ($cacheKey !== null) {
            return $this->postsCacheStore()->remember($cacheKey, 300, static fn () =>
                PostResource::collection($query->paginate($perPage))
            );
        }

        return PostResource::collection($query->paginate($perPage));
    }

    public function show(string $slug)
    {
        $cacheKey = 'post:' . $slug;

        try {
            $post = Cache::remember($cacheKey, 600, function () use ($slug) {
                return Post::with([
                    'author:id,name,username,avatar_url,level_id',
                    'author.level:id,name,min_xp,icon',
                    'tags:id,name,slug',
                    'category:id,name,slug',
                ])->withCount(['comments', 'votes'])->where('slug', $slug)->firstOrFail();
            });

            return new PostResource($post);
        } catch (ModelNotFoundException $exception) {
            Log::warning('Requested post slug not found', [
                'slug' => $slug,
                'exception' => $exception->getMessage(),
            ]);

            throw $exception;
        } catch (Throwable $exception) {
            Log::error('Unexpected error while loading post', [
                'slug' => $slug,
                'exception' => $exception,
            ]);

            throw $exception;
        }
    }

    public function related(string $slug)
    {
        $post = Post::where('slug', $slug)->firstOrFail();
        
        $cacheKey = "post:related:{$slug}";
        
        $relatedPosts = Cache::remember($cacheKey, 1800, function () use ($post) {
            $tagIds = $post->tags->pluck('id');
            
            return Post::with([
                'author:id,name,username,avatar_url,level_id',
                'author.level:id,name,min_xp,icon',
                'tags:id,name,slug',
                'category:id,name,slug',
            ])
                ->withCount(['comments', 'votes'])
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
            return Post::with([
                'author:id,name,username,avatar_url,level_id',
                'author.level:id,name,min_xp,icon',
                'tags:id,name,slug',
                'category:id,name,slug',
            ])
                ->withCount(['comments', 'votes'])
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
            return Post::with([
                'author:id,name,username,avatar_url,level_id',
                'author.level:id,name,min_xp,icon',
                'tags:id,name,slug',
                'category:id,name,slug',
            ])
                ->withCount(['comments', 'votes'])
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
        $user = $req->user();

        if (!$user) {
            Log::error('Post store attempted without authenticated user');

            return response()->json(['message' => 'Unauthenticated.'], 401);
        }
        
        // XP tekshirish
        if ($req->input('required_xp', 0) > 0 && $user->xp < $req->input('required_xp')) {
            return response()->json([
                'message' => 'Bu postni yaratish uchun yetarli XP ballingiz yo\'q',
                'required_xp' => $req->input('required_xp'),
                'your_xp' => $user->xp
            ], 403);
        }

        // Verifikatsiya tekshirish
        if ($req->input('requires_verification', false) && !$user->is_verified) {
            return response()->json([
                'message' => 'Bu postni yaratish uchun verificatsiyadan o\'tishingiz kerak'
            ], 403);
        }

        $data = $req->validated();
        $post = DB::transaction(function () use ($data, $req) {
            $post = Post::create([
                'user_id' => $req->user()->id,
                'category_id' => $data['category_id'] ?? null,
                'title' => $data['title'],
                'slug' => Str::slug($data['title']) . '-' . Str::random(6),
                'content_markdown' => $data['content_markdown'],
                'status' => 'published',
                'required_xp' => $data['required_xp'] ?? 0,
                'requires_verification' => $data['requires_verification'] ?? false,
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

    public function update(PostUpdateRequest $req, Post $post)
    {
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
        $this->clearPostCaches($post->slug);

        return new PostResource($post->fresh(['user.level','tags','category']));
    }

    public function destroy(Request $req, Post $post)
    {
        $this->authorize('delete', $post);

        // Clear cache
        $this->clearPostCaches($post->slug);
        
        $post->delete();
        return response()->json(['ok'=>true]);
    }

    private function clearPostCaches(?string $slug = null): void
    {
        // Clear general post caches
        if (Cache::supportsTags()) {
            Cache::tags(['posts'])->flush();
        } else {
            Cache::flush();
        }
        
        if ($slug) {
            Cache::forget("post:{$slug}");
            Cache::forget("post:related:{$slug}");
        }
        
        // Clear trending and featured caches
        Cache::forget('posts:trending:weekly');
        Cache::forget('posts:featured');
    }

    private function postsCacheStore(): TaggedCache|Repository
    {
        return Cache::supportsTags()
            ? Cache::tags(['posts'])
            : Cache::store();
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

