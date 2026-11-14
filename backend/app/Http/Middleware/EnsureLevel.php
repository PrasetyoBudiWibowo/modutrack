<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureLevel
{
    public function handle(Request $request, Closure $next, string ...$levels)
    {
        $user = $request->user();

        if (!$user || !in_array((string) $user->level_user_id, $levels, true)) {
            return response()->json([
                'status'  => false,
                'message' => 'Anda tidak memiliki hak akses',
            ], 403);
        }

        return $next($request);
    }
}
