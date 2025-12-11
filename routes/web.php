<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Auth\OAuthController;
use App\Http\Middleware\RateLimitMiddleware;

Route::get('/', function () {
    return [
        'app' => 'KnowHub Community API',
        'version' => app()->version(),
        'status' => 'ok',
    ];
});

// Stateful API routes that require web session middleware
Route::prefix('api/v1')->group(function() {
    /* ============================
     |  Authentication & Tokens
     ============================ */
    Route::prefix('auth')->middleware(RateLimitMiddleware::class.':auth-attempt,5')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
        Route::post('/refresh', [AuthController::class, 'refreshToken'])->middleware('auth:sanctum');

        // Email auth aliases
        Route::prefix('email')->group(function () {
            Route::post('/register', [AuthController::class, 'register']);
            Route::post('/login', [AuthController::class, 'login']);
            Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
        });
    });

    /* ---- OAuth ---- */
    Route::get('/auth/google/redirect', [OAuthController::class, 'redirectGoogle']);
    Route::get('/auth/google/callback', [OAuthController::class, 'handleGoogleCallback']);
    Route::get('/auth/github/redirect', [OAuthController::class, 'redirectGithub']);
    Route::get('/auth/github/callback', [OAuthController::class, 'handleGithubCallback']);
});
