<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EnsureMenuPermission
{
    private const IZIN = ['lihat', 'insert', 'edit', 'hapus', 'export'];

    public function handle(Request $request, Closure $next, string $halaman, string $izin)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['status' => false, 'message' => 'Unauthenticated'], 401);
        }

        if ((int) $user->level_user_id === 1) {
            return $next($request);
        }

        if (!in_array($izin, self::IZIN, true) || !preg_match('/^[a-z0-9-]+$/', $halaman)) {
            return response()->json(['status' => false, 'message' => 'Konfigurasi izin tidak valid'], 500);
        }

        $ada = DB::table('master_hak_akses_menu as hm')
            ->join('master_menu as m', 'm.kd_menu', '=', 'hm.kd_menu')
            ->join('master_module as md', 'md.kd_module', '=', 'm.kd_module')
            ->join('master_hak_akses_module as hmod', function ($j) use ($user) {
                $j->on('hmod.kd_module', '=', 'm.kd_module')
                    ->where('hmod.kd_user', $user->kd_user)
                    ->where('hmod.status_akses', 'YA');
            })
            ->where('hm.kd_user', $user->kd_user)
            ->where('hm.status_akses', 'YA')
            ->where('hm.bisa_' . $izin, 'YA')
            ->where('m.status_akses', 'AKTIF')
            ->where('md.status_module', 'AKTIF')
            ->whereRaw('m.url_menu ~ ?', ['^/dashboard/[^/]+/' . $halaman . '$'])
            ->exists();

        if (!$ada) {
            return response()->json(['status' => false, 'message' => 'Anda tidak memiliki hak akses'], 403);
        }

        return $next($request);
    }
}
