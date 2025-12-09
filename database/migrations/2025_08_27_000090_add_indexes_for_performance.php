<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Posts table indexes
        Schema::table('posts', function (Blueprint $table) {
            $table->index(['status', 'created_at']);
            $table->index(['status', 'score']);
            $table->index('user_id');
            $table->fullText(['title', 'content_markdown']);
        });

        // Comments table indexes
        Schema::table('comments', function (Blueprint $table) {
            $table->index('user_id');
            $table->index(['post_id', 'created_at']);
        });

        // Users table indexes
        Schema::table('users', function (Blueprint $table) {
            $table->index('xp');
            $table->index('level_id');
            $table->fullText(['name', 'username']);
        });

        // Wiki articles indexes
        Schema::table('wiki_articles', function (Blueprint $table) {
            $table->index(['status', 'created_at']);
            $table->fullText(['title', 'content_markdown']);
        });

        // Votes table indexes
        Schema::table('votes', function (Blueprint $table) {
            $table->index(['votable_type', 'votable_id', 'value']);
        });
    }

    public function down(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->dropIndex(['status', 'created_at']);
            $table->dropIndex(['status', 'score']);
            $table->dropIndex(['user_id']);
            $table->dropFullText(['title', 'content_markdown']);
        });

        Schema::table('comments', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
            $table->dropIndex(['post_id', 'created_at']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['xp']);
            $table->dropIndex(['level_id']);
            $table->dropFullText(['name', 'username']);
        });

        Schema::table('wiki_articles', function (Blueprint $table) {
            $table->dropIndex(['status', 'created_at']);
            $table->dropFullText(['title', 'content_markdown']);
        });

        Schema::table('votes', function (Blueprint $table) {
            $table->dropIndex(['votable_type', 'votable_id', 'value']);
        });
    }
};
