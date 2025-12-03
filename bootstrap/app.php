<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'admin' => \App\Http\Middleware\AdminMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {

        // LARAVEL 11 — endi shouldReturnJson() yo‘q
        // API uchun JSON javobni shu render orqali boshqaramiz

        $exceptions->render(function (Throwable $e, $request) {
            if (! $request->is('api/*')) {
                return null; // API bo‘lmasa Laravel default ishlaydi
            }

            $status = 500;
            $errors = [];
            $message = 'Server Error';

            if ($e instanceof ValidationException) {
                $status = $e->status;
                $errors = $e->errors();
                $message = $e->getMessage();
            } elseif ($e instanceof HttpExceptionInterface) {
                $status = $e->getStatusCode();
                $message = $e->getMessage() ?: (Response::$statusTexts[$status] ?? 'Error');
            }

            return response()->json([
                'message' => $message,
                'errors'   => $errors,
                'status'   => $status,
            ], $status);
        });
    })
    ->create();

