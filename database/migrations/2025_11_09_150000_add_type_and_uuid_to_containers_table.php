<?php

use App\Models\Container;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('containers', function (Blueprint $table) {
            $table->uuid('uuid')->after('id')->nullable();
            $table->string('type')->default('node')->after('image');
        });

        // Backfill UUIDs for existing rows
        Container::query()->whereNull('uuid')->chunkById(100, function ($containers) {
            foreach ($containers as $container) {
                $container->uuid = (string) Str::uuid();
                $container->save();
            }
        });

        Schema::table('containers', function (Blueprint $table) {
            $table->uuid('uuid')->nullable(false)->change();
        });
    }

    public function down(): void
    {
        Schema::table('containers', function (Blueprint $table) {
            $table->dropColumn(['uuid', 'type']);
        });
    }
};
