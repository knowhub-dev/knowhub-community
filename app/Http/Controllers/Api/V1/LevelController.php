<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Level;
use Illuminate\Support\Str;

class LevelController extends Controller
{
    public function index()
    {
        $levels = Level::orderBy('min_xp')
            ->get()
            ->map(function ($level) {
                return [
                    'id' => $level->id,
                    'name' => $level->name,
                    'slug' => Str::slug($level->name),
                    'min_xp' => $level->min_xp,
                    'icon' => $level->icon,
                ];
            });

        return response()->json(['data' => $levels]);
    }
}
