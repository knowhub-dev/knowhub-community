<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Support\Facades\Log;

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

        Auth::login($user);

        $user->loadMissing(['level', 'badges'])
            ->loadCount([
                'posts as posts_count' => fn($q) => $q->where('status', 'published'),
                'followers',
                'following'
            ]);

        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => new UserResource($user),
        ], 201);
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

        Auth::login($user);

        $user->loadMissing(['level', 'badges'])
            ->loadCount([
                'posts as posts_count' => fn($q) => $q->where('status', 'published'),
                'followers',
                'following'
            ]);

        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => new UserResource($user),
        ]);
    }

    public function logout(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            Log::warning('Logout attempted without authenticated user context');

            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if ($token = $user->currentAccessToken()) {
            $token->delete();
        }

        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Logged out']);
    }

    public function refreshToken(Request $request)
    {
        $user = $request->user();

        if ($token = $user->currentAccessToken()) {
            $token->delete();
        }

        $newToken = $user->createToken('api')->plainTextToken;

        return response()->json([
            'token' => $newToken,
            'user' => new UserResource(
                $user->loadMissing(['level', 'badges'])
                    ->loadCount([
                        'posts as posts_count' => fn($q) => $q->where('status', 'published'),
                        'followers',
                        'following'
                    ])
            ),
        ]);
    }
}
