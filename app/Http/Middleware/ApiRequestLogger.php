<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class ApiRequestLogger
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $start = microtime(true);

        try {
            $response = $next($request);
        } catch (Throwable $exception) {
            $this->logException($request, $exception, microtime(true) - $start);

            throw $exception;
        }

        $this->logRequest($request, $response, microtime(true) - $start);

        return $response;
    }

    private function logRequest(Request $request, Response $response, float $duration): void
    {
        Log::channel('api_debug')->info('API request', [
            'method' => $request->getMethod(),
            'path' => $request->path(),
            'route' => optional($request->route())->getName(),
            'status' => $response->getStatusCode(),
            'duration_ms' => (int) round($duration * 1000),
            'origin' => $request->headers->get('origin'),
            'host' => $request->getHost(),
            'referer' => $request->headers->get('referer'),
            'ip' => $request->ip(),
            'user' => $this->getUserContext($request),
            'query' => $request->query(),
            'payload' => $this->maskedPayload($request->all()),
        ]);
    }

    private function logException(Request $request, Throwable $exception, float $duration): void
    {
        $trace = array_slice($exception->getTrace(), 0, 5);

        Log::channel('api_debug')->error('API exception', [
            'method' => $request->getMethod(),
            'path' => $request->path(),
            'route' => optional($request->route())->getName(),
            'duration_ms' => (int) round($duration * 1000),
            'user' => $this->getUserContext($request),
            'exception' => [
                'class' => $exception::class,
                'message' => $exception->getMessage(),
                'file' => $exception->getFile(),
                'line' => $exception->getLine(),
                'trace' => array_map(fn ($frame) => Arr::only($frame, ['file', 'line', 'function', 'class']), $trace),
            ],
        ]);
    }

    private function getUserContext(Request $request): array
    {
        $user = $request->user();

        if (! $user) {
            return [];
        }

        return Arr::whereNotNull([
            'id' => $user->id ?? null,
            'email' => $user->email ?? null,
        ]);
    }

    private function maskedPayload(array $payload): array
    {
        $sensitiveKeys = ['password', 'token', 'secret', 'api_key'];

        $mask = function ($value) {
            return is_array($value) ? $this->maskedPayload($value) : '***';
        };

        return array_map(function ($value, $key) use ($sensitiveKeys, $mask) {
            if (in_array(strtolower((string) $key), $sensitiveKeys, true)) {
                return $mask($value);
            }

            return is_array($value) ? $this->maskedPayload($value) : $value;
        }, $payload, array_keys($payload));
    }
}

