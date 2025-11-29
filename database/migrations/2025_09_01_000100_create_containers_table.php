<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('containers', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('image');
            $table->enum('type', ['code_runner', 'dev_service', 'bot']);
            $table->enum('status', ['creating', 'running', 'stopped', 'error'])->default('creating');
            $table->integer('cpu_limit')->nullable();
            $table->integer('ram_limit_mb')->nullable();
            $table->enum('restart_policy', ['none', 'on-failure', 'always'])->default('none');
            $table->integer('internal_port');
            $table->integer('public_port')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('user_id');
            $table->index('status');
            $table->index('type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('containers');
    }
};
