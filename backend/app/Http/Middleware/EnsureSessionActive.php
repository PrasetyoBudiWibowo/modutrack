<?php

namespace App\Http\Middleware;

use Carbon\Carbon;
use Closure;
use Illuminate\Http\Request;

class EnsureSessionActive
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        if ($user->status_user !== 'ACTIVE' || $user->blokir === 'YA') {
            $user->tokens()->delete();

            return response()->json([
                'status'  => false,
                'message' => 'Akun Anda dinonaktifkan atau diblokir',
            ], 401);
        }

        if (!$user) {
            return response()->json(['status' => false, 'message' => 'Unauthenticated'], 401);
        }

        $token = $user->currentAccessToken();
        $now = now();
        $last = Carbon::parse($token->last_activity);

        if ($token && $token->last_activity) {
            $last = Carbon::parse($token->last_activity)->timezone('Asia/Jakarta');

            $expired = $user->level_user_id == 1
                ? !$last->isSameDay($now)
                : $last->diffInMinutes($now) >= 30;

            if ($expired) {
                $user->tokens()->delete();
                return response()->json(['status' => false, 'message' => 'Session expired'], 401);
            }
        }

        if ($token) {
            $token->forceFill(['last_activity' => $now])->save();
        }

        return $next($request);
    }
}
