<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
// Faylning yuqorisiga UserResource'ni chaqirib olamiz
use App\Models\Container;
use App\Models\User;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

class ProfileController extends Controller
{
    public function show(string $username)
    {
        try {
            $user = User::where('username', $username)
                ->with(['badges', 'level', 'featuredContainers'])
                ->withCount([
                    'posts as posts_count' => fn ($q) => $q->where('status', 'published'),
                    'followers',
                    'following',
                ])
                ->firstOrFail();

            return new UserResource($user);
        } catch (ModelNotFoundException $exception) {
            Log::warning('Profile not found', [
                'username' => $username,
                'exception' => $exception->getMessage(),
            ]);

            throw $exception;
        } catch (Throwable $exception) {
            Log::error('Unexpected error while resolving profile', [
                'username' => $username,
                'exception' => $exception,
            ]);

            throw $exception;
        }
    }

    public function me(Request $req)
    {
        $user = $req->user();

        if (! $user) {
            Log::error('Profile /me endpoint called without authenticated user');

            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        try {
            $user = $user
                ->loadMissing(['level', 'badges', 'featuredContainers'])
                ->loadCount([
                    'posts as posts_count' => fn ($q) => $q->where('status', 'published'),
                    'followers',
                    'following',
                ]);

            return new UserResource($user);
        } catch (Throwable $exception) {
            $traceId = (string) Str::uuid();

            Log::error('Failed to resolve authenticated profile', [
                'user_id' => $user->id,
                'trace_id' => $traceId,
                'error' => $exception,
            ]);

            return response()->json([
                'message' => 'Service unavailable. Please try again later.',
                'trace_id' => $traceId,
            ], 503);
        }
    }

    public function update(Request $req)
    {
        $data = $req->validate([
            'name' => 'sometimes|string|max:100',
            'avatar_url' => 'sometimes|url',
            'bio' => 'sometimes|string|max:500',
            'website_url' => 'nullable|url|max:255',
            'github_url' => 'nullable|url|max:255',
            'linkedin_url' => 'nullable|url|max:255',
            'resume' => 'nullable|string|max:5000',
        ]);
        $user = $req->user();
        $user->fill($data)->save();

        // Bu yerda to'g'ri edi, UserResource'ni to'liq namespace bilan chaqirsa ham bo'ladi
        return new \App\Http\Resources\UserResource(
            $user->loadMissing(['level', 'badges', 'featuredContainers'])
                ->loadCount([
                    'posts as posts_count' => fn ($q) => $q->where('status', 'published'),
                    'followers',
                    'following',
                ])
        );
    }

    public function updateResume(Request $req)
    {
        $data = $req->validate([
            'resume_data' => ['required', 'array'],
            'resume_data.summary' => 'nullable|string|max:500',
            'resume_data.skills' => 'nullable|array',
            'resume_data.skills.*' => 'string|max:100',
            'resume_data.experience' => 'nullable|array',
            'resume_data.experience.*.title' => 'required_with:resume_data.experience|string|max:150',
            'resume_data.experience.*.company' => 'nullable|string|max:150',
            'resume_data.experience.*.date' => 'nullable|string|max:100',
            'resume_data.experience.*.desc' => 'nullable|string|max:2000',
            'resume_data.education' => 'nullable|array',
            'resume_data.education.*.school' => 'required_with:resume_data.education|string|max:150',
            'resume_data.education.*.degree' => 'nullable|string|max:150',
            'resume_data.education.*.date' => 'nullable|string|max:100',
        ]);

        $user = $req->user();
        $user->resume_data = $data['resume_data'];
        $user->save();

        return new UserResource(
            $user->fresh(['level', 'badges', 'featuredContainers'])
                ->loadCount([
                    'posts as posts_count' => fn ($q) => $q->where('status', 'published'),
                    'followers',
                    'following',
                ])
        );
    }

    public function toggleProjectFeature(Request $req, int $container)
    {
        $container = Container::where('user_id', $req->user()->id)->findOrFail($container);

        $container->is_featured = ! $container->is_featured;
        $container->save();

        return response()->json([
            'id' => $container->id,
            'is_featured' => $container->is_featured,
            'message' => 'Project feature flag updated.',
        ]);
    }
}
