<?php

// file: database/factories/CommentFactory.php

namespace Database\Factories;

use App\Models\Comment;
use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CommentFactory extends Factory
{
    protected $model = Comment::class;

    public function definition(): array
    {
        $content = $this->faker->paragraphs(rand(1, 3), true);

        return [
            'user_id' => User::inRandomOrder()->first()?->id ?? 1,
            'post_id' => Post::inRandomOrder()->first()?->id ?? 1,
            'content_markdown' => $content,
            // 'content_html' => \Str::markdown($content),'score' => rand(-2, 20),
            'created_at' => $this->faker->dateTimeBetween('-1 year', 'now'),
        ];
    }

}
