<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return [
        'app' => 'KnowHub Community API',
        'version' => app()->version(),
        'status' => 'ok'
    ];
});
