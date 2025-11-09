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
        Schema::create('containers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('container_id')->nullable(); // Docker container ID
            $table->string('name');
            $table->string('image');
            $table->string('status')->default('created'); // created, running, stopped, failed
            $table->integer('cpu_limit')->default(1); // Number of CPU cores
            $table->integer('memory_limit')->default(512); // RAM limit in MB
            $table->integer('disk_limit')->default(1024); // Disk limit in MB
            $table->integer('port')->nullable();
            $table->json('env_vars')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('containers');
    }
};
