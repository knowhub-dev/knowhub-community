<?php

// file: app/Http/Controllers/Api/V1/CommentController.php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\CommentStoreRequest;
use App\Http\Resources\CommentResource;
use App\Models\Comment;
use App\Models\Notification;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CommentController extends Controller
{
    public function store(CommentStoreRequest $req, Post $post)
    {
        $data = $req->validated();

        $comment = DB::transaction(function () use ($post, $req, $data) {
            $depth = 0;
            if (! empty($data['parent_id'])) {
                $parent = Comment::where('post_id', $post->id)->findOrFail($data['parent_id']);
                $depth = min(8, $parent->depth + 1);
            }
            $comment = Comment::create([
                'post_id' => $post->id,
                'user_id' => $req->user()->id,
                'parent_id' => $data['parent_id'] ?? null,
                'content_markdown' => $data['content_markdown'],
                'depth' => $depth,
            ]);
            $post->increment('answers_count');

            // Notify post author
            if ($post->user_id !== $req->user()->id) {
                Notification::create([
                    'user_id' => $post->user_id,
                    'type' => 'comment',
                    'title' => 'Yangi komment',
                    'message' => "{$req->user()->name} sizning postingizga komment qoldirdi",
                    'data' => [
                        'post_id' => $post->id,
                        'post_slug' => $post->slug,
                        'comment_id' => $comment->id,
                        'commenter_name' => $req->user()->name,
                    ],
                    'notifiable_id' => $comment->id,
                    'notifiable_type' => Comment::class,
                ]);
            }

            // Notify parent comment author
            if (! empty($data['parent_id'])) {
                $parent = Comment::find($data['parent_id']);
                if ($parent && $parent->user_id !== $req->user()->id) {
                    Notification::create([
                        'user_id' => $parent->user_id,
                        'type' => 'reply',
                        'title' => 'Javob',
                        'message' => "{$req->user()->name} sizning kommentingizga javob berdi",
                        'data' => [
                            'post_id' => $post->id,
                            'post_slug' => $post->slug,
                            'comment_id' => $comment->id,
                            'parent_comment_id' => $parent->id,
                            'replier_name' => $req->user()->name,
                        ],
                        'notifiable_id' => $comment->id,
                        'notifiable_type' => Comment::class,
                    ]);
                }
            }

            return $comment;
        });

        $comment->load([
            'user:id,name,username,avatar_url,level',
            'children.user:id,name,username,avatar_url,level',
        ]);

        return new CommentResource($comment);
    }

    public function index(Request $request, Post $post)
    {
        $comments = Comment::query()
            ->where('post_id', $post->id)
            ->whereNull('parent_id')
            ->with([
                'user:id,name,username,avatar_url,level',
                'children.user:id,name,username,avatar_url,level',
                'children.children.user:id,name,username,avatar_url,level',
            ])
            ->latest()
            ->get();

        return CommentResource::collection($comments);
    }

    public function destroy(Request $req, int $id)
    {
        $comment = Comment::findOrFail($id);
        $this->authorize('delete', $comment);

        DB::transaction(function () use ($comment) {
            // Decrement post answers count
            $comment->post->decrement('answers_count');
            $comment->delete();
        });

        return response()->json(['ok' => true]);
    }

    public function update(Request $req, int $id)
    {
        $comment = Comment::findOrFail($id);
        $this->authorize('update', $comment);

        $data = $req->validate([
            'content_markdown' => 'required|string',
        ]);

        $comment->update($data);
        $comment->load([
            'user:id,name,username,avatar_url,level',
            'children.user:id,name,username,avatar_url,level',
        ]);

        return new CommentResource($comment);
    }

    public function show(int $id)
    {
        $comment = Comment::with([
            'user:id,name,username,avatar_url,level',
            'children.user:id,name,username,avatar_url,level',
            'post',
        ])
            ->findOrFail($id);

        return new CommentResource($comment);
    }
}
