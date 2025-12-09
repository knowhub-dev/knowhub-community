<?php

// file: app/Http/Controllers/Api/V1/VoteController.php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\VoteRequest;
use App\Models\Comment;
use App\Models\Notification;
use App\Models\Post;
use App\Models\Vote;
use App\Models\XpTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VoteController extends Controller
{
    public function vote(VoteRequest $req)
    {
        $data = $req->validated();
        $model = $data['votable_type'] === 'post' ? Post::class : Comment::class;

        return DB::transaction(function () use ($model, $data, $req) {
            $votable = $model::findOrFail($data['votable_id']);
            $previousVote = Vote::where([
                'user_id' => $req->user()->id,
                'votable_id' => $votable->id,
                'votable_type' => $model,
            ])->first();

            $xpChange = 0;
            $vote = null;

            if ($data['value'] === 0) {
                if ($previousVote) {
                    $xpChange -= $previousVote->value * ($model === Post::class ? 5 : 2);
                    $previousVote->delete();
                }
            } else {
                $vote = Vote::updateOrCreate(
                    ['user_id' => $req->user()->id, 'votable_id' => $votable->id, 'votable_type' => $model],
                    ['value' => $data['value']]
                );

                // Award XP for receiving votes
                if (! $previousVote || $previousVote->value !== $data['value']) {
                    if ($previousVote) {
                        // Remove previous XP
                        $xpChange -= $previousVote->value * ($model === Post::class ? 5 : 2);
                    }

                    // Add new XP
                    $xpChange += $data['value'] * ($model === Post::class ? 5 : 2);

                    if ($xpChange !== 0 && $votable->user_id !== $req->user()->id) {
                        XpTransaction::create([
                            'user_id' => $votable->user_id,
                            'amount' => $xpChange,
                            'reason' => $data['value'] > 0 ? 'vote_received' : 'vote_removed',
                            'subject_id' => $votable->id,
                            'subject_type' => $model,
                        ]);

                        $votable->user->increment('xp', $xpChange);

                        // Create notification for upvotes
                        if ($data['value'] > 0 && $votable->user_id !== $req->user()->id) {
                            Notification::create([
                                'user_id' => $votable->user_id,
                                'type' => 'vote',
                                'title' => 'Ovoz olindi',
                                'message' => "{$req->user()->name} sizning ".($model === Post::class ? 'postingiz' : 'kommentingiz').'ga ijobiy ovoz berdi',
                                'data' => [
                                    'voter_name' => $req->user()->name,
                                    'vote_value' => $data['value'],
                                    'votable_type' => $data['votable_type'],
                                    'votable_id' => $votable->id,
                                ],
                                'notifiable_id' => $votable->id,
                                'notifiable_type' => $model,
                            ]);
                        }
                    }
                }
            }

            // Recalculate score
            $sum = Vote::where('votable_id', $votable->id)->where('votable_type', $model)->sum('value');
            $votable->score = $sum;
            $votable->save();

            return response()->json(['ok' => true, 'score' => $sum, 'vote' => $vote ? $vote->value : 0]);
        });
    }

    public function getVote(Request $req, string $type, int $id)
    {
        $model = $type === 'post' ? Post::class : Comment::class;

        $vote = Vote::where([
            'user_id' => $req->user()->id,
            'votable_id' => $id,
            'votable_type' => $model,
        ])->first();

        return response()->json([
            'vote' => $vote ? $vote->value : 0,
        ]);
    }
}
