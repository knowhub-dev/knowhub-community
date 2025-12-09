<?php

// file: database/migrations/2025_08_27_000020_create_posts_and_links.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('posts', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->constrained()->cascadeOnDelete();
            $t->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $t->string('title');
            $t->string('slug')->unique();
            $t->text('content_markdown');
            $t->boolean('is_ai_suggested')->default(false);
            $t->jsonb('ai_suggestion')->nullable();
            $t->enum('status', ['draft', 'published'])->default('published');
            $t->integer('score')->default(0); // cached votes
            $t->integer('answers_count')->default(0);
            $t->timestamps();
            $t->index(['category_id', 'status']);
        });
        Schema::create('post_tag', function (Blueprint $t) {
            $t->foreignId('post_id')->constrained()->cascadeOnDelete();
            $t->foreignId('tag_id')->constrained()->cascadeOnDelete();
            $t->primary(['post_id', 'tag_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('post_tag');
        Schema::dropIfExists('posts');
    }
};
