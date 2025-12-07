<?php
// file: app/Exceptions/Handler.php
namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;
use Throwable;
use Illuminate\Auth\AuthenticationException; // <-- BU ENG MUHIM IMPORT

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

        $this->renderable(function (ContainerRuntimeException $exception, $request) {
            return response()->json([
                'message' => $exception->getMessage(),
                'code' => 'container_runtime_error',
            ], 500);
        });

        $this->renderable(function (ValidationException $exception, $request) {
            return response()->json([
                'message' => 'The given data was invalid.',
                'errors' => $exception->errors(),
            ], 422);
        });
    }

    // =======================================================
    // BARCHA MUAMMOLARIMIZNING YECHIMI SHU YERDA
    // =======================================================
    /**
     * Authenticated bo'lmagan so'rovni to'g'irlaymiz.
     *
     * @param \Illuminate\Http\Request $request
     * @param \Illuminate\Auth\AuthenticationException $exception
     * @return \Illuminate\Http\Response|\Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    protected function unauthenticated($request, AuthenticationException $exception)
    {
        // Agar so'rov JSON javobini kutayotgan bo'lsa (API so'rovi bo'lsa)
        if ($request->expectsJson()) {
            // "View topilmadi" xatosi o'rniga 401 JSON xato qaytaramiz
            return response()->json(['message' => $exception->getMessage()], 401);
        }

        // Agar bu oddiy web-so'rov bo'lsa, login sahifasiga yo'naltiramiz
        return redirect()->guest($exception->redirectTo() ?? route('login'));
    }
}
