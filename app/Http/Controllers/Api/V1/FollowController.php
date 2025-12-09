<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Follow;
use App\Models\User;
use Illuminate\Http\Request;

class FollowController extends Controller
{
    public function toggle(Request $request)
    {
        $data = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $targetUser = User::findOrFail($data['user_id']);

        if ($targetUser->id === $request->user()->id) {
            return response()->json(['message' => 'Cannot follow yourself'], 422);
        }

        $follow = Follow::where([
            'follower_id' => $request->user()->id,
            'following_id' => $targetUser->id,
        ])->first();

        if ($follow) {
            $follow->delete();
            $following = false;
        } else {
            Follow::create([
                'follower_id' => $request->user()->id,
                'following_id' => $targetUser->id,
            ]);
            $following = true;
        }

        return response()->json([
            'following' => $following,
            'message' => $following ? 'User followed' : 'User unfollowed',
        ]);
    }

    public function followers(Request $request, $userId)
    {
        $user = User::findOrFail($userId);
        $followers = $user->followers()
            ->with('level')
            ->paginate(20);

        return response()->json($followers);
    }

    public function following(Request $request, $userId)
    {
        $user = User::findOrFail($userId);
        $following = $user->following()
            ->with('level')
            ->paginate(20);

        return response()->json($following);
    }

    public function check(Request $request, $userId)
    {
        $following = Follow::where([
            'follower_id' => $request->user()->id,
            'following_id' => $userId,
        ])->exists();

        return response()->json(['following' => $following]);
    }
}
