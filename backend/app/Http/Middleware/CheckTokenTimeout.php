<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Carbon\Carbon;

class CheckTokenTimeout
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $request->user()->currentAccessToken()) {

            if (
                isset($user->level->level_user) &&
                $user->level->level_user === 'SUPER ADMIN'
            ) {
                return $next($request);
            }

            $token = $request->user()->currentAccessToken();

            $lastActivity = $token->last_activity;

            if ($lastActivity) {

                $inactiveMinutes = Carbon::parse($lastActivity)
                    ->diffInMinutes(now());

                if ($inactiveMinutes >= 30) {

                    // HAPUS SEMUA TOKEN USER
                    $user->tokens()->delete();

                    return response()->json([
                        'status' => 'unauthenticated',
                        'message' => 'Session expired'
                    ], 401);
                }
            }

            // UPDATE LAST ACTIVITY
            $token->forceFill([
                'last_activity' => now()
            ])->save();
        }

        return $next($request);
    }
}
