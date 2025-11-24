<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('containers', function (Blueprint $table) {
            $table->boolean('is_featured')->default(false)->after('env_vars');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->jsonb('resume_data')->nullable()->after('resume');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('containers', function (Blueprint $table) {
            $table->dropColumn('is_featured');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('resume_data');
        });
    }
};
