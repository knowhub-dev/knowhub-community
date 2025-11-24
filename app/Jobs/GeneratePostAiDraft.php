<?php

// file: app/Jobs/GeneratePostAiDraft.php
namespace App\Jobs;

use App\Models\Post;
use App\Services\AI\AiAssistant;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class GeneratePostAiDraft implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $timeout = 120;

    /** @var array<int, int> */
    public array $backoff = [10, 30, 60];

    public function __construct(public int $postId) {}

    public function handle(AiAssistant $ai): void
    {
        $post = Post::find($this->postId);
        if (!$post) return;

        try {
            $suggestion = $ai->suggestAnswer($post->title, $post->content_markdown);
            $post->ai_suggestion = $suggestion;
            $post->is_ai_suggested = true;
            $post->save();
        } catch (\Exception $e) {
            \Log::error('AI suggestion failed for post ' . $this->postId . ': ' . $e->getMessage());
        }
    }
}