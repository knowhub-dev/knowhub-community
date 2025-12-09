<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ForceJsonResponse
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Brauzer nima so'rashidan qat'iy nazar, biz JSON so'ralayapti deb belgilaymiz
        $request->headers->set('Accept', 'application/json');

        return $next($request);
    }
}
