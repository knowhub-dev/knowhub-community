<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Comment;
use App\Models\Post;
use App\Models\User;
use App\Models\WikiArticle;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminDashboardContractTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_includes_new_today_fields(): void
    {
        Cache::flush();

        $admin = User::factory()->create([
            'is_admin' => true,
            'level_id' => null,
        ]);

        Sanctum::actingAs($admin);

        $category = Category::create([
            'name' => 'General',
            'slug' => 'general',
        ]);

        $post = Post::factory()->create([
            'user_id' => $admin->id,
            'category_id' => $category->id,
            'created_at' => now(),
        ]);

        Comment::factory()->create([
            'user_id' => $admin->id,
            'post_id' => $post->id,
            'created_at' => now(),
        ]);

        WikiArticle::create([
            'title' => 'Testing Contract',
            'slug' => Str::slug('Testing Contract'),
            'content_markdown' => 'Content',
            'status' => 'published',
            'created_by' => $admin->id,
            'updated_by' => $admin->id,
            'created_at' => now(),
        ]);

        $response = $this->getJson('/api/v1/admin/dashboard');

        $response
            ->assertOk()
            ->assertJsonPath('users.new_today', 1)
            ->assertJsonPath('posts.new_today', 1)
            ->assertJsonPath('comments.new_today', 1)
            ->assertJsonPath('wiki.new_today', 1)
            ->assertJsonStructure([
                'users' => [
                    'total', 'new_today', 'active_today', 'new_this_week', 'new_this_month', 'banned', 'admins', 'online_now', 'verified', 'with_posts', 'top_contributors',
                ],
                'posts' => [
                    'total', 'published', 'draft', 'new_today', 'today', 'this_week', 'this_month', 'high_score', 'with_ai', 'trending', 'unanswered', 'avg_score', 'avg_comments',
                ],
                'comments' => [
                    'total', 'new_today', 'today', 'this_week', 'this_month', 'high_score', 'avg_score', 'top_commenters',
                ],
                'wiki' => [
                    'articles', 'new_today', 'published', 'draft', 'proposals', 'recent_edits', 'total_versions',
                ],
            ]);
    }
}
