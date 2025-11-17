<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\OAuthController;
use App\Http\Controllers\Auth\EmailAuthController;
use App\Http\Controllers\Api\V1\{
    PostController, CommentController, VoteController, TagController, CategoryController,
    WikiArticleController, CodeRunController, ProfileController, SearchController,
    NotificationController, BookmarkController, FollowController, UserController, LevelController,
    DashboardController, AdminController, StatsController, ActivityFeedController,
    ProjectSubdomainController, BrandingController, SystemStatusController, SolveraController
};
use App\Http\Controllers\Api\V1\ContentController;
use App\Http\Controllers\Api\V1\CollaborationController;
use App\Http\Middleware\RateLimitMiddleware;
use App\Http\Middleware\CacheMiddleware;

Route::prefix('v1')->group(function () {

    // Public Auth
    Route::post('/auth/email/register', [EmailAuthController::class, 'register']);
    Route::post('/auth/email/login', [EmailAuthController::class, 'login']);
    Route::post('/auth/email/logout', [EmailAuthController::class, 'logout'])->middleware('auth:sanctum');

    Route::get('/auth/google/redirect', [OAuthController::class, 'redirectGoogle']);
    Route::get('/auth/google/callback', [OAuthController::class, 'handleGoogleCallback']);
    Route::get('/auth/github/redirect', [OAuthController::class, 'redirectGithub']);
    Route::get('/auth/github/callback', [OAuthController::class, 'handleGithubCallback']);

    // Public Data
    Route::get('/stats/public', [StatsController::class, 'public']);
    Route::get('/stats/homepage', [StatsController::class, 'homepage']);
    Route::get('/stats/weekly-heroes', [StatsController::class, 'weeklyHeroes']);
    Route::get('/content/about', [ContentController::class, 'about']);
    Route::get('/activity-feed', [ActivityFeedController::class, 'index']);
    Route::get('/settings/logo', [BrandingController::class, 'show']);
    Route::get('/status/summary', [SystemStatusController::class, 'summary']);
    Route::post('/ai/solvera/chat', [SolveraController::class, 'chat'])
        ->middleware(RateLimitMiddleware::class . ':ai,20');

    Route::middleware([CacheMiddleware::class . ':300'])->group(function () {
        Route::get('/posts', [PostController::class, 'index']);
        Route::get('/posts/{slug}', [PostController::class, 'show']);
        Route::get('/posts/{slug}/related', [PostController::class, 'related']);
        Route::get('/posts/trending', [PostController::class, 'trending']);
        Route::get('/posts/featured', [PostController::class, 'featured']);

        Route::get('/tags', [TagController::class, 'index']);
        Route::get('/tags/{slug}', [TagController::class, 'show']);
        Route::get('/tags/trending', [TagController::class, 'trending']);

        Route::get('/levels', [LevelController::class, 'index']);

        Route::get('/categories', [CategoryController::class, 'index']);
        Route::get('/categories/{slug}', [CategoryController::class, 'show']);

        Route::get('/wiki', [WikiArticleController::class, 'index']);
        Route::get('/wiki/{slug}', [WikiArticleController::class, 'show']);
        Route::get('/wiki/{slug}/proposals', [WikiArticleController::class, 'proposals']);
        Route::get('/wiki/{slug}/proposals/{proposalId}/diff', [WikiArticleController::class, 'diff']);
    });

    // Search
    Route::get('/search', [SearchController::class, 'search']);
    Route::get('/search/suggestions', [SearchController::class, 'suggestions']);

    // Public Users
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/leaderboard', [UserController::class, 'leaderboard']);
    Route::get('/users/{username}', [UserController::class, 'show']);
    Route::get('/users/{username}/stats', [UserController::class, 'stats']);
    Route::get('/users/{username}/posts', [UserController::class, 'posts']); // ✅ muhim

    // Authenticated Routes
    Route::middleware(['auth:sanctum', RateLimitMiddleware::class . ':api,100'])->group(function () {

        // Profile
        Route::get('/profile/me', [ProfileController::class, 'me']);
        Route::put('/profile', [ProfileController::class, 'update']);

        // Posts CRUD
        Route::post('/posts', [PostController::class, 'store']);
        Route::put('/posts/{slug}', [PostController::class, 'update']);
        Route::delete('/posts/{slug}', [PostController::class, 'destroy']);

        // Collaboration Sessions
        Route::get('/posts/{slug}/collaborations/active', [CollaborationController::class, 'activeForPost']);
        Route::post('/posts/{slug}/collaborations', [CollaborationController::class, 'store']);
        Route::get('/collaborations/{session}', [CollaborationController::class, 'show']);
        Route::post('/collaborations/{session}/join', [CollaborationController::class, 'join']);
        Route::post('/collaborations/{session}/heartbeat', [CollaborationController::class, 'heartbeat']);
        Route::post('/collaborations/{session}/events', [CollaborationController::class, 'recordEvent']);
        Route::get('/collaborations/{session}/events', [CollaborationController::class, 'events']);
        Route::post('/collaborations/{session}/close', [CollaborationController::class, 'close']);

        // Comments
        Route::post('/posts/{slug}/comments', [CommentController::class, 'store']);
        Route::get('/comments/{id}', [CommentController::class, 'show']);
        Route::put('/comments/{id}', [CommentController::class, 'update']);
        Route::delete('/comments/{id}', [CommentController::class, 'destroy']);

        // Votes
        Route::post('/vote', [VoteController::class, 'vote']);
        Route::get('/vote/{type}/{id}', [VoteController::class, 'getVote']);

        // Bookmarks
        Route::get('/bookmarks', [BookmarkController::class, 'index']);
        Route::post('/bookmarks/toggle', [BookmarkController::class, 'toggle']);
        Route::get('/bookmarks/check/{postId}', [BookmarkController::class, 'check']);

        // Follow system
        Route::post('/follow/toggle', [FollowController::class, 'toggle']);
        Route::get('/users/{userId}/followers', [FollowController::class, 'followers']);
        Route::get('/users/{userId}/following', [FollowController::class, 'following']);
        Route::get('/follow/check/{userId}', [FollowController::class, 'check']);

        // Notifications
        Route::get('/notifications', [NotificationController::class, 'index']);
        Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
        Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);

        // Code Execution
        Route::middleware(RateLimitMiddleware::class . ':code-run,10')->group(function () {
            Route::post('/code-run', [CodeRunController::class, 'run']);
        });

        // Dashboard
        Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
        Route::get('/dashboard/activity', [DashboardController::class, 'activity']);
        Route::get('/dashboard/trending', [DashboardController::class, 'trending']);
        Route::get('/dashboard/analytics', [DashboardController::class, 'analytics']);

        // Admin
        Route::prefix('admin')->group(function () {
            Route::get('/dashboard', [AdminController::class, 'dashboard']);
            Route::get('/users', [AdminController::class, 'users']);
            Route::get('/posts', [AdminController::class, 'posts']);
            Route::get('/comments', [AdminController::class, 'comments']);
            Route::get('/reports', [AdminController::class, 'reports']);
            Route::get('/logs', [AdminController::class, 'logs']);
            Route::get('/activity', [AdminController::class, 'activity']);
            Route::get('/analytics', [AdminController::class, 'analytics']);
            Route::put('/users/{userId}/status', [AdminController::class, 'updateUserStatus']);
            Route::delete('/posts/{postId}', [AdminController::class, 'deletePost']);
            Route::delete('/comments/{commentId}', [AdminController::class, 'deleteComment']);
            Route::get('/settings', [AdminController::class, 'systemSettings']);
            Route::put('/settings', [AdminController::class, 'updateSystemSettings']);
            Route::post('/cache/clear', [AdminController::class, 'clearCache']);
            Route::post('/system/optimize', [AdminController::class, 'optimizeSystem']);
            Route::post('/database/backup', [AdminController::class, 'backupDatabase']);
            Route::post('/branding/logo', [BrandingController::class, 'store']);
            Route::delete('/branding/logo', [BrandingController::class, 'destroy']);

            // System monitoring
            Route::get('/system/resources', [AdminController::class, 'systemResources']);
            Route::get('/system/containers', [AdminController::class, 'containerStats']);

            // Container Management Routes
            Route::get('/containers', [ContainerController::class, 'index']);
            Route::get('/containers/options', [ContainerController::class, 'options']);
            Route::get('/containers/{container}', [ContainerController::class, 'show']);
            Route::post('/containers', [ContainerController::class, 'store']);
            Route::post('/containers/{container}/start', [ContainerController::class, 'start']);
            Route::post('/containers/{container}/stop', [ContainerController::class, 'stop']);
            Route::delete('/containers/{container}', [ContainerController::class, 'destroy']);
            Route::get('/containers/{container}/stats', [ContainerController::class, 'stats']);
        });

        // Wiki PR-like
        Route::post('/wiki', [WikiArticleController::class, 'store']);
        Route::post('/wiki/{slug}/propose', [WikiArticleController::class, 'proposeEdit']);
        Route::post('/wiki/{slug}/merge/{proposalId}', [WikiArticleController::class, 'merge']);
    });
});

$baseDomain = config('app.url_base');

if ($baseDomain && $baseDomain !== 'localhost') {
    Route::domain('{subdomain}.' . $baseDomain)->group(function () {
        Route::get('/{path?}', [ProjectSubdomainController::class, 'serve'])
            ->where('path', '.*');
    });
}

