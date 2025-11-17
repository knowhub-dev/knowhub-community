<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Cache;

class ContentController extends Controller
{
    public function about()
    {
        $cacheKey = 'content:about';

        $content = Cache::remember($cacheKey, 1800, function () {
            return [
                'hero' => [
                    'title' => "Biz Haqimizda",
                    'subtitle' => "KnowHub Community - O'zbekiston va dunyo bo'ylab dasturchilarni birlashtiruvchi ochiq platforma.",
                ],
                'mission' => [
                    'title' => 'Bizning Maqsadimiz',
                    'description' => "O'zbekiston dasturchilar hamjamiyatini rivojlantirish, bilim almashish uchun qulay muhit yaratish va har bir dasturchining professional o'sishiga yordam berish.",
                ],
                'values' => [
                    'title' => 'Bizning Qadriyatlarimiz',
                    'description' => "Ochiqlik, hamkorlik, o'zaro yordam va doimiy o'rganish. Biz har bir hamjamiyat a'zosining fikri va hissasini qadrlaymiz.",
                ],
                'features' => [
                    [
                        'title' => 'Kod Ishga Tushirish',
                        'description' => "JavaScript, Python, PHP kodlarini to'g'ridan-to'g'ri brauzerda ishga tushiring va natijani real vaqtda ko'ring.",
                        'icon' => 'code',
                    ],
                    [
                        'title' => 'Hamjamiyat',
                        'description' => "Minglab dasturchilar bilan bog'laning, tajriba almashing va professional tarmoqingizni kengaytiring.",
                        'icon' => 'users',
                    ],
                    [
                        'title' => 'Gamifikatsiya',
                        'description' => "XP to'plang, darajangizni oshiring, badglar qo'lga kiriting va reyting jadvalida yuqoriga chiqing.",
                        'icon' => 'award',
                    ],
                ],
                'team' => [
                    [
                        'title' => 'Asos Soluvchi',
                        'role' => 'CEO & Founder',
                        'description' => '10+ yillik tajribaga ega senior dasturchi va texnologiya sohasidagi yetakchi.',
                        'avatar_url' => 'https://ui-avatars.com/api/?name=Founder&background=6366f1&color=fff&size=128',
                    ],
                    [
                        'title' => 'Texnik Rahbar',
                        'role' => 'CTO & Tech Lead',
                        'description' => 'Full-stack dasturchi va arxitektor, platformaning texnik tomonini boshqaradi.',
                        'avatar_url' => 'https://ui-avatars.com/api/?name=Tech+Lead&background=10b981&color=fff&size=128',
                    ],
                    [
                        'title' => 'Hamjamiyat Menejeri',
                        'role' => 'Community Manager',
                        'description' => "Hamjamiyat bilan ishlash va foydalanuvchilar tajribasini yaxshilash bo'yicha mutaxassis.",
                        'avatar_url' => 'https://ui-avatars.com/api/?name=Community&background=f59e0b&color=fff&size=128',
                    ],
                ],
                'cta' => [
                    'title' => "Bizga Qo'shiling!",
                    'description' => "O'zbekiston dasturchilar hamjamiyatining bir qismi bo'ling va karyerangizni rivojlantiring.",
                    'primary_label' => "Ro'yxatdan O'tish",
                    'secondary_label' => "Biz Bilan Bog'laning",
                ],
            ];
        });

        return response()->json($content);
    }
}
