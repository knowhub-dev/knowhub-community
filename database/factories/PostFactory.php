<?php

// file: database/factories/PostFactory.php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class PostFactory extends Factory
{
    protected $model = Post::class;

    public function definition(): array
    {
        $title = $this->faker->sentence(rand(5, 10));
        $content = $this->faker->paragraphs(rand(3, 10), true);

        return [
            // User va Category'ni seeder'da belgilaymiz,
            // lekin standart holat uchun ham qo'yamiz
            'user_id' => User::inRandomOrder()->first()?->id ?? 1,
            'category_id' => Category::inRandomOrder()->first()?->id ?? 1,
            'title' => $title,
            'slug' => Str::slug($title).'-'.uniqid(),
            'content_markdown' => $content,
            // 'content_html' => Str::markdown($content), // Avtomatik HTML'ga o'giramiz
            'status' => 'published', // Darhol nashr qilamiz
            'score' => rand(-5, 50),
            // 'views' => rand(100, 5000),
            'answers_count' => 0, // Kommentlarni keyin qo'shamiz
            'created_at' => $this->faker->dateTimeBetween('-1 year', 'now'), // 1 yil ichida
        ];
    }
}
