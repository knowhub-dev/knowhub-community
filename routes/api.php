<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\ProfileController;
use App\Http\Controllers\Api\V1\UserController;
use App\Http\Controllers\Api\V1\PostController;
use App\Http\Controllers\Api\V1\CommentController;
use App\Http\Controllers\Api\V1\VoteController;
use App\Http\Controllers\Api\V1\FollowController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\ActivityFeedController;
use App\Http\Controllers\Api\V1\SearchController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\ReportController;
use App\Http\Controllers\Api\V1\BookmarkController;
use App\Http\Middleware\RateLimitMiddleware;
use App\Http\Controllers\Auth\OAuthController;


/*
|--------------------------------------------------------------------------
| API V1 ROUTES
|--------------------------------------------------------------------------
| Auth → Protected Routes → Public Routes ketma ketligi asosida.
| Eng muhim fix: /profile/me birinchi ishlaydi, /profile/{username} kechroq.
|--------------------------------------------------------------------------
*/


Route::prefix('v1')->group(function () {


    /* ============================
     |  Authentication & Tokens
     ============================ */
    Route::prefix('auth')->group(function () {
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



    /* ============================
     | PROTECTED AUTH USER ROUTES
     ============================ */
    Route::middleware(['auth:sanctum', RateLimitMiddleware::class . ':api,100'])->group(function () {

        /* ---- PROFILE (MAIN FIX) ---- */
        Route::get('/profile/me', [ProfileController::class, 'me']);                // ✔ Always authenticated
        Route::put('/profile', [ProfileController::class, 'update']);
        Route::put('/profile/resume', [ProfileController::class, 'updateResume']);

        /* ---- Dashboard ---- */
        Route::get('/dashboard', [DashboardController::class, 'index']);

        /* ---- Posts ---- */
        Route::post('/posts', [PostController::class, 'store']);
        Route::put('/posts/{id}', [PostController::class, 'update']);
        Route::delete('/posts/{id}', [PostController::class, 'destroy']);

        /* ---- Comments ---- */
        Route::post('/posts/{id}/comment', [CommentController::class, 'store']);
        Route::delete('/comments/{id}', [CommentController::class, 'destroy']);

        /* ---- Votes ---- */
        Route::post('/posts/{id}/vote', [VoteController::class, 'vote']);

        /* ---- Follow ---- */
        Route::post('/follow/{username}', [FollowController::class, 'toggleFollow']);

        /* ---- Bookmarks ---- */
        Route::post('/bookmark/{post}', [BookmarkController::class, 'toggle']);

        /* ---- Notifications ---- */
        Route::get('/notifications', [NotificationController::class, 'index']);
        Route::post('/notifications/read', [NotificationController::class, 'markAllRead']);

        /* ---- Reports ---- */
        Route::post('/report/post/{id}', [ReportController::class, 'postReport']);
        Route::post('/report/user/{username}', [ReportController::class, 'userReport']);

    });



    /* ============================
     | PUBLIC ROUTES
     ============================ */

    /* ---- Posts ---- */
    Route::get('/posts', [PostController::class, 'index']);
    Route::get('/posts/trending', [PostController::class, 'trending']);
    Route::get('/posts/{slug}', [PostController::class, 'show']);

    /* ---- Users ---- */
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/leaderboard', [UserController::class, 'leaderboard']);
    Route::get('/users/{username}', [UserController::class, 'show']);

    /* ---- Activity Feed ---- */
    Route::get('/activity-feed', [ActivityFeedController::class, 'index']); // 500 muammo shu controllerda bo‘lishi mumkin

    /* ---- Search ---- */
    Route::get('/search', [SearchController::class, 'search']);

    /* ---- Profile Public ---- */
    Route::get('/profile/{username}', [ProfileController::class, 'show'])
        ->where('username', '^(?!me$)[A-Za-z0-9._-]+$'); // ❗ /me ga to‘qnashmaydi

});
