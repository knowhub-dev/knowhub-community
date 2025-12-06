<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_and_receive_token(): void
    {
        $payload = [
            'name' => 'Test User',
            'username' => 'testuser',
            'email' => 'test@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ];

        $response = $this->postJson('/api/v1/auth/register', $payload)
            ->assertCreated()
            ->assertJsonStructure([
                'token',
                'user' => ['id', 'username', 'avatar_url', 'xp', 'level', 'badges'],
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'test@example.com',
            'username' => 'testuser',
        ]);

        $user = User::where('email', 'test@example.com')->first();
        $this->assertTrue(Hash::check('Password123!', $user->password));
        $this->assertNotEmpty($response->json('token'));
    }

    public function test_register_validation_errors(): void
    {
        $this->postJson('/api/v1/auth/register', [])->assertStatus(422);
    }

    public function test_user_can_login_with_valid_credentials(): void
    {
        $user = User::factory()->create([
            'email' => 'login@example.com',
            'password' => Hash::make('Password123!'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'login@example.com',
            'password' => 'Password123!',
        ])->assertOk();

        $this->assertNotEmpty($response->json('token'));
    }

    public function test_login_fails_with_invalid_credentials(): void
    {
        User::factory()->create([
            'email' => 'login@example.com',
            'password' => Hash::make('Password123!'),
        ]);

        $this->postJson('/api/v1/auth/login', [
            'email' => 'login@example.com',
            'password' => 'wrong-password',
        ])->assertStatus(422);
    }

    public function test_logout_revokes_token_and_session(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('api')->plainTextToken;
        [$tokenId] = explode('|', $token);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/v1/auth/logout')
            ->assertOk();

        $this->assertDatabaseMissing('personal_access_tokens', [
            'id' => $tokenId,
        ]);
    }

    public function test_refresh_token_rotates_current_token(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('api')->plainTextToken;
        [$tokenId] = explode('|', $token);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/v1/auth/refresh')
            ->assertOk();

        $this->assertNotEmpty($response->json('token'));
        $this->assertDatabaseMissing('personal_access_tokens', [
            'id' => $tokenId,
        ]);
    }

    public function test_authenticated_routes_require_authentication(): void
    {
        $this->postJson('/api/v1/auth/logout')->assertStatus(401);
        $this->postJson('/api/v1/auth/refresh')->assertStatus(401);
    }
}
