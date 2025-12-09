<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Comment;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PostWebController extends Controller
{
    public function index()
    {
        $query = Post::with(['user.level', 'tags', 'category'])
            ->where('status', 'published')
            ->when(request('search'), function ($q, $search) {
                $q->where(function ($qq) use ($search) {
                    $qq->where('title', 'LIKE', "%{$search}%")
                        ->orWhere('content_markdown', 'LIKE', "%{$search}%");
                });
            })
            ->when(request('category'), function ($q, $category) {
                if ($category !== 'all') {
                    $q->whereHas('category', fn ($c) => $c->where('slug', $category));
                }
            })
            ->when(request('tag'), function ($q, $tag) {
                if ($tag !== 'all') {
                    $q->whereHas('tags', fn ($t) => $t->where('slug', $tag));
                }
            })
            ->when(request('sort'), function ($q, $sort) {
                switch ($sort) {
                    case 'trending':
                        $q->where('created_at', '>=', now()->subDays(7))
                            ->orderByDesc('score')
                            ->orderByDesc('answers_count');
                        break;
                    case 'popular':
                        $q->orderByDesc('answers_count')
                            ->orderByDesc('score');
                        break;
                    case 'unanswered':
                        $q->where('answers_count', 0)
                            ->orderByDesc('created_at');
                        break;
                    default:
                        $q->latest();
                }
            }, function ($q) {
                $q->latest();
            });

        $posts = $query->paginate(12);

        // Additional data for filters
        $categories = Category::withCount(['posts' => fn ($q) => $q->where('status', 'published')])
            ->orderBy('name')
            ->get();

        $popularTags = DB::table('post_tag')
            ->join('tags', 'post_tag.tag_id', '=', 'tags.id')
            ->join('posts', 'post_tag.post_id', '=', 'posts.id')
            ->where('posts.status', 'published')
            ->select('tags.name', 'tags.slug', DB::raw('COUNT(*) as usage_count'))
            ->groupBy('tags.id', 'tags.name', 'tags.slug')
            ->orderByDesc('usage_count')
            ->limit(20)
            ->get();

        return view('posts.index', compact('posts', 'categories', 'popularTags'));
    }

    public function show(string $slug)
    {
        $post = Post::with(['user', 'tags', 'comments.user', 'comments.children.user'])
            ->where('slug', $slug)
            ->firstOrFail();

        return view('posts.show', compact('post'));
    }

    public function create()
    {
        return view('posts.create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:180',
            'content_markdown' => 'required|string',
            'category_id' => 'nullable|exists:categories,id',
            'tags' => 'nullable|string',
        ]);

        $post = Post::create([
            'user_id' => Auth::id(),
            'category_id' => $data['category_id'] ?? null,
            'title' => $data['title'],
            'content_markdown' => $data['content_markdown'],
            'status' => 'published',
        ]);

        // Handle tags
        if (! empty($data['tags'])) {
            $tagNames = array_map('trim', explode(',', $data['tags']));
            $tagIds = collect($tagNames)->map(function ($name) {
                if (empty($name)) {
                    return null;
                }
                $tag = \App\Models\Tag::firstOrCreate(
                    ['name' => $name],
                    ['slug' => \Str::slug($name)]
                );

                return $tag->id;
            })->filter();

            $post->tags()->sync($tagIds);
        }

        return redirect()->route('posts.show', $post->slug)
            ->with('success', 'Post muvaffaqiyatli yaratildi!');
    }

    public function storeComment(Request $request, string $slug)
    {
        $request->validate([
            'content_markdown' => 'required|string',
            'parent_id' => 'nullable|exists:comments,id',
        ]);

        $post = Post::where('slug', $slug)->firstOrFail();

        Comment::create([
            'post_id' => $post->id,
            'user_id' => Auth::id(),
            'parent_id' => $request->parent_id,
            'content_markdown' => $request->content_markdown,
            'depth' => $request->parent_id ? Comment::find($request->parent_id)->depth + 1 : 0,
        ]);

        return back();
    }
}
