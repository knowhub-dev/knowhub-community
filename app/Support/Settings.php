<?php

namespace App\Support;

use App\Models\Setting;
use Illuminate\Support\Facades\Cache;

class Settings
{
    public static function get(string $key, $default = null)
    {
        $cacheKey = self::cacheKey($key);

        return Cache::rememberForever($cacheKey, function () use ($key, $default) {
            $setting = Setting::query()->where('key', $key)->first();

            return $setting?->value ?? $default;
        });
    }

    public static function set(string $key, $value, string $type = 'string'): void
    {
        $setting = Setting::query()->updateOrCreate(
            ['key' => $key],
            ['value' => $value, 'type' => $type]
        );

        Cache::forever(self::cacheKey($key), $setting->value);
    }

    public static function forget(string $key): void
    {
        Cache::forget(self::cacheKey($key));
        Setting::query()->where('key', $key)->delete();
    }

    private static function cacheKey(string $key): string
    {
        return 'settings:'.$key;
    }
}
