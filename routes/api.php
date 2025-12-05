<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\OAuthController;
use App\Http\Controllers\Auth\EmailAuthController;
use App\Http\Controllers\Api\V1\{
    PostController, CommentController, VoteController, TagController, CategoryController,
    WikiArticleController, CodeRunController, ProfileController, SearchController,
    NotificationController, BookmarkController, FollowController, UserController, LevelController,
    DashboardController, AdminController, StatsController, ActivityFeedController,
    ProjectSubdomainController, BrandingController, SystemStatusController, SolveraController,
    PaymentCallbackController, ContainerController, ContainerLifecycleController,
    ContainerLogsController, ContainerStatsController, ContainerFilesController,
    ContainerEnvController, ContentController, CollaborationController
};
use App\Http\Middleware\RateLimitMiddleware;
use App\Http\Middleware\CacheMiddleware;

// =======================
//  API V1 (BASE)
// =======================
Route::prefix('v1')->group(function () {

    // AUTH PUBLIC
    Route::post('/auth/email/register', [EmailAuthController::class, 'register']);
    Route::post('/auth/email/login', [EmailAuthController::class, 'login']);
    Route::post('/auth/email/logout', [EmailAuthController::class, 'logout'])->middleware('auth:sanctum');

    // OAuth
    Route::get('/auth/google/redirect', [OAuthController::class, 'redirectGoogle']);
    Route::get('/auth/google/callback', [OAuthController::class, 'handleGoogleCallback']);
    Route::get('/auth/github/redirect', [OAuthController::class, 'redirectGithub']);
    Route::get('/auth/github/callback', [OAuthController::class, 'handleGithubCallback']);

    // Public Content
    Route::get('/stats/public', [StatsController::class, 'public']);
    Route::get('/stats/homepage', [StatsController::class, 'homepage']);
    Route::get('/stats/weekly-heroes', [StatsController::class, 'weeklyHeroes']);
    Route::get('/content/about', [ContentController::class, 'about']);
    Route::get('/activity-feed', [ActivityFeedController::class, 'index']);
    Route::get('/settings/logo', [BrandingController::class, 'show']);
    Route::get('/status/summary', [SystemStatusController::class, 'summary']);
    Route::post('/ai/solvera/chat', [SolveraController::class, 'chat'])
        ->middleware(RateLimitMiddleware::class . ':ai,20');

    // Payment
    Route::post('/payment/payme/callback', [PaymentCallbackController::class, 'payme']);
    Route::post('/payment/click/callback', [PaymentCallbackController::class, 'click']);

    // Cached public data
    Route::middleware(CacheMiddleware::class . ':300')->group(function () {

        Route::get('/posts', [PostController::class, 'index']);
        Route::get('/posts/{slug}', [PostController::class, 'show']);
        Route::get('/posts/{slug}/related', [PostController::class, 'related']);
        Route::get('/posts/trending', [PostController::class, 'trending']);
        Route::get('/posts/featured', [PostController::class, 'featured']);

        Route::get('/levels', [LevelController::class, 'index']);
        Route::get('/tags', [TagController::class, 'index']);
        Route::get('/tags/{slug}', [TagController::class, 'show']);
        Route::get('/tags/trending', [TagController::class, 'trending']);

        Route::get('/categories', [CategoryController::class, 'index']);
        Route::get('/categories/{slug}', [CategoryController::class, 'show']);

        Route::get('/wiki', [WikiArticleController::class, 'index']);
        Route::get('/wiki/{slug}', [WikiArticleController::class, 'show']);
        Route::get('/wiki/{slug}/proposals', [WikiArticleController::class, 'proposals']);
        Route::get('/wiki/{slug}/proposals/{proposalId}/diff', [WikiArticleController::class, 'diff']);
    });

    // Search & Users
    Route::get('/search', [SearchController::class, 'search']);
    Route::get('/search/suggestions', [SearchController::class, 'suggestions']);
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/leaderboard', [UserController::class, 'leaderboard']);
    Route::get('/users/{username}', [UserController::class, 'show']);
    Route::get('/users/{username}/stats', [UserController::class, 'stats']);
    Route::get('/users/{username}/posts', [UserController::class, 'posts']);
    Route::get('/profile/{username}', [ProfileController::class, 'show']);

    // =======================
    //  AUTH REQUIRED SECTION
    // =======================
    Route::middleware(['auth:sanctum', RateLimitMiddleware::class . ':api,100'])->group(function () {

        Route::get('/profile/me', [ProfileController::class, 'me']);
        Route::put('/profile', [ProfileController::class, 'update']);
        Route::put('/profile/resume', [ProfileController::class, 'updateResume']);

        Route::post('/posts', [PostController::class, 'store']);
        Route::put('/posts/{slug}', [PostController::class, 'update']);
        Route::delete('/posts/{slug}', [PostController::class, 'destroy']);

        Route::post('/vote', [VoteController::class, 'vote']);
        Route::get('/vote/{type}/{id}', [VoteController::class, 'getVote']);

        Route::get('/bookmarks', [BookmarkController::class, 'index']);
        Route::post('/bookmarks/toggle', [BookmarkController::class, 'toggle']);
        Route::get('/bookmarks/check/{postId}', [BookmarkController::class, 'check']);

        Route::post('/follow/toggle', [FollowController::class, 'toggle']);
        Route::get('/users/{userId}/followers', [FollowController::class, 'followers']);
        Route::get('/users/{userId}/following', [FollowController::class, 'following']);
        Route::get('/follow/check/{userId}', [FollowController::class, 'check']);

        Route::middleware(RateLimitMiddleware::class . ':code-run,10')->post('/code-run', [CodeRunController::class, 'run']);

        Route::get('/notifications', [NotificationController::class, 'index']);
        Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
        Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);

        Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
        Route::get('/dashboard/activity', [DashboardController::class, 'activity']);
        Route::get('/dashboard/trending', [DashboardController::class, 'trending']);
        Route::get('/dashboard/analytics', [DashboardController::class, 'analytics']);
        Route::get('/dashboard/posts', [DashboardController::class, 'posts']);
    });
});

