<?php

// file: database/migrations/2025_08_27_000030_create_comments_and_votes.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('comments', function (Blueprint $t) {
            $t->id();
            $t->foreignId('post_id')->constrained()->cascadeOnDelete();
            $t->foreignId('user_id')->constrained()->cascadeOnDelete();
            $t->foreignId('parent_id')->nullable()->constrained('comments')->cascadeOnDelete();
            $t->text('content_markdown');
            $t->integer('depth')->default(0);
            $t->integer('score')->default(0);
            $t->timestamps();
            $t->index(['post_id', 'parent_id']);
        });

        Schema::create('votes', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->constrained()->cascadeOnDelete();
            $t->morphs('votable'); // votable_id, votable_type
            $t->smallInteger('value'); // -1 or 1
            $t->timestamps();
            $t->unique(['user_id', 'votable_id', 'votable_type']);
            // $t->index(['votable_type','votable_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('votes');
        Schema::dropIfExists('comments');
    }
};
