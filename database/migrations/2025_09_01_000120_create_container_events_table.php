<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('container_events', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('container_id')->constrained('containers')->cascadeOnDelete();
            $table->string('type');
            $table->text('message');
            $table->json('meta')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('container_events');
    }
};
