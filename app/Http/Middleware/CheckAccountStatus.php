<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckAccountStatus
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $route = $request->route();
        
        // Only apply checking if the route uses the auth:api middleware
        if ($route && in_array('auth:api', $route->gatherMiddleware())) {
            if (auth('api')->check()) {
                $user = auth('api')->user();

                if ($user->status_akun === 'Diblokir') {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Akun Anda telah ditangguhkan. Silakan hubungi bantuan.'
                    ], 403);
                }

                if ($user->status_akun === 'Nonaktif') {
                    $isLogoutRoute = $request->is('*/logout');
                    if (!$request->isMethodSafe() && !$isLogoutRoute) {
                        return response()->json([
                            'status' => 'error',
                            'message' => 'Akun Anda dinonaktifkan. Anda hanya dapat melihat data (read-only).'
                        ], 403);
                    }
                }
            }
        }

        return $next($request);
    }
}
