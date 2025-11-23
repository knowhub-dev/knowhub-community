<?php

namespace Database\Seeders;

use App\Models\Badge;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class BadgeSeeder extends Seeder
{
    public function run(): void
    {
        $badges = [
            ['name' => 'Hello World', 'description' => 'Joined the community', 'icon_key' => 'hand', 'level' => 'bronze'],
            ['name' => 'Code Ninja', 'description' => 'Ran code 50 times', 'icon_key' => 'terminal', 'level' => 'silver'],
            ['name' => 'Bug Hunter', 'description' => 'Reported a critical bug', 'icon_key' => 'bug', 'level' => 'gold'],
            ['name' => 'Wordsmith', 'description' => 'Wrote 10 Wiki articles', 'icon_key' => 'feather', 'level' => 'gold'],
            ['name' => 'Community Pillar', 'description' => 'Received 100 Upvotes', 'icon_key' => 'heart', 'level' => 'platinum'],
            ['name' => 'Author', 'description' => 'Published 10 posts', 'icon_key' => 'pen', 'level' => 'silver'],
        ];

        foreach ($badges as $badge) {
            Badge::updateOrCreate(
                ['slug' => Str::slug($badge['name'])],
                [
                    'name' => $badge['name'],
                    'description' => $badge['description'],
                    'icon_key' => $badge['icon_key'],
                    'level' => $badge['level'],
                ]
            );
        }
    }
}
