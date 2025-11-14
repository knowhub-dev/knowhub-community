<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Post;
use App\Models\Comment;
use App\Models\WikiArticle;
use App\Models\CodeRun;
use App\Models\Category;
use App\Models\Tag;
use App\Models\Notification;
use App\Models\Vote;
use App\Models\Follow;
use App\Models\Bookmark;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use App\Support\Settings;

class AdminController extends Controller
{
    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            if (!$request->user() || !$this->isAdmin($request->user())) {
                return response()->json(['message' => 'Unauthorized - Admin access required'], 403);
            }
            return $next($request);
        });
    }

    private function isAdmin($user): bool
    {
        return $user->is_admin || $user->email === 'admin@knowhub.uz' || $user->id === 1;
    }

    public function dashboard()
    {
        $cacheKey = 'admin:dashboard:stats';
        
        $stats = Cache::remember($cacheKey, 300, function () {
            return [
                'users' => [
                    'total' => User::count(),
                    'active_today' => User::whereDate('updated_at', today())->count(),
                    'new_this_week' => User::whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
                    'new_this_month' => User::whereMonth('created_at', now()->month)->count(),
                    'banned' => User::where('is_banned', true)->count(),
                    'admins' => User::where('is_admin', true)->count(),
                    'online_now' => User::where('updated_at', '>=', now()->subMinutes(5))->count(),
                    'verified' => User::whereNotNull('email_verified_at')->count(),
                    'with_posts' => User::has('posts')->count(),
                    'top_contributors' => User::withCount(['posts' => fn($q) => $q->where('status', 'published')])
                        ->orderByDesc('posts_count')
                        ->limit(5)
                        ->get(['id', 'name', 'username', 'xp', 'posts_count']),
                ],
                'posts' => [
                    'total' => Post::count(),
                    'published' => Post::where('status', 'published')->count(),
                    'draft' => Post::where('status', 'draft')->count(),
                    'today' => Post::whereDate('created_at', today())->count(),
                    'this_week' => Post::whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
                    'this_month' => Post::whereMonth('created_at', now()->month)->count(),
                    'high_score' => Post::where('score', '>', 10)->count(),
                    'with_ai' => Post::where('is_ai_suggested', true)->count(),
                    'trending' => Post::where('created_at', '>=', now()->subDays(7))->where('score', '>', 5)->count(),
                    'unanswered' => Post::where('answers_count', 0)->where('created_at', '>=', now()->subDays(7))->count(),
                    'avg_score' => round(Post::where('status', 'published')->avg('score'), 2),
                    'avg_comments' => round(Post::where('status', 'published')->avg('answers_count'), 2),
                ],
                'comments' => [
                    'total' => Comment::count(),
                    'today' => Comment::whereDate('created_at', today())->count(),
                    'this_week' => Comment::whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
                    'this_month' => Comment::whereMonth('created_at', now()->month)->count(),
                    'high_score' => Comment::where('score', '>', 5)->count(),
                    'avg_score' => round(Comment::avg('score'), 2),
                    'top_commenters' => User::withCount('comments')
                        ->orderByDesc('comments_count')
                        ->limit(5)
                        ->get(['id', 'name', 'username', 'comments_count']),
                ],
                'wiki' => [
                    'articles' => WikiArticle::count(),
                    'published' => WikiArticle::where('status', 'published')->count(),
                    'draft' => WikiArticle::where('status', 'draft')->count(),
                    'proposals' => DB::table('wiki_proposals')->where('status', 'pending')->count(),
                    'recent_edits' => WikiArticle::where('updated_at', '>=', now()->subDays(7))->count(),
                    'total_versions' => WikiArticle::sum('version'),
                ],
                'code_runs' => [
                    'total' => CodeRun::count(),
                    'successful' => CodeRun::where('status', 'success')->count(),
                    'failed' => CodeRun::where('status', 'failed')->count(),
                    'today' => CodeRun::whereDate('created_at', today())->count(),
                    'this_week' => CodeRun::whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
                    'by_language' => CodeRun::selectRaw('language, COUNT(*) as count, AVG(runtime_ms) as avg_runtime')
                        ->groupBy('language')
                        ->orderByDesc('count')
                        ->limit(10)
                        ->get(),
                    'avg_runtime' => round(CodeRun::where('status', 'success')->avg('runtime_ms'), 2),
                    'success_rate' => round(CodeRun::where('status', 'success')->count() / max(1, CodeRun::count()) * 100, 2),
                ],
                'categories' => [
                    'total' => Category::count(),
                    'with_posts' => Category::has('posts')->count(),
                    'popular' => Category::withCount(['posts' => fn($q) => $q->where('status', 'published')])
                        ->orderByDesc('posts_count')
                        ->limit(5)
                        ->get(['id', 'name', 'slug', 'posts_count']),
                ],
                'tags' => [
                    'total' => Tag::count(),
                    'used' => Tag::has('posts')->count(),
                    'trending' => DB::table('post_tag')
                        ->join('tags', 'post_tag.tag_id', '=', 'tags.id')
                        ->join('posts', 'post_tag.post_id', '=', 'posts.id')
                        ->where('posts.created_at', '>=', now()->subDays(7))
                        ->where('posts.status', 'published')
                        ->select('tags.name', 'tags.slug', DB::raw('COUNT(*) as usage_count'))
                        ->groupBy('tags.id', 'tags.name', 'tags.slug')
                        ->orderByDesc('usage_count')
                        ->limit(10)
                        ->get(),
                ],
                'notifications' => [
                    'total' => Notification::count(),
                    'unread' => Notification::whereNull('read_at')->count(),
                    'today' => Notification::whereDate('created_at', today())->count(),
                    'this_week' => Notification::whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
                    'by_type' => Notification::selectRaw('type, COUNT(*) as count')
                        ->groupBy('type')
                        ->orderByDesc('count')
                        ->get(),
                ],
                'votes' => [
                    'total' => Vote::count(),
                    'positive' => Vote::where('value', 1)->count(),
                    'negative' => Vote::where('value', -1)->count(),
                    'today' => Vote::whereDate('created_at', today())->count(),
                    'this_week' => Vote::whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
                    'engagement_rate' => $this->calculateEngagementRate(),
                    'top_voted_posts' => Post::orderByDesc('score')->limit(5)->get(['id', 'title', 'slug', 'score']),
                ],
                'follows' => [
                    'total' => Follow::count(),
                    'today' => Follow::whereDate('created_at', today())->count(),
                    'this_week' => Follow::whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
                    'most_followed' => User::withCount('followers')
                        ->orderByDesc('followers_count')
                        ->limit(5)
                        ->get(['id', 'name', 'username', 'followers_count']),
                ],
                'bookmarks' => [
                    'total' => Bookmark::count(),
                    'today' => Bookmark::whereDate('created_at', today())->count(),
                    'most_bookmarked' => Post::withCount('bookmarks')
                        ->orderByDesc('bookmarks_count')
                        ->limit(5)
                        ->get(['id', 'title', 'slug', 'bookmarks_count']),
                ],
                'system' => [
                    'php_version' => PHP_VERSION,
                    'laravel_version' => app()->version(),
                    'database_size' => $this->getDatabaseSize(),
                    'storage_used' => $this->getStorageUsed(),
                    'cache_status' => $this->getCacheStatus(),
                    'queue_jobs' => DB::table('jobs')->count(),
                    'failed_jobs' => DB::table('failed_jobs')->count(),
                    'uptime' => $this->getUptime(),
                    'memory_usage' => $this->getMemoryUsage(),
                    'disk_usage' => $this->getDiskUsage(),
                ],
                'security' => [
                    'failed_logins_today' => $this->getFailedLoginsToday(),
                    'blocked_ips' => $this->getBlockedIPs(),
                    'suspicious_activity' => $this->getSuspiciousActivity(),
                    'banned_users' => User::where('is_banned', true)->count(),
                ],
                'performance' => [
                    'avg_response_time' => $this->getAverageResponseTime(),
                    'slow_queries' => $this->getSlowQueries(),
                    'cache_hit_rate' => $this->getCacheHitRate(),
                    'error_rate' => $this->getErrorRate(),
                ],
            ];
        });

        return response()->json($stats);
    }

    public function users(Request $request)
    {
        $query = User::with('level')
            ->withCount(['posts', 'comments', 'followers', 'following', 'bookmarks']);

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('username', 'LIKE', "%{$search}%")
                  ->orWhere('email', 'LIKE', "%{$search}%");
            });
        }

        if ($status = $request->get('status')) {
            switch ($status) {
                case 'active':
                    $query->where('updated_at', '>=', now()->subDays(7));
                    break;
                case 'inactive':
                    $query->where('updated_at', '<', now()->subDays(30));
                    break;
                case 'new':
                    $query->where('created_at', '>=', now()->subDays(7));
                    break;
                case 'banned':
                    $query->where('is_banned', true);
                    break;
                case 'admin':
                    $query->where('is_admin', true);
                    break;
                case 'verified':
                    $query->whereNotNull('email_verified_at');
                    break;
            }
        }

        if ($level = $request->get('level')) {
            $query->whereHas('level', fn($q) => $q->where('slug', $level));
        }

        $users = $query->latest()->paginate(20);
        
        return response()->json($users);
    }

    public function posts(Request $request)
    {
        $query = Post::with(['user', 'category', 'tags'])
            ->withCount(['comments', 'votes', 'bookmarks']);

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'LIKE', "%{$search}%")
                  ->orWhere('content_markdown', 'LIKE', "%{$search}%");
            });
        }

        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }

        if ($category = $request->get('category')) {
            $query->where('category_id', $category);
        }

        if ($request->get('ai_suggested')) {
            $query->where('is_ai_suggested', true);
        }

        if ($request->get('high_score')) {
            $query->where('score', '>', 10);
        }

        if ($request->get('no_comments')) {
            $query->where('answers_count', 0);
        }

        $posts = $query->latest()->paginate(20);
        
        return response()->json($posts);
    }

    public function comments(Request $request)
    {
        $query = Comment::with(['user', 'post'])
            ->withCount('votes');

        if ($search = $request->get('search')) {
            $query->where('content_markdown', 'LIKE', "%{$search}%");
        }

        if ($postId = $request->get('post_id')) {
            $query->where('post_id', $postId);
        }

        if ($request->get('high_score')) {
            $query->where('score', '>', 5);
        }

        if ($request->get('recent')) {
            $query->where('created_at', '>=', now()->subDays(7));
        }

        $comments = $query->latest()->paginate(20);
        
        return response()->json($comments);
    }

    public function analytics(Request $request)
    {
        $period = $request->get('period', '30'); // days
        $startDate = now()->subDays((int)$period);

        $cacheKey = "admin:analytics:{$period}";
        
        $analytics = Cache::remember($cacheKey, 1800, function () use ($startDate) {
            return [
                'user_growth' => $this->getUserGrowth($startDate),
                'post_activity' => $this->getPostActivity($startDate),
                'comment_activity' => $this->getCommentActivity($startDate),
                'engagement_metrics' => $this->getEngagementMetrics($startDate),
                'popular_categories' => $this->getPopularCategories($startDate),
                'popular_tags' => $this->getPopularTags($startDate),
                'code_execution_stats' => $this->getCodeExecutionStats($startDate),
                'top_users' => $this->getTopUsers($startDate),
                'geographic_data' => $this->getGeographicData($startDate),
                'device_stats' => $this->getDeviceStats($startDate),
            ];
        });

        return response()->json($analytics);
    }

    public function reports(Request $request)
    {
        // Placeholder for future report system
        return response()->json([
            'data' => [],
            'total' => 0,
            'pending' => 0,
            'resolved' => 0,
            'categories' => [
                'spam' => 0,
                'inappropriate' => 0,
                'harassment' => 0,
                'copyright' => 0,
                'other' => 0,
            ]
        ]);
    }

    public function logs(Request $request)
    {
        try {
            $logFile = storage_path('logs/laravel.log');
            if (!file_exists($logFile)) {
                return response()->json(['data' => [], 'message' => 'Log fayl topilmadi']);
            }

            $lines = array_slice(file($logFile), -200); // So'nggi 200 ta log
            $logs = [];
            
            foreach (array_reverse($lines) as $line) {
                if (preg_match('/\[(.*?)\] (\w+)\.(\w+): (.*)/', $line, $matches)) {
                    $logs[] = [
                        'timestamp' => $matches[1],
                        'level' => $matches[2],
                        'context' => $matches[3],
                        'message' => trim($matches[4]),
                        'severity' => $this->getLogSeverity($matches[2]),
                    ];
                }
            }

            return response()->json([
                'data' => array_slice($logs, 0, 100), // Faqat 100 ta ko'rsatish
                'total' => count($logs),
                'levels' => array_count_values(array_column($logs, 'level')),
            ]);
        } catch (\Exception $e) {
            Log::error('Admin log reading error: ' . $e->getMessage());
            return response()->json(['data' => [], 'error' => 'Log faylini o\'qib bo\'lmadi']);
        }
    }

    public function activity(Request $request)
    {
        $limit = $request->get('limit', 50);
        
        $cacheKey = "admin:activity:{$limit}";
        
        $activities = Cache::remember($cacheKey, 300, function () use ($limit) {
            $activities = collect();

            // Recent posts
            $recentPosts = Post::with('user')
                ->latest()
                ->limit($limit / 4)
                ->get()
                ->map(fn($post) => [
                    'id' => $post->id,
                    'type' => 'post',
                    'action' => 'created',
                    'user' => $post->user->only(['name', 'username', 'avatar_url']),
                    'target' => $post->title,
                    'target_url' => route('posts.show', $post->slug),
                    'created_at' => $post->created_at,
                    'metadata' => [
                        'score' => $post->score,
                        'comments' => $post->answers_count,
                        'category' => $post->category?->name,
                    ]
                ]);

            // Recent comments
            $recentComments = Comment::with(['user', 'post'])
                ->latest()
                ->limit($limit / 4)
                ->get()
                ->map(fn($comment) => [
                    'id' => $comment->id,
                    'type' => 'comment',
                    'action' => 'created',
                    'user' => $comment->user->only(['name', 'username', 'avatar_url']),
                    'target' => 'Komment: ' . Str::limit($comment->content_markdown, 50),
                    'target_url' => route('posts.show', $comment->post->slug) . '#comment-' . $comment->id,
                    'created_at' => $comment->created_at,
                    'metadata' => [
                        'post_title' => $comment->post->title,
                        'score' => $comment->score,
                    ]
                ]);

            // Recent users
            $recentUsers = User::latest()
                ->limit($limit / 4)
                ->get()
                ->map(fn($user) => [
                    'id' => $user->id,
                    'type' => 'user',
                    'action' => 'registered',
                    'user' => $user->only(['name', 'username', 'avatar_url']),
                    'target' => 'Yangi foydalanuvchi',
                    'target_url' => route('profile.show', $user->username),
                    'created_at' => $user->created_at,
                    'metadata' => [
                        'xp' => $user->xp,
                        'level' => $user->level?->name,
                    ]
                ]);

            // Recent wiki articles
            $recentWiki = WikiArticle::latest()
                ->limit($limit / 4)
                ->get()
                ->map(fn($article) => [
                    'id' => $article->id,
                    'type' => 'wiki',
                    'action' => 'created',
                    'user' => User::find($article->created_by)?->only(['name', 'username', 'avatar_url']),
                    'target' => $article->title,
                    'target_url' => route('wiki.show', $article->slug),
                    'created_at' => $article->created_at,
                    'metadata' => [
                        'version' => $article->version,
                        'status' => $article->status,
                    ]
                ]);

            return $activities
                ->concat($recentPosts)
                ->concat($recentComments)
                ->concat($recentUsers)
                ->concat($recentWiki)
                ->sortByDesc('created_at')
                ->take($limit)
                ->values();
        });

        return response()->json(['data' => $activities]);
    }

    public function updateUserStatus(Request $request, $userId)
    {
        $data = $request->validate([
            'is_admin' => 'sometimes|boolean',
            'is_banned' => 'sometimes|boolean',
            'ban_reason' => 'sometimes|string|max:500',
        ]);

        $user = User::findOrFail($userId);
        
        // Prevent self-demotion
        if ($user->id === $request->user()->id && isset($data['is_admin']) && !$data['is_admin']) {
            return response()->json(['message' => 'O\'zingizni admin huquqidan mahrum qila olmaysiz'], 422);
        }

        $user->update($data);

        Log::info('User status updated', [
            'admin_id' => $request->user()->id,
            'target_user_id' => $userId,
            'changes' => $data,
        ]);

        return response()->json(['message' => 'Foydalanuvchi holati yangilandi', 'user' => $user]);
    }

    public function deletePost($postId)
    {
        $post = Post::findOrFail($postId);
        
        Log::warning('Post deleted by admin', [
            'admin_id' => auth()->id(),
            'post_id' => $postId,
            'post_title' => $post->title,
            'post_author' => $post->user->name,
        ]);
        
        $post->delete();

        return response()->json(['message' => 'Post o\'chirildi']);
    }

    public function deleteComment($commentId)
    {
        $comment = Comment::findOrFail($commentId);
        
        Log::warning('Comment deleted by admin', [
            'admin_id' => auth()->id(),
            'comment_id' => $commentId,
            'comment_author' => $comment->user->name,
            'post_title' => $comment->post->title,
        ]);
        
        $comment->delete();

        return response()->json(['message' => 'Komment o\'chirildi']);
    }

    public function systemSettings()
    {
        $settings = [
            'maintenance_mode' => app()->isDownForMaintenance(),
            'registration_enabled' => Cache::get('settings.registration_enabled', true),
            'max_posts_per_day' => Cache::get('settings.max_posts_per_day', 10),
            'max_comments_per_day' => Cache::get('settings.max_comments_per_day', 50),
            'code_execution_enabled' => Cache::get('settings.code_execution_enabled', true),
            'ai_suggestions_enabled' => Cache::get('settings.ai_suggestions_enabled', true),
            'email_notifications_enabled' => Cache::get('settings.email_notifications_enabled', true),
            'auto_moderation_enabled' => Cache::get('settings.auto_moderation_enabled', false),
            'site_title' => Settings::get('site.title', config('app.name', 'KnowHub Community')),
            'site_tagline' => Settings::get('site.tagline', "Dasturchilar hamjamiyati"),
            'seo_meta_description' => Settings::get('seo.meta_description'),
            'seo_meta_keywords' => Settings::get('seo.meta_keywords', []),
            'branding' => [
                'light' => $this->formatLogo(Settings::get('branding.logo.light')),
                'dark' => $this->formatLogo(Settings::get('branding.logo.dark')),
            ],
        ];

        return response()->json($settings);
    }

    public function updateSystemSettings(Request $request)
    {
        $data = $request->validate([
            'maintenance_mode' => 'sometimes|boolean',
            'registration_enabled' => 'sometimes|boolean',
            'max_posts_per_day' => 'sometimes|integer|min:1|max:100',
            'max_comments_per_day' => 'sometimes|integer|min:1|max:500',
            'code_execution_enabled' => 'sometimes|boolean',
            'ai_suggestions_enabled' => 'sometimes|boolean',
            'email_notifications_enabled' => 'sometimes|boolean',
            'auto_moderation_enabled' => 'sometimes|boolean',
            'site_title' => 'sometimes|string|max:120',
            'site_tagline' => 'sometimes|string|max:200',
            'seo_meta_description' => 'sometimes|string|max:160',
            'seo_meta_keywords' => 'sometimes|array',
        ]);

        $cacheKeys = [
            'maintenance_mode',
            'registration_enabled',
            'max_posts_per_day',
            'max_comments_per_day',
            'code_execution_enabled',
            'ai_suggestions_enabled',
            'email_notifications_enabled',
            'auto_moderation_enabled',
        ];

        foreach (array_intersect_key($data, array_flip($cacheKeys)) as $key => $value) {
            Cache::forever("settings.{$key}", $value);
        }

        if (isset($data['maintenance_mode'])) {
            if ($data['maintenance_mode']) {
                Artisan::call('down');
            } else {
                Artisan::call('up');
            }
        }

        if (array_key_exists('site_title', $data)) {
            Settings::set('site.title', $data['site_title']);
        }

        if (array_key_exists('site_tagline', $data)) {
            Settings::set('site.tagline', $data['site_tagline']);
        }

        if (array_key_exists('seo_meta_description', $data)) {
            Settings::set('seo.meta_description', $data['seo_meta_description']);
        }

        if (array_key_exists('seo_meta_keywords', $data)) {
            Settings::set('seo.meta_keywords', array_values($data['seo_meta_keywords']), 'json');
        }

        Log::info('System settings updated', [
            'admin_id' => $request->user()->id,
            'changes' => $data,
        ]);

        return response()->json(['message' => 'Tizim sozlamalari yangilandi']);
    }

    private function formatLogo($path): ?array
    {
        if (!$path) {
            return null;
        }

        return [
            'path' => $path,
            'url' => Storage::disk('public')->url($path),
        ];
    }

    public function clearCache()
    {
        try {
            Artisan::call('cache:clear');
            Artisan::call('config:clear');
            Artisan::call('route:clear');
            Artisan::call('view:clear');
            
            Log::info('Cache cleared by admin', ['admin_id' => auth()->id()]);
            
            return response()->json(['message' => 'Cache muvaffaqiyatli tozalandi']);
        } catch (\Exception $e) {
            Log::error('Cache clear error: ' . $e->getMessage());
            return response()->json(['message' => 'Cache tozalashda xatolik: ' . $e->getMessage()], 500);
        }
    }

    public function optimizeSystem()
    {
        try {
            Artisan::call('config:cache');
            Artisan::call('route:cache');
            Artisan::call('view:cache');
            Artisan::call('optimize');
            
            Log::info('System optimized by admin', ['admin_id' => auth()->id()]);
            
            return response()->json(['message' => 'Tizim muvaffaqiyatli optimallashtirildi']);
        } catch (\Exception $e) {
            Log::error('System optimization error: ' . $e->getMessage());
            return response()->json(['message' => 'Tizimni optimallashtirishda xatolik: ' . $e->getMessage()], 500);
        }
    }

    public function backupDatabase()
    {
        try {
            $filename = 'backup_' . date('Y_m_d_H_i_s') . '.sql';
            $backupPath = storage_path('app/backups');
            
            if (!file_exists($backupPath)) {
                mkdir($backupPath, 0755, true);
            }
            
            $fullPath = $backupPath . '/' . $filename;
            
            $command = sprintf(
                'mysqldump -u%s -p%s %s > %s 2>/dev/null',
                escapeshellarg(config('database.connections.mysql.username')),
                escapeshellarg(config('database.connections.mysql.password')),
                escapeshellarg(config('database.connections.mysql.database')),
                escapeshellarg($fullPath)
            );
            
            exec($command, $output, $return_var);
            
            if ($return_var === 0 && file_exists($fullPath)) {
                $size = filesize($fullPath);
                
                Log::info('Database backup created', [
                    'admin_id' => auth()->id(),
                    'filename' => $filename,
                    'size' => $size,
                ]);
                
                return response()->json([
                    'message' => 'Database backup muvaffaqiyatli yaratildi',
                    'filename' => $filename,
                    'size' => $this->formatBytes($size),
                    'download_url' => route('admin.download-backup', $filename)
                ]);
            } else {
                throw new \Exception('Backup yaratishda xatolik yuz berdi');
            }
        } catch (\Exception $e) {
            Log::error('Database backup error: ' . $e->getMessage());
            return response()->json(['message' => 'Backup yaratishda xatolik: ' . $e->getMessage()], 500);
        }
    }

    // Helper methods
    private function calculateEngagementRate()
    {
        $totalPosts = Post::where('status', 'published')->count();
        $totalVotes = Vote::count();
        
        return $totalPosts > 0 ? round(($totalVotes / $totalPosts) * 100, 2) : 0;
    }

    private function getDatabaseSize(): string
    {
        try {
            $dbName = config('database.connections.mysql.database');
            $size = DB::select("SELECT ROUND(SUM(data_length + index_length) / 1024 / 1024, 1) AS 'size' FROM information_schema.tables WHERE table_schema = ?", [$dbName]);
            return ($size[0]->size ?? 0) . ' MB';
        } catch (\Exception $e) {
            return 'N/A';
        }
    }

    private function getStorageUsed(): string
    {
        try {
            $bytes = 0;
            $storagePath = storage_path();
            
            if (is_dir($storagePath)) {
                $iterator = new \RecursiveIteratorIterator(
                    new \RecursiveDirectoryIterator($storagePath, \RecursiveDirectoryIterator::SKIP_DOTS)
                );
                foreach ($iterator as $file) {
                    $bytes += $file->getSize();
                }
            }
            
            return $this->formatBytes($bytes);
        } catch (\Exception $e) {
            return 'N/A';
        }
    }

    private function getCacheStatus(): string
    {
        try {
            Cache::put('admin_test', 'working', 60);
            $test = Cache::get('admin_test');
            Cache::forget('admin_test');
            
            return $test === 'working' ? 'Ishlayapti' : 'Ishlamayapti';
        } catch (\Exception $e) {
            return 'Xatolik';
        }
    }

    private function getUptime(): string
    {
        try {
            if (function_exists('shell_exec')) {
                $uptime = shell_exec('uptime -p 2>/dev/null');
                return trim($uptime) ?: 'N/A';
            }
            return 'N/A';
        } catch (\Exception $e) {
            return 'N/A';
        }
    }

    private function getMemoryUsage(): string
    {
        return $this->formatBytes(memory_get_usage(true));
    }

    private function getDiskUsage(): string
    {
        try {
            $bytes = disk_free_space('/');
            $total = disk_total_space('/');
            
            if ($bytes !== false && $total !== false) {
                $used = $total - $bytes;
                $percentage = round(($used / $total) * 100, 1);
                return $this->formatBytes($used) . ' (' . $percentage . '%)';
            }
            
            return 'N/A';
        } catch (\Exception $e) {
            return 'N/A';
        }
    }

    private function formatBytes($bytes, $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, $precision) . ' ' . $units[$i];
    }

    private function getLogSeverity($level): int
    {
        $severities = [
            'emergency' => 5,
            'alert' => 5,
            'critical' => 5,
            'error' => 4,
            'warning' => 3,
            'notice' => 2,
            'info' => 1,
            'debug' => 0,
        ];
        
        return $severities[strtolower($level)] ?? 1;
    }

    private function getUserGrowth($startDate)
    {
        return User::where('created_at', '>=', $startDate)
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();
    }

    private function getPostActivity($startDate)
    {
        return Post::where('created_at', '>=', $startDate)
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count, AVG(score) as avg_score')
            ->groupBy('date')
            ->orderBy('date')
            ->get();
    }

    private function getCommentActivity($startDate)
    {
        return Comment::where('created_at', '>=', $startDate)
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();
    }

    private function getEngagementMetrics($startDate)
    {
        return [
            'avg_comments_per_post' => round(Post::where('created_at', '>=', $startDate)->avg('answers_count'), 2),
            'avg_score_per_post' => round(Post::where('created_at', '>=', $startDate)->avg('score'), 2),
            'total_votes' => Vote::where('created_at', '>=', $startDate)->count(),
            'positive_votes' => Vote::where('created_at', '>=', $startDate)->where('value', 1)->count(),
            'negative_votes' => Vote::where('created_at', '>=', $startDate)->where('value', -1)->count(),
            'active_users' => User::whereHas('posts', function ($q) use ($startDate) {
                $q->where('created_at', '>=', $startDate);
            })->orWhereHas('comments', function ($q) use ($startDate) {
                $q->where('created_at', '>=', $startDate);
            })->count(),
            'user_retention' => $this->calculateUserRetention($startDate),
        ];
    }

    private function calculateUserRetention($startDate)
    {
        $newUsers = User::where('created_at', '>=', $startDate)->count();
        $activeNewUsers = User::where('created_at', '>=', $startDate)
            ->where('updated_at', '>=', now()->subDays(7))
            ->count();
            
        return $newUsers > 0 ? round(($activeNewUsers / $newUsers) * 100, 2) : 0;
    }

    private function getPopularCategories($startDate)
    {
        return DB::table('posts')
            ->join('categories', 'posts.category_id', '=', 'categories.id')
            ->where('posts.created_at', '>=', $startDate)
            ->where('posts.status', 'published')
            ->select('categories.name', 'categories.slug', DB::raw('COUNT(*) as posts_count'), DB::raw('AVG(posts.score) as avg_score'))
            ->groupBy('categories.id', 'categories.name', 'categories.slug')
            ->orderByDesc('posts_count')
            ->limit(10)
            ->get();
    }

    private function getPopularTags($startDate)
    {
        return DB::table('post_tag')
            ->join('tags', 'post_tag.tag_id', '=', 'tags.id')
            ->join('posts', 'post_tag.post_id', '=', 'posts.id')
            ->where('posts.created_at', '>=', $startDate)
            ->where('posts.status', 'published')
            ->select('tags.name', 'tags.slug', DB::raw('COUNT(*) as usage_count'), DB::raw('AVG(posts.score) as avg_score'))
            ->groupBy('tags.id', 'tags.name', 'tags.slug')
            ->orderByDesc('usage_count')
            ->limit(15)
            ->get();
    }

    private function getCodeExecutionStats($startDate)
    {
        return [
            'total_runs' => CodeRun::where('created_at', '>=', $startDate)->count(),
            'success_rate' => round(CodeRun::where('created_at', '>=', $startDate)
                ->where('status', 'success')
                ->count() / max(1, CodeRun::where('created_at', '>=', $startDate)->count()) * 100, 2),
            'popular_languages' => CodeRun::where('created_at', '>=', $startDate)
                ->selectRaw('language, COUNT(*) as count, AVG(runtime_ms) as avg_runtime, SUM(CASE WHEN status = "success" THEN 1 ELSE 0 END) as success_count')
                ->groupBy('language')
                ->orderByDesc('count')
                ->get(),
            'avg_runtime' => round(CodeRun::where('created_at', '>=', $startDate)
                ->where('status', 'success')
                ->avg('runtime_ms'), 2),
            'daily_usage' => CodeRun::where('created_at', '>=', $startDate)
                ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
                ->groupBy('date')
                ->orderBy('date')
                ->get(),
        ];
    }

    private function getTopUsers($startDate)
    {
        return User::with('level')
            ->withCount([
                'posts' => fn($q) => $q->where('created_at', '>=', $startDate)->where('status', 'published'),
                'comments' => fn($q) => $q->where('created_at', '>=', $startDate),
            ])
            ->having('posts_count', '>', 0)
            ->orderByDesc('posts_count')
            ->limit(10)
            ->get();
    }

    private function getGeographicData($startDate)
    {
        // Placeholder - kelajakda IP geolocation qo'shiladi
        return [
            'countries' => [
                ['name' => 'O\'zbekiston', 'users' => User::count() * 0.7],
                ['name' => 'Rossiya', 'users' => User::count() * 0.15],
                ['name' => 'Qozog\'iston', 'users' => User::count() * 0.1],
                ['name' => 'Boshqalar', 'users' => User::count() * 0.05],
            ]
        ];
    }

    private function getDeviceStats($startDate)
    {
        // Placeholder - kelajakda user agent tracking qo'shiladi
        return [
            'desktop' => 60,
            'mobile' => 35,
            'tablet' => 5,
        ];
    }

    public function containers(Request $request)
    {
        $query = Container::with(['user', 'stats'])
            ->withCount(['stats as recent_stats_count' => function ($query) {
                $query->where('created_at', '>=', now()->subMinutes(5));
            }]);

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('image', 'LIKE', "%{$search}%");
            });
        }

        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }

        if ($userId = $request->get('user_id')) {
            $query->where('user_id', $userId);
        }

        $containers = $query->latest()->paginate(20);
        
        return response()->json($containers);
    }

    public function containerStats(Request $request)
    {
        $startDate = now()->subHours($request->get('hours', 24));
        $groupBy = $request->get('group_by', 'hour'); // hour, minute

        $stats = ContainerStats::selectRaw('
                DATE_FORMAT(created_at, ?) as period,
                AVG(cpu_usage) as avg_cpu,
                AVG(memory_usage) as avg_memory,
                AVG(disk_usage) as avg_disk,
                AVG(network_rx) as avg_network_rx,
                AVG(network_tx) as avg_network_tx,
                COUNT(DISTINCT container_id) as active_containers
            ', [
                $groupBy === 'hour' ? '%Y-%m-%d %H:00:00' : '%Y-%m-%d %H:%i:00'
            ])
            ->where('created_at', '>=', $startDate)
            ->groupByRaw('period')
            ->orderBy('period')
            ->get();

        return response()->json([
            'stats' => $stats,
            'summary' => [
                'total_containers' => Container::count(),
                'running_containers' => Container::where('status', 'running')->count(),
                'stopped_containers' => Container::where('status', 'stopped')->count(),
                'failed_containers' => Container::where('status', 'failed')->count(),
                'total_cpu_usage' => ContainerStats::where('created_at', '>=', now()->subMinutes(5))->avg('cpu_usage'),
                'total_memory_usage' => ContainerStats::where('created_at', '>=', now()->subMinutes(5))->avg('memory_usage'),
                'total_disk_usage' => ContainerStats::where('created_at', '>=', now()->subMinutes(5))->avg('disk_usage'),
                'total_network_rx' => ContainerStats::where('created_at', '>=', now()->subMinutes(5))->sum('network_rx'),
                'total_network_tx' => ContainerStats::where('created_at', '>=', now()->subMinutes(5))->sum('network_tx'),
            ]
        ]);
    }

    public function startContainer(Request $request, Container $container)
    {
        $this->authorize('manage', $container);
        
        try {
            app(ContainerService::class)->startContainer($container);
            return response()->json(['message' => 'Container started successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function stopContainer(Request $request, Container $container)
    {
        $this->authorize('manage', $container);
        
        try {
            app(ContainerService::class)->stopContainer($container);
            return response()->json(['message' => 'Container stopped successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function restartContainer(Request $request, Container $container)
    {
        $this->authorize('manage', $container);
        
        try {
            app(ContainerService::class)->restartContainer($container);
            return response()->json(['message' => 'Container restarted successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function deleteContainer(Request $request, Container $container)
    {
        $this->authorize('manage', $container);
        
        try {
            app(ContainerService::class)->deleteContainer($container);
            return response()->json(['message' => 'Container deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getContainerLogs(Request $request, Container $container)
    {
        $this->authorize('manage', $container);
        
        try {
            $lines = $request->get('lines', 100);
            $logs = app(ContainerService::class)->getContainerLogs($container, $lines);
            return response()->json(['logs' => $logs]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // Security methods
    private function getFailedLoginsToday(): int
    {
        // Placeholder - kelajakda failed login tracking qo'shiladi
        return 0;
    }

    private function getBlockedIPs(): int
    {
        // Placeholder - kelajakda IP blocking qo'shiladi
        return 0;
    }

    private function getSuspiciousActivity(): int
    {
        // Placeholder - kelajakda suspicious activity detection qo'shiladi
        return 0;
    }

    // Performance methods
    private function getAverageResponseTime(): string
    {
        // Placeholder - kelajakda response time tracking qo'shiladi
        return '120ms';
    }

    private function getSlowQueries(): int
    {
        try {
            $result = DB::select("SHOW GLOBAL STATUS LIKE 'Slow_queries'");
            return $result[0]->Value ?? 0;
        } catch (\Exception $e) {
            return 0;
        }
    }

    private function getCacheHitRate(): string
    {
        // Placeholder - kelajakda cache metrics qo'shiladi
        return '85%';
    }

    private function getErrorRate(): string
    {
        // Placeholder - kelajakda error rate tracking qo'shiladi
        return '0.1%';
    }
}