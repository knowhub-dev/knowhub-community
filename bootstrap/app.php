<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Throwable;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        
        // =======================================================
        // 1. API YO'LLARINI QO'SHDIK:
        // =======================================================
        api: __DIR__.'/../routes/api.php', 
        
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        
        // =======================================================
        // 2. "admin" MIDDLEWARE'NI RO'YXATGA OLDIK:
        // =======================================================
        $middleware->alias([
            'admin' => \App\Http\Middleware\AdminMiddleware::class,
        ]);
        // =======================================================

    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->shouldReturnJson(
            fn ($request, Throwable $e) => $request->is('api/*')
        );

        $exceptions->render(function (Throwable $e, $request) {
            if (! $request->is('api/*')) {
                return null;
            }

            $status = 500;
            $errors = [];

            if ($e instanceof ValidationException) {
                $status = $e->status;
                $errors = $e->errors();
                $message = $e->getMessage();
            } elseif ($e instanceof HttpExceptionInterface) {
                $status = $e->getStatusCode();
                $message = $e->getMessage() ?: Response::$statusTexts[$status] ?? 'Error';
            } else {
                $message = Response::$statusTexts[$status] ?? 'Server Error';
            }

            return response()->json([
                'message' => $message,
                'errors' => $errors,
                'status' => $status,
            ], $status);
        });
    })->create();