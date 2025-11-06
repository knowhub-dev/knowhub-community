<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

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
        //
    })->create();