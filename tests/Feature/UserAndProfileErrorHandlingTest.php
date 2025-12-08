<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class UserAndProfileErrorHandlingTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_list_returns_structured_error_on_database_failure(): void
    {
        Schema::dropIfExists('levels');

        $response = $this->getJson('/api/v1/users?search=test');

        $response->assertStatus(503)
            ->assertJsonStructure(['message', 'trace_id']);
    }

    public function test_profile_me_returns_structured_error_on_missing_relation(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        Schema::dropIfExists('levels');

        $response = $this->getJson('/api/v1/profile/me');

        $response->assertStatus(503)
            ->assertJsonStructure(['message', 'trace_id']);
    }
}
