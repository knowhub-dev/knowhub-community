<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPlanLimits
{
    public function handle(Request $request, Closure $next, string $action = ''): Response
    {
        $user = $request->user();

        if ($action === 'create-container' && $user && !$user->canCreateContainer()) {
            return response()->json(['message' => 'Pro versiyaga o‘ting!'], Response::HTTP_FORBIDDEN);
        }

        if ($action === 'upload-file' && $user) {
            $file = $request->file('file');
            $maxSizeKb = $user->getMaxUploadSize();

            if ($file && $file->getSize() > ($maxSizeKb * 1024)) {
                return response()->json(['message' => 'Pro versiyaga o‘ting!'], Response::HTTP_FORBIDDEN);
            }
        }

        return $next($request);
    }
}
