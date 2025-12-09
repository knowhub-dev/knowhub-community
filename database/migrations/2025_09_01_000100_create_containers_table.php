<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('containers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            // identifiers
            $table->string('slug')->unique()->nullable();      // old file
            $table->string('container_id')->nullable();        // new file

            // base info
            $table->string('name');
            $table->string('image');

            // combined status system
            // agar enumni afzal ko'rsang pastdagini uncomment qilasan
            $table->enum('status', ['creating', 'running', 'stopped', 'error', 'created'])
                ->default('creating');

            // resource limits (merge)
            $table->integer('cpu_limit')->default(1);          // new file default
            $table->integer('memory_limit')->default(512);     // new default
            $table->integer('disk_limit')->default(1024);      // new file only

            // ports
            $table->integer('internal_port')->nullable();      // first file
            $table->integer('public_port')->nullable();        // first file
            $table->integer('port')->nullable();               // new file (optional duplicate)

            // env config
            $table->json('env_vars')->nullable();

            // restart policy if needed
            $table->enum('restart_policy', ['none', 'on-failure', 'always'])
                ->default('none');

            $table->timestamps();
            $table->softDeletes();

            // indexes
            $table->index('user_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('containers');
    }
};
