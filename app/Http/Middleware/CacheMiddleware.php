<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class CacheMiddleware
{
    public function handle(Request $request, Closure $next, int $ttl = 300): Response
    {
        if ($request->method() !== 'GET') {
            return $next($request);
        }

        $key = 'cache:'.md5($request->fullUrl().($request->user()?->id ?? 'guest'));

        if (Cache::has($key)) {
            $cached = Cache::get($key);

            return response($cached['content'], $cached['status'])
                ->withHeaders($cached['headers'])
                ->header('X-Cache', 'HIT');
        }

        $response = $next($request);

        if ($response->getStatusCode() === 200) {
            Cache::put($key, [
                'content' => $response->getContent(),
                'status' => $response->getStatusCode(),
                'headers' => $response->headers->all(),
            ], $ttl);
        }

        return $response->header('X-Cache', 'MISS');
    }
}
