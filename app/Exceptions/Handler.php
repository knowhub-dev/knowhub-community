<?php

// file: app/Exceptions/Handler.php

namespace App\Exceptions;

use App\Http\Responses\ApiResponse;
use Illuminate\Auth\AuthenticationException; // <-- BU ENG MUHIM IMPORT
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Psr\SimpleCache\CacheException;
use RuntimeException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException;
use Throwable;

use function config;

class Handler extends ExceptionHandler
{
    /**
     * A list of exception types with their corresponding custom log levels.
     *
     * @var array<class-string<Throwable>, \Psr\Log\LogLevel::*>
     */
    protected $levels = [
        //
    ];

    /**
     * A list of the exception types that are not reported.
     *
     * @var array<int, class-string<Throwable>>
     */
    protected $dontReport = [
        //
    ];

    /**
     * A list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            $request = request();

            if ($request && $request->is('api/*')) {
                $user = $request->user();

                Log::channel('api_debug')->error('API exception reported', [
                    'method' => $request->getMethod(),
                    'path' => $request->path(),
                    'user' => array_filter([
                        'id' => $user->id ?? null,
                        'email' => $user->email ?? null,
                    ]),
                    'exception' => $e::class,
                    'message' => $e->getMessage(),
                ]);
            }
        });

        $this->renderable(function (ModelNotFoundException|NotFoundHttpException $exception, Request $request) {
            if ($this->expectsApiResponse($request)) {
                return ApiResponse::error('Resource not found.', 404, 'resource_not_found');
            }
        });

        $this->renderable(function (TooManyRequestsHttpException|ThrottleRequestsException $exception, Request $request) {
            if ($this->expectsApiResponse($request)) {
                return ApiResponse::error($exception->getMessage() ?: 'Too many requests.', 429, 'too_many_requests');
            }
        });

        $this->renderable(function (ContainerRuntimeException $exception, Request $request) {
            if ($this->expectsApiResponse($request)) {
                return ApiResponse::error($exception->getMessage(), 500, 'container_runtime_error');
            }
        });

        $this->renderable(function (ValidationException $exception, Request $request) {
            if ($this->expectsApiResponse($request)) {
                return ApiResponse::error('The given data was invalid.', 422, 'validation_error', $exception->errors());
            }
        });

        $this->renderable(function (QueryException $exception, Request $request) {
            if ($this->expectsApiResponse($request)) {
                Log::channel('api_debug')->error('Database query error', [
                    'sql' => $exception->getSql(),
                    'bindings' => $exception->getBindings(),
                    'message' => $exception->getMessage(),
                ]);

                return ApiResponse::error('A database error occurred.', 500, 'database_error');
            }
        });

        $this->renderable(function (RuntimeException $exception, Request $request) {
            if ($this->expectsApiResponse($request)) {
                Log::channel('api_debug')->error('Runtime exception', [
                    'message' => $exception->getMessage(),
                    'file' => $exception->getFile(),
                    'line' => $exception->getLine(),
                    'trace' => config('app.debug') ? $exception->getTraceAsString() : null,
                ]);

                return ApiResponse::error('Unexpected server error.', 500, 'runtime_error');
            }
        });

        $this->renderable(function (CacheException $exception, Request $request) {
            if ($this->expectsApiResponse($request)) {
                Log::channel('api_debug')->warning('Cache failure detected', [
                    'message' => $exception->getMessage(),
                ]);

                return ApiResponse::error('Cache service is temporarily unavailable.', 503, 'cache_unavailable');
            }
        });

        $this->renderable(function (HttpException $exception, Request $request) {
            if ($this->expectsApiResponse($request)) {
                $status = $exception->getStatusCode();

                return ApiResponse::error($exception->getMessage() ?: 'Http error occurred.', $status, 'http_error');
            }
        });
    }

    // =======================================================
    // BARCHA MUAMMOLARIMIZNING YECHIMI SHU YERDA
    // =======================================================
    /**
     * Authenticated bo'lmagan so'rovni to'g'irlaymiz.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response|\Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    protected function unauthenticated($request, AuthenticationException $exception)
    {
        // Agar so'rov JSON javobini kutayotgan bo'lsa (API so'rovi bo'lsa)
        if ($request->expectsJson()) {
            // "View topilmadi" xatosi o'rniga 401 JSON xato qaytaramiz
            return ApiResponse::error($exception->getMessage(), 401, 'unauthenticated');
        }

        // Agar bu oddiy web-so'rov bo'lsa, login sahifasiga yo'naltiramiz
        return redirect()->guest($exception->redirectTo() ?? route('login'));
    }

    private function expectsApiResponse(Request $request): bool
    {
        return $request->expectsJson() || $request->is('api/*');
    }
}
