<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Support\Settings;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class BrandingController extends Controller
{
    private const LIGHT_KEY = 'branding.logo.light';
    private const DARK_KEY = 'branding.logo.dark';

    public function show()
    {
        return response()->json([
            'light' => $this->formatLogoResponse(Settings::get(self::LIGHT_KEY)),
            'dark' => $this->formatLogoResponse(Settings::get(self::DARK_KEY)),
        ]);
    }

    public function store(Request $request)
    {
        if (!$request->user() || !$request->user()->is_admin) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'type' => ['required', 'in:light,dark'],
            'file' => ['required', 'file', 'mimes:png,svg,webp', 'max:2048'],
        ]);

        $type = $validated['type'];
        $file = $validated['file'];
        $path = $file->storeAs(
            'branding',
            Str::uuid() . '.' . $file->getClientOriginalExtension(),
            'public'
        );

        $key = $type === 'dark' ? self::DARK_KEY : self::LIGHT_KEY;
        $previous = Settings::get($key);

        Settings::set($key, $path);

        if ($previous && Storage::disk('public')->exists($previous)) {
            Storage::disk('public')->delete($previous);
        }

        return response()->json([
            'message' => 'Logo updated',
            'logo' => $this->formatLogoResponse($path),
        ]);
    }

    public function destroy(Request $request)
    {
        if (!$request->user() || !$request->user()->is_admin) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'type' => ['required', 'in:light,dark'],
        ]);

        $key = $validated['type'] === 'dark' ? self::DARK_KEY : self::LIGHT_KEY;
        $current = Settings::get($key);

        if ($current && Storage::disk('public')->exists($current)) {
            Storage::disk('public')->delete($current);
        }

        Settings::forget($key);

        return response()->json(['message' => 'Logo removed']);
    }

    private function formatLogoResponse($path): ?array
    {
        if (!$path) {
            return null;
        }

        return [
            'path' => $path,
            'url' => Storage::disk('public')->url($path),
        ];
    }
}
