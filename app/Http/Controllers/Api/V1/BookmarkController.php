<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\PostResource;
use App\Models\Bookmark;
use App\Models\Post;
use Illuminate\Http\Request;

class BookmarkController extends Controller
{
    public function index(Request $request)
    {
        $bookmarks = $request->user()
            ->bookmarks()
            ->with(['post.user.level', 'post.tags', 'post.category'])
            ->latest()
            ->paginate(20);

        return PostResource::collection($bookmarks->pluck('post'));
    }

    public function toggle(Request $request)
    {
        $data = $request->validate([
            'post_id' => 'required|exists:posts,id',
        ]);

        $post = Post::findOrFail($data['post_id']);
        $bookmark = Bookmark::where([
            'user_id' => $request->user()->id,
            'post_id' => $post->id,
        ])->first();

        if ($bookmark) {
            $bookmark->delete();
            $bookmarked = false;
        } else {
            Bookmark::create([
                'user_id' => $request->user()->id,
                'post_id' => $post->id,
            ]);
            $bookmarked = true;
        }

        return response()->json([
            'bookmarked' => $bookmarked,
            'message' => $bookmarked ? 'Post bookmarked' : 'Bookmark removed',
        ]);
    }

    public function check(Request $request, $postId)
    {
        $bookmarked = Bookmark::where([
            'user_id' => $request->user()->id,
            'post_id' => $postId,
        ])->exists();

        return response()->json(['bookmarked' => $bookmarked]);
    }
}
