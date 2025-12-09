<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('plan_type', ['free', 'pro', 'legend'])
                ->default('free')
                ->after('is_verified');
            $table->timestamp('plan_expires_at')->nullable()->after('plan_type');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['plan_type', 'plan_expires_at']);
        });
    }
};
