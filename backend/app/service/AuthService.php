<?php

namespace App\Service;

use App\Models\tbl_user;
use App\Models\tbl_level_user;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

use App\Helper\AppLogger;

class AuthService
{
    private function generateUserKd()
    {
        $currentMonth = Carbon::now()->format('Ym');
        $prefix = 'USR-' . $currentMonth . '-';

        $lastUser = tbl_user::where('kd_user', 'LIKE', $prefix . '%')
            ->orderBy('kd_user', 'DESC')
            ->first();

        if (!$lastUser) {
            return $prefix . '0000';
        }

        $lastId = $lastUser->kd_user;
        $lastNumber = substr($lastId, -4);

        $newNumber = str_pad(intval($lastNumber) + 1, 4, '0', STR_PAD_LEFT);
        return $prefix . $newNumber;
    }

    public function allLevelUser()
    {
        $levelUser = tbl_level_user::all();
        return $levelUser;
    }

    public function register($data)
    {
        DB::beginTransaction();
        $log = AppLogger::getLogger('BUAT-REGISTRASI');

        try {
            $log->info("=== MULAI PROSES REGISTER ===");

            $kd_user = $this->generateUserKd();
            $log->info("Kode user berhasil dibuat: " . $kd_user);

            $now = Carbon::now('Asia/Jakarta');

            $user = tbl_user::create([
                'kd_user' => $kd_user,
                'user_name' => $data['user_name'],
                'password' => Hash::make($data['password']),
                'password_tampil' => $data['password'],
                'level_user_id' => $data['level_user_id'],
                'status_user' => "ACTIVE",
                'tgl_input' => $now->toDateString(),
                'waktu_input' => $now->format('H:i:s'),
            ]);

            DB::commit();

            $log->info("=== BERHASIL SIMPAN DATA USER ===");

            return [
                'status' => true,
                'message' => 'Register berhasil',
                'data' => $user
            ];
        } catch (\Throwable $th) {

            DB::rollBack();

            $log->error("=== GAGAL REGISTER === " . $th->getMessage());

            return [
                'status' => false,
                'message' => 'Terjadi kesalahan saat register',
                // ⚠️ sebaiknya ini dihapus kalau production
                'error' => $th->getMessage()
            ];
        }
    }
}
