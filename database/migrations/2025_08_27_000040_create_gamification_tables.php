<?php

// file: database/migrations/2025_08_27_000040_create_gamification_tables.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('levels', function (Blueprint $t) {
            $t->id();
            $t->string('name');
            $t->integer('min_xp')->default(0);
            $t->string('icon')->nullable();
            $t->timestamps();
        });

        Schema::create('badges', function (Blueprint $t) {
            $t->id();
            $t->string('name')->unique();
            $t->string('slug')->unique();
            $t->string('icon')->nullable();
            $t->text('description')->nullable();
            $t->integer('xp_reward')->default(0);
            $t->timestamps();
        });

        Schema::create('user_badges', function (Blueprint $t) {
            $t->foreignId('user_id')->constrained()->cascadeOnDelete();
            $t->foreignId('badge_id')->constrained()->cascadeOnDelete();
            $t->timestamp('awarded_at')->useCurrent();
            $t->primary(['user_id', 'badge_id']);
        });

        Schema::create('xp_transactions', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->constrained()->cascadeOnDelete();
            $t->integer('amount');
            $t->string('reason');
            $t->nullableMorphs('subject');
            $t->timestamps();
            $t->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('xp_transactions');
        Schema::dropIfExists('user_badges');
        Schema::dropIfExists('badges');
        Schema::dropIfExists('levels');
    }
};
