<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('is_verified')->default(false)->after('is_admin');
            $table->timestamp('verified_at')->nullable()->after('is_verified');
        });

        Schema::table('posts', function (Blueprint $table) {
            $table->integer('required_xp')->default(0)->after('status');
            $table->boolean('requires_verification')->default(false)->after('required_xp');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['is_verified', 'verified_at']);
        });

        Schema::table('posts', function (Blueprint $table) {
            $table->dropColumn(['required_xp', 'requires_verification']);
        });
    }
};
