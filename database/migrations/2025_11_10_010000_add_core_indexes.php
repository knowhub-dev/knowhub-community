<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            if (!Schema::hasColumn('posts', 'slug')) {
                return;
            }
            $table->index('slug');
        });

        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'username')) {
                return;
            }
            $table->index('username');
        });

        Schema::table('tags', function (Blueprint $table) {
            if (!Schema::hasColumn('tags', 'name')) {
                return;
            }
            $table->index('name');
        });

        if (Schema::hasTable('activities')) {
            Schema::table('activities', function (Blueprint $table) {
                if (Schema::hasColumn('activities', 'user_id')) {
                    $table->index('user_id');
                }
                if (Schema::hasColumn('activities', 'type')) {
                    $table->index('type');
                }
                if (Schema::hasColumn('activities', 'created_at')) {
                    $table->index('created_at');
                }
            });
        }
    }

    public function down(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->dropIndex('posts_slug_index');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('users_username_index');
        });

        Schema::table('tags', function (Blueprint $table) {
            $table->dropIndex('tags_name_index');
        });

        if (Schema::hasTable('activities')) {
            Schema::table('activities', function (Blueprint $table) {
                $table->dropIndex('activities_user_id_index');
                $table->dropIndex('activities_type_index');
                $table->dropIndex('activities_created_at_index');
            });
        }
    }
};
