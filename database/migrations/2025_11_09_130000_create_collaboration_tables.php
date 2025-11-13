<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('collaboration_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('post_id')->constrained()->cascadeOnDelete();
            $table->foreignId('owner_id')->constrained('users')->cascadeOnDelete();
            $table->string('status')->default('active');
            $table->text('content_snapshot')->nullable();
            $table->timestamp('ended_at')->nullable();
            $table->timestamps();

            $table->index(['post_id', 'status']);
        });

        Schema::create('collaboration_session_users', function (Blueprint $table) {
            $table->id();
            $table->foreignId('session_id')->constrained('collaboration_sessions')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('role')->default('editor');
            $table->timestamp('last_seen_at')->nullable();
            $table->timestamps();

            $table->unique(['session_id', 'user_id']);
        });

        Schema::create('collaboration_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('session_id')->constrained('collaboration_sessions')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('type');
            $table->json('payload');
            $table->timestamps();

            $table->index(['session_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('collaboration_events');
        Schema::dropIfExists('collaboration_session_users');
        Schema::dropIfExists('collaboration_sessions');
    }
};
