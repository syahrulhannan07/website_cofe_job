<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     * @param  string  $role
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        if (auth('api')->check() && auth('api')->user()->peran === $role) {
            return $next($request);
        }

        return response()->json([
            'status' => 'error',
            'message' => "Akses ditolak. Hanya untuk {$role}."
        ], 403);
    }
}
