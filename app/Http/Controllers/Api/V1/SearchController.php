<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\PostResource;
use App\Models\Post;
use App\Models\User;
use App\Models\WikiArticle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SearchController extends Controller
{
    public function search(Request $request)
    {
        $query = $request->validate([
            'q' => 'required|string|min:2|max:100',
            'type' => 'sometimes|in:posts,wiki,users,all',
            'limit' => 'sometimes|integer|min:1|max:50',
        ]);

        $searchTerm = $query['q'];
        $type = $query['type'] ?? 'all';
        $limit = $query['limit'] ?? 20;

        $results = [];

        if ($type === 'posts' || $type === 'all') {
            $posts = Post::with(['user.level', 'tags', 'category'])
                ->where('status', 'published')
                ->where(function ($q) use ($searchTerm) {
                    $q->where('title', 'LIKE', "%{$searchTerm}%")
                        ->orWhere('content_markdown', 'LIKE', "%{$searchTerm}%");
                })
                ->orderByDesc('score')
                ->limit($limit)
                ->get();

            $results['posts'] = PostResource::collection($posts);
        }

        if ($type === 'wiki' || $type === 'all') {
            $wiki = WikiArticle::where('status', 'published')
                ->where(function ($q) use ($searchTerm) {
                    $q->where('title', 'LIKE', "%{$searchTerm}%")
                        ->orWhere('content_markdown', 'LIKE', "%{$searchTerm}%");
                })
                ->limit($limit)
                ->get();

            $results['wiki'] = $wiki;
        }

        if ($type === 'users' || $type === 'all') {
            $users = User::with('level')
                ->where(function ($q) use ($searchTerm) {
                    $q->where('name', 'LIKE', "%{$searchTerm}%")
                        ->orWhere('username', 'LIKE', "%{$searchTerm}%");
                })
                ->limit($limit)
                ->get()
                ->map(fn ($user) => $user->only(['id', 'name', 'username', 'avatar_url', 'xp', 'level']));

            $results['users'] = $users;
        }

        return response()->json([
            'query' => $searchTerm,
            'results' => $results,
            'total' => collect($results)->sum(fn ($items) => count($items)),
        ]);
    }

    public function suggestions(Request $request)
    {
        $query = $request->validate([
            'q' => 'required|string|min:1|max:50',
        ]);

        $searchTerm = $query['q'];

        $suggestions = DB::table('posts')
            ->select('title')
            ->where('status', 'published')
            ->where('title', 'LIKE', "%{$searchTerm}%")
            ->orderByDesc('score')
            ->limit(10)
            ->pluck('title')
            ->unique()
            ->values();

        return response()->json(['suggestions' => $suggestions]);
    }
}
