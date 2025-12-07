<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;

class Authenticate extends Middleware
{
protected function redirectTo($request)
{
    // API request bo'lsa redirect emas → JSON qaytaramiz
    if ($request->expectsJson()) {
        return null;
    }

    return route('login'); // agar web bo'lsa ishlaydi
}