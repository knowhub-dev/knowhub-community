<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user() || ! $this->isAdmin($request->user())) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Unauthorized - Admin access required'], 403);
            }

            return redirect()->route('home')->with('error', 'Bu sahifaga faqat administratorlar kirishi mumkin');
        }

        return $next($request);
    }

    private function isAdmin($user): bool
    {
        return $user->is_admin || $user->email === 'admin@knowhub.uz' || $user->id === 1;
    }
}
