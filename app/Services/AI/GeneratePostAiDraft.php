<?php

// file: app/Jobs/GeneratePostAiDraft.php

namespace App\Jobs;

use App\Models\Post;
use App\Services\AI\AiAssistant;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;

class GeneratePostAiDraft implements ShouldQueue
{
    use Dispatchable, Queueable;

    public function __construct(public int $postId) {}

    public function handle(AiAssistant $ai): void
    {
        $post = Post::find($this->postId);
        if (! $post) {
            return;
        }

        $suggestion = $ai->suggestAnswer($post->title, $post->content_markdown);
        $post->ai_suggestion = $suggestion;
        $post->is_ai_suggested = true;
        $post->save();
    }
}
