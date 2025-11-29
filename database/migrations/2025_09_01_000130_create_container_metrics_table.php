<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('container_metrics', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('container_id')->constrained('containers')->cascadeOnDelete();
            $table->decimal('cpu_percent', 5, 2);
            $table->integer('ram_mb');
            $table->integer('disk_mb')->nullable();
            $table->timestamp('recorded_at');

            $table->index(['container_id', 'recorded_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('container_metrics');
    }
};
