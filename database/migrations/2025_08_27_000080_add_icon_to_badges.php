<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('badges', function (Blueprint $table) {
            if (!Schema::hasColumn('badges', 'icon_key')) {
                $table->string('icon_key')->nullable()->after('icon');
            }

            if (!Schema::hasColumn('badges', 'level')) {
                $table->string('level')->default('bronze')->after('icon_key');
            }
        });
    }

    public function down(): void
    {
        Schema::table('badges', function (Blueprint $table) {
            if (Schema::hasColumn('badges', 'level')) {
                $table->dropColumn('level');
            }

            if (Schema::hasColumn('badges', 'icon_key')) {
                $table->dropColumn('icon_key');
            }
        });
    }
};
