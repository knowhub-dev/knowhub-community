<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('type'); // comment, vote, follow, badge, etc.
            $table->string('title');
            $table->text('message');
            $table->json('data')->nullable();
            $table->nullableMorphs('notifiable'); // related object
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
            
            $table->index(['user_id', 'read_at']);
        });
    }

    public function down(): void {
        Schema::dropIfExists('notifications');
    }
};