<?php

// file: tests/Feature/PostFlowTest.php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PostFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_create_post_and_list(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $res = $this->postJson('/api/v1/posts', [
            'title' => 'Laravel Auth muammo',
            'content_markdown' => '**Savol**: Laravelda auth...',
            'tags' => ['Laravel', 'Auth'],
        ])->assertOk();

        $this->getJson('/api/v1/posts')->assertOk()->assertJsonStructure(['data']);
        $slug = $res->json('data.slug');
        $this->getJson("/api/v1/posts/{$slug}")->assertOk();
    }
}
