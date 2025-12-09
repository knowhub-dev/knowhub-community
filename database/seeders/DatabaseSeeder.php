<?php

// file: database/seeders/DatabaseSeeder.php

namespace Database\Seeders;

use App\Models\Badge;
use App\Models\Category; // <-- Muhim!
use App\Models\Comment;
use App\Models\Level;
use App\Models\Post;
use App\Models\Tag;
use App\Models\User;     // <-- Yangi
use Illuminate\Database\Seeder;     // <-- Yangi
use Illuminate\Support\Facades\DB;  // <-- Yangi
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Toza boshlash uchun jadvallarni tozalaymiz
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        User::truncate();
        Post::truncate();
        Comment::truncate();
        Category::truncate();
        Tag::truncate();
        Level::truncate();
        Badge::truncate();
        DB::table('post_tag')->truncate(); // oraliq jadval
        DB::table('user_badges')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1');

        // 1. Kategoriyalar (sizning kodingiz)
        foreach (['Dasturlash', 'AI', 'Cybersecurity', 'Open Source', 'DevOps'] as $name) {
            Category::firstOrCreate(['name' => $name], ['slug' => \Str::slug($name)]);
        }

        // 2. Teglar (sizning kodingiz)
        $tags = collect();
        foreach (['Laravel', 'Livewire', 'MySQL', 'PostgreSQL', 'Redis', 'Next.js', 'Tailwind', 'Python', 'PHP', 'JavaScript'] as $t) {
            $tags->push(Tag::firstOrCreate(['name' => $t], ['slug' => \Str::slug($t)]));
        }

        // 3. Levellar (sizning kodingiz)
        $levels = [
            ['name' => 'Novice', 'min_xp' => 0, 'icon' => 'spark'],
            ['name' => 'Apprentice', 'min_xp' => 200, 'icon' => 'feather'],
            ['name' => 'Wizard', 'min_xp' => 1000, 'icon' => 'wand'],
            ['name' => 'Mentor', 'min_xp' => 2500, 'icon' => 'shield'],
        ];
        foreach ($levels as $lv) {
            Level::firstOrCreate(['name' => $lv['name']], $lv);
        }

        // 3.1. Badge'larni seeding qilamiz
        $this->call(BadgeSeeder::class);

        // 4. ADMINNI YARATAMIZ
        // Default credentialar: admin@knowhub.uz / admin123
        $adminLevelId = Level::orderByDesc('min_xp')->first()?->id ?? 1;

        User::updateOrCreate(
            ['email' => 'admin@knowhub.uz'],
            [
                'name' => 'KnowHub Admin',
                'username' => 'admin',
                'password' => Hash::make('admin123'),
                'xp' => 5000,
                'level_id' => $adminLevelId,
                'is_admin' => 1,
                'is_banned' => 0,
            ]
        );

        // 5. Oddiy Foydalanuvchilarni Yaratamiz
        // 20 ta oddiy foydalanuvchi yaratamiz
        $users = User::factory(20)->create();

        // 6. Postlarni Yaratamiz
        // 50 ta post yaratamiz va ularni $users'ga tasodifiy bog'laymiz
        $posts = Post::factory(50)->recycle($users)->create();

        // 7. Kommentlarni Yaratamiz
        // 200 ta komment yaratamiz, ularni $users va $posts'ga tasodifiy bog'laymiz
        $comments = Comment::factory(200)
            ->recycle($users) // $users'dan tasodifiy user_id oladi
            ->recycle($posts) // $posts'dan tasodifiy post_id oladi
            ->create();

        // 8. (Bonus) Postlarga Teglarni Bog'laymiz
        $posts->each(function ($post) use ($tags) {
            $post->tags()->attach(
                $tags->random(rand(1, 3))->pluck('id')->toArray()
            );
        });

        // 9. (Bonus) Postlardagi kommentlar sonini yangilaymiz
        foreach ($posts as $post) {
            $post->update(['answers_count' => $post->comments()->count()]);
        }
    }
}
