<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;

class Authenticate extends Middleware
{
    protected function redirectTo($request)
    {
        // Agar API bo'lsa hech qayerga redirect qilmaymiz
        if ($request->expectsJson() || $request->is('api/*')) {
            return null; // return string emas!
        }

        // Faqat WEB uchun (agar kerak bo'lsa login page mavjud bo'lganda)
        return route('login', [], false);
    }
}
