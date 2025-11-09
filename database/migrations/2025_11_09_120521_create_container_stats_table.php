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
        Schema::create('container_stats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('container_id')->constrained()->onDelete('cascade');
            $table->float('cpu_usage')->default(0); // CPU usage percentage
            $table->float('memory_usage')->default(0); // Memory usage in MB
            $table->float('disk_usage')->default(0); // Disk usage in MB
            $table->integer('network_rx')->default(0); // Network received bytes
            $table->integer('network_tx')->default(0); // Network transmitted bytes
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('container_stats');
    }
};
