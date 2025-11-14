<?php
// file: app/Http/Controllers/Api/V1/CollaborationController.php
namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\CollaborationEvent;
use App\Models\CollaborationSession;
use App\Models\CollaborationSessionUser;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CollaborationController extends Controller
{
    public function store(Request $request, string $slug)
    {
        $post = Post::where('slug', $slug)->firstOrFail();
        $user = $request->user();

        if ($post->user_id !== $user->id) {
            return response()->json(['message' => 'Faqat post muallifi hamkorlik sessiyasini yaratishi mumkin'], 403);
        }

        $activeSession = $post->collaborationSessions()->where('status', 'active')->first();
        if ($activeSession) {
            return response()->json($this->formatSession($activeSession->load('participants.user')), 200);
        }

        $session = DB::transaction(function () use ($post, $user) {
            $session = CollaborationSession::create([
                'post_id' => $post->id,
                'owner_id' => $user->id,
                'status' => 'active',
                'content_snapshot' => $post->content_markdown,
            ]);

            $session->participants()->create([
                'user_id' => $user->id,
                'role' => 'owner',
                'last_seen_at' => now(),
            ]);

            return $session->load('participants.user');
        });

        return response()->json($this->formatSession($session), 201);
    }

    public function show(CollaborationSession $session)
    {
        return response()->json($this->formatSession($session->load(['participants.user'])));
    }

    public function activeForPost(Request $request, string $slug)
    {
        $post = Post::where('slug', $slug)->firstOrFail();

        $session = $post->collaborationSessions()
            ->where('status', 'active')
            ->with('participants.user')
            ->first();

        if (!$session) {
            return response()->json(['message' => 'Faol sessiya topilmadi'], 404);
        }

        return response()->json($this->formatSession($session));
    }

    public function join(Request $request, CollaborationSession $session)
    {
        if ($session->status !== 'active') {
            return response()->json(['message' => 'Sessiya faol emas'], 409);
        }

        $participant = CollaborationSessionUser::updateOrCreate(
            ['session_id' => $session->id, 'user_id' => $request->user()->id],
            [
                'role' => $request->input('role', 'editor'),
                'last_seen_at' => now(),
            ]
        );

        return response()->json($this->formatSession($session->fresh(['participants.user'])), $participant->wasRecentlyCreated ? 201 : 200);
    }

    public function heartbeat(Request $request, CollaborationSession $session)
    {
        $participant = $session->participants()->where('user_id', $request->user()->id)->first();
        if (!$participant) {
            return response()->json(['message' => 'Sessiyada ro\'yxatdan o\'tmagansiz'], 404);
        }

        $participant->update(['last_seen_at' => now()]);

        return response()->json(['status' => 'ok']);
    }

    public function recordEvent(Request $request, CollaborationSession $session)
    {
        if ($session->status !== 'active') {
            return response()->json(['message' => 'Sessiya faol emas'], 409);
        }

        $data = $request->validate([
            'type' => 'required|string|max:100',
            'payload' => 'required|array',
        ]);

        if (!$session->participants()->where('user_id', $request->user()->id)->exists()) {
            return response()->json(['message' => 'Sessiyada ro\'yxatdan o\'tmagansiz'], 403);
        }

        $event = CollaborationEvent::create([
            'session_id' => $session->id,
            'user_id' => $request->user()->id,
            'type' => $data['type'],
            'payload' => $data['payload'],
        ]);

        return response()->json([
            'id' => $event->id,
            'created_at' => $event->created_at,
        ], 201);
    }

    public function events(Request $request, CollaborationSession $session)
    {
        $afterId = $request->query('after_id');

        $events = $session->events()
            ->when($afterId, fn($q) => $q->where('id', '>', $afterId))
            ->orderBy('id')
            ->limit(100)
            ->get();

        return response()->json($events->map(function (CollaborationEvent $event) {
            return [
                'id' => $event->id,
                'type' => $event->type,
                'payload' => $event->payload,
                'user_id' => $event->user_id,
                'created_at' => $event->created_at,
            ];
        }));
    }

    public function close(Request $request, CollaborationSession $session)
    {
        if ($session->owner_id !== $request->user()->id) {
            return response()->json(['message' => 'Faqat sessiya egasi yopishi mumkin'], 403);
        }

        if ($session->status === 'ended') {
            return response()->json($this->formatSession($session));
        }

        $session->update([
            'status' => 'ended',
            'ended_at' => now(),
            'content_snapshot' => $request->input('content_snapshot', $session->content_snapshot),
        ]);

        return response()->json($this->formatSession($session->fresh(['participants.user'])));
    }

    private function formatSession(CollaborationSession $session): array
    {
        return [
            'id' => $session->id,
            'post_id' => $session->post_id,
            'owner_id' => $session->owner_id,
            'status' => $session->status,
            'content_snapshot' => $session->content_snapshot,
            'ended_at' => $session->ended_at,
            'created_at' => $session->created_at,
            'updated_at' => $session->updated_at,
            'participants' => $session->participants->map(function (CollaborationSessionUser $participant) {
                return [
                    'id' => $participant->id,
                    'user_id' => $participant->user_id,
                    'role' => $participant->role,
                    'last_seen_at' => $participant->last_seen_at,
                    'user' => $participant->relationLoaded('user') ? [
                        'id' => $participant->user->id,
                        'username' => $participant->user->username,
                        'name' => $participant->user->name,
                    ] : null,
                ];
            }),
        ];
    }
}
