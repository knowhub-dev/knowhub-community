<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // 1. Biz yaratgan ForceJsonResponse ni API guruhiga qo'shamiz
        $middleware->api(prepend: [
            \App\Http\Middleware\ForceJsonResponse::class, // <--- MANA SHU MUHIM
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ]);

        $middleware->alias([
            'verified' => \App\Http\Middleware\EnsureEmailIsVerified::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Bu joy endi shart emas, chunki Middleware o'zi hal qiladi,
        // lekin xavfsizlik uchun tursa zarar qilmaydi.
    })->create();
