<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('container_env_vars', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('container_id')->constrained('containers')->cascadeOnDelete();
            $table->string('key');
            $table->text('value')->nullable();
            $table->timestamps();

            $table->index(['container_id', 'key']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('container_env_vars');
    }
};
