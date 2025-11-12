<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
| Laravel endi faqat API qatlam sifatida ishlaydi. Web marshrutlar Next.js
| frontendiga yuklangan. Bu yerda faqat sog'liqni tekshiruvchi minimal javob
| qoldirilgan.
*/

Route::get('/', fn () => response()->json([
    'application' => 'KnowHub API',
    'version' => config('app.version') ?? config('app.name'),
    'docs' => url('/api/v1'),
]));
