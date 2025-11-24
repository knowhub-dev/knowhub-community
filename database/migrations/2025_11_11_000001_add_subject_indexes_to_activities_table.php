<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('activities')) {
            return;
        }

        Schema::table('activities', function (Blueprint $table) {
            if (Schema::hasColumn('activities', 'subject_type')) {
                $table->index('subject_type');
            }

            if (Schema::hasColumn('activities', 'subject_id')) {
                $table->index('subject_id');
            }
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('activities')) {
            return;
        }

        Schema::table('activities', function (Blueprint $table) {
            if (Schema::hasColumn('activities', 'subject_type')) {
                $table->dropIndex(['subject_type']);
            }

            if (Schema::hasColumn('activities', 'subject_id')) {
                $table->dropIndex(['subject_id']);
            }
        });
    }
};
