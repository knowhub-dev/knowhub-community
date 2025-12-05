<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json(["status"=>"OK", "app"=>"KnowHub API running"]);
});

