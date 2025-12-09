<?php

// file: database/migrations/2025_08_27_000050_create_wiki_and_code_runs.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wiki_articles', function (Blueprint $t) {
            $t->id();
            $t->string('title');
            $t->string('slug')->unique();
            $t->longText('content_markdown');
            $t->enum('status', ['draft', 'published'])->default('published');
            $t->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $t->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $t->integer('version')->default(1);
            $t->timestamps();
        });

        Schema::create('wiki_proposals', function (Blueprint $t) {
            $t->id();
            $t->foreignId('article_id')->constrained('wiki_articles')->cascadeOnDelete();
            $t->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $t->longText('content_markdown'); // taklif etilgan kontent
            $t->text('comment')->nullable();
            $t->enum('status', ['pending', 'merged', 'rejected'])->default('pending');
            $t->timestamps();
        });

        Schema::create('code_runs', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->constrained()->cascadeOnDelete();
            $t->foreignId('post_id')->nullable()->constrained('posts')->nullOnDelete();
            $t->foreignId('comment_id')->nullable()->constrained('comments')->nullOnDelete();
            $t->string('language'); // js, python, php
            $t->longText('source');
            $t->longText('stdout')->nullable();
            $t->longText('stderr')->nullable();
            $t->integer('exit_code')->nullable();
            $t->integer('runtime_ms')->nullable();
            $t->enum('status', ['queued', 'running', 'success', 'failed'])->default('queued');
            $t->timestamps();
            $t->index(['post_id', 'comment_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('code_runs');
        Schema::dropIfExists('wiki_proposals');
        Schema::dropIfExists('wiki_articles');
    }
};
