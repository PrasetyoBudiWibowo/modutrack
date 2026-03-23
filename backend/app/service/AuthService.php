<?php

namespace App\Service;

use App\Models\tbl_user;
use App\Models\tbl_level_user;
use App\Models\tbl_history_login;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

use App\Helper\AppLogger;
use App\Helper\GeoDetector;
use App\Helper\DeviceHelper;

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

    private function buatKodeHistoryLogin()
    {
        $currentMonth = Carbon::now()->format('Ym');
        $prefix = 'HSL-' . $currentMonth . '-';

        $lastUser = tbl_history_login::where('kd_history_login', 'LIKE', $prefix . '%')
            ->orderBy('kd_history_login', 'DESC')
            ->first();

        if (!$lastUser) {
            return $prefix . '0000';
        }

        $lastId = $lastUser->kd_history_login;
        $lastNumber = substr($lastId, -4);

        $newNumber = str_pad(intval($lastNumber) + 1, 4, '0', STR_PAD_LEFT);
        return $prefix . $newNumber;
    }

    private function buatHistoryLoginUser($data)
    {
        DB::beginTransaction();
        $log = AppLogger::getLogger('BUAT-HISTORY-LOGIN');
        try {
            $log->info("<=== MULAI PROSES SIMPAN DATA HISTORY LOGIN =====>");
            // $log->info("Data: " . json_encode($data));

            $kd_history_login = $this->buatKodeHistoryLogin();
            $log->info("berhasil buat code PK HistoryLoginUser");

            $now = Carbon::now('Asia/Jakarta');

            $userAgent = $_SERVER['HTTP_USER_AGENT'];
            $deviceInfo = DeviceHelper::detectDevice($userAgent);
            $deviceType = $deviceInfo['deviceType'];
            $device = $deviceInfo['browser'];

            $ipDetector = GeoDetector::getDeviceLocation();
            $ipDevice = isset($ipDetector['ip']) ? $ipDetector['ip'] : 'Unknown IP';

            $historyLogin = tbl_history_login::create([
                'kd_history_login' => $kd_history_login,
                'kd_user' => $data['kd_user'],
                'user_name' => $data['user_name'],
                'tgl_login' => $now->toDateString(),
                'waktu_login' => $now->format('H:i:s'),
                'alamat_device' => $ipDevice,
                'type_device' => $deviceType,
                'device' => $device,
            ]);

            DB::commit();

            $log->info("=== BERHASIL SIMPAN DATA HISTORY LOGIN ===");

            return $historyLogin;
        } catch (\Throwable $th) {
            DB::rollBack();
            return response()->json(['status' => 'error', 'message' => $th->getMessage()], 500);
            throw $th;
        }
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
            $log->info("=== BERHASIL BUAL KODE ===");

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
                'error' => $th->getMessage()
            ];
        }
    }

    public function login($data)
    {
        $log = AppLogger::getLogger('LOGIN');

        $user = tbl_user::where('user_name', $data['user_name'])
            ->where('blokir', 'TIDAK')
            ->where('status_user', 'ACTIVE')
            ->first();

        if (!$user) {
            $log->error("USER TIDAK DITEMUKAN", [
                'user_name' => $data['user_name']
            ]);

            return [
                'status' => false,
                'message' => 'User tidak ditemukan'
            ];
        }

        if (!Hash::check($data['password'], $user->password)) {
            return [
                'status' => false,
                'message' => 'Password salah'
            ];
        }

        $historyLogin = $this->buatHistoryLoginUser([
            'kd_user' => $user->kd_user,
            'user_name' => $user->user_name
        ]);

        if (!$historyLogin) {
            $log->error("Gagal membuat history login");

            return [
                'status' => false,
                'message' => 'Gagal menyimpan history login'
            ];
        }

        $user->update([
            'tgl_login_terakhir' => $historyLogin->tgl_login,
            'waktu_login_terakhir' => $historyLogin->waktu_login,
        ]);

        return [
            'status' => true,
            'data' => [
                'kd_user' => $user->kd_user,
                'user_name' => $user->user_name,
                'level_user_id' => $user->level_user_id,
                'status_user' => $user->status_user,
                'blokir' => $user->blokir,
                'img_user' => $user->img_user,
                'format_img_user' => $user->format_img_user,
                'level_user' => [
                    [
                        'id' => $user->level->id,
                        'level_user' => $user->level->level_user,
                    ]
                ],
            ]
        ];
    }
}
