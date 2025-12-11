<?php

namespace App\Jobs;

use App\Models\Notification;
use App\Models\Post;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class NotifyFollowers implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(public readonly Post $post)
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $followers = $this->post->user->followers()->get();

        foreach ($followers as $follower) {
            Notification::create([
                'user_id' => $follower->id,
                'type' => 'new_post',
                'title' => 'Yangi post',
                'message' => "{$this->post->user->name} yangi post yaratdi: {$this->post->title}",
                'data' => [
                    'post_id' => $this->post->id,
                    'post_slug' => $this->post->slug,
                    'author_name' => $this->post->user->name,
                ],
                'notifiable_id' => $this->post->id,
                'notifiable_type' => Post::class,
            ]);
        }
    }
}
