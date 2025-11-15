<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('containers', function (Blueprint $table) {
            $table->string('subdomain')->nullable()->unique()->after('name');
        });
    }

    public function down(): void
    {
        Schema::table('containers', function (Blueprint $table) {
            if (Schema::hasColumn('containers', 'subdomain')) {
                $table->dropUnique('containers_subdomain_unique');
                $table->dropColumn('subdomain');
            }
        });
    }
};
