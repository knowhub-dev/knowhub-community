<?php
// file: database/factories/UserFactory.php
namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use App\Models\User;
use App\Models\Level; // <-- Buni qo'shdik

class UserFactory extends Factory
{
    protected $model = User::class;
    
    public function definition(): array
    {
        $name = $this->faker->name();
        return [
            'name' => $name,
            'username' => Str::slug($name.'-'.$this->faker->unique()->randomNumber(3)),
            'email' => $this->faker->unique()->safeEmail(),
            'password' => bcrypt('password'), // test uchun 'password'
            'xp' => $this->faker->numberBetween(100, 5000),
            'level_id' => Level::inRandomOrder()->first()?->id ?? 1, // Tasodifiy level
            'is_admin' => 0, // Standart foydalanuvchi ADMIN EMAS
            'is_banned' => 0,
            //'email_verified_at' => now(), // Test uchun emailni tasdiqlaymiz
        ];
    }

    /**
     * Maxsus ADMIN holati (state)
     */
    public function admin(): Factory
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Admin User',
            'username' => 'admin',
            'email' => 'admin@knowhub.uz',
            'is_admin' => 1, // Bu ADMIN
            'level_id' => Level::max('id'), // Eng yuqori level
        ]);
    }
}