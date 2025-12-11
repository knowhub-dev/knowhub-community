<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'username' => 'required|alpha_dash|max:50|unique:users,username',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $user = User::create([
            'name' => $data['name'],
            'username' => $data['username'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ]);

        $user->loadMissing(['level', 'badges'])
            ->loadCount([
                'posts as posts_count' => fn ($q) => $q->where('status', 'published'),
                'followers',
                'following',
            ]);

        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'user' => new UserResource($user),
            'token' => $token,
        ], 201)->withCookie($this->issueAuthCookie($token));
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 422);
        }

        $user->loadMissing(['level', 'badges'])
            ->loadCount([
                'posts as posts_count' => fn ($q) => $q->where('status', 'published'),
                'followers',
                'following',
            ]);

        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'user' => new UserResource($user),
            'token' => $token,
        ])->withCookie($this->issueAuthCookie($token));
    }

    public function logout(Request $request)
    {
        $user = $request->user();

        if (! $user) {
            Log::warning('Logout attempted without authenticated user context');

            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if ($token = $user->currentAccessToken()) {
            $token->delete();
        }

        return response()->json(['message' => 'Logged out'])->withCookie($this->forgetAuthCookie());
    }

    public function refreshToken(Request $request)
    {
        $user = $request->user();

        if ($token = $user->currentAccessToken()) {
            $token->delete();
        }

        $newToken = $user->createToken('api')->plainTextToken;

        return response()->json([
            'user' => new UserResource(
                $user->loadMissing(['level', 'badges'])
                    ->loadCount([
                        'posts as posts_count' => fn ($q) => $q->where('status', 'published'),
                        'followers',
                        'following',
                    ])
            ),
            'token' => $newToken,
        ])->withCookie($this->issueAuthCookie($newToken));
    }

    private function issueAuthCookie(string $token)
    {
        return cookie(
            'auth_token',
            $token,
            60 * 24 * 30,
            '/',
            config('session.domain'),
            (bool) config('session.secure', true),
            true,
            false,
            config('session.same_site', 'lax')
        );
    }

    private function forgetAuthCookie()
    {
        return cookie()->forget('auth_token', '/', config('session.domain'));
    }
}
