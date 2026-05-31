<?php

namespace App\Service;

use App\Models\MasterMenu;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

use App\Helper\DeviceHelper;

class MenuService
{
    private function generateKdMenu()
    {
        $currentMonth = Carbon::now()->format('Ym');
        $prefix = 'MNU-' . $currentMonth . '-';

        $last = MasterMenu::where('kd_menu', 'LIKE', $prefix . '%')
            ->lockForUpdate()
            ->orderBy('kd_menu', 'DESC')
            ->first();

        if (!$last) {
            return $prefix . '0000';
        }

        $lastNumber = substr($last->kd_menu, -4);
        $newNumber = str_pad(intval($lastNumber) + 1, 4, '0', STR_PAD_LEFT);

        return $prefix . $newNumber;
    }

    public function getAllMenu()
    {
        return MasterMenu::with(['module', 'parent'])
            ->orderBy('kd_module', 'ASC')
            ->orderBy('urutan', 'ASC')
            ->orderBy('nama_menu', 'ASC')
            ->get();
    }

    public function getMenuByModule(string $kdModule)
    {
        return MasterMenu::with(['parent'])
            ->where('kd_module', $kdModule)
            ->orderBy('urutan', 'ASC')
            ->orderBy('nama_menu', 'ASC')
            ->get();
    }

    public function createMenu(array $data, string $userName)
    {
        try {
            DB::beginTransaction();

            $now = Carbon::now('Asia/Jakarta');

            $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? null;
            $deviceInfo = DeviceHelper::detectDevice($userAgent);
            $deviceType = $deviceInfo['deviceType'] ?? 'UNKNOWN';
            $device = $deviceInfo['browser'] ?? 'Tidak Diketahui';

            $kd_menu = $this->generateKdMenu();

            $isParent = $data['is_parent'] ?? false;

            MasterMenu::create([
                'kd_menu'       => $kd_menu,
                'kd_module'     => $data['kd_module'],
                'parent_menu'   => $isParent ? null : ($data['parent_menu'] ?: null),
                'nama_menu'     => strtoupper($data['nama_menu']),
                'icon_menu'     => $data['icon_menu'] ?? null,
                'url_menu'      => $isParent ? null : ($data['url_menu'] ?? null),
                'urutan'        => $data['urutan'] ?? 0,
                'status_akses'  => 'AKTIF',
                'tgl_input'     => $now->toDateString(),
                'bln_input'     => $now->format('m'),
                'thn_input'     => $now->format('Y'),
                'waktu_input'   => $now->format('H:i:s'),
                'user_input'    => $userName,
                'alamat_device' => request()->ip(),
                'type_device'   => $deviceType,
                'device'        => $device,
            ]);

            DB::commit();

            return [
                'status'  => true,
                'message' => 'Menu berhasil dibuat',
            ];
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('createMenu failed: ' . $e->getMessage());

            return [
                'status'  => false,
                'message' => 'Terjadi kesalahan saat membuat menu',
            ];
        }
    }

    public function toggleStatusMenu(string $kdMenu)
    {
        try {
            DB::beginTransaction();

            $menu = MasterMenu::where('kd_menu', $kdMenu)->first();

            if (!$menu) {
                return [
                    'status'  => false,
                    'message' => 'Menu tidak ditemukan',
                ];
            }

            $menu->update([
                'status_akses' => $menu->status_akses === 'AKTIF' ? 'TIDAK' : 'AKTIF',
            ]);

            DB::commit();

            return [
                'status'  => true,
                'message' => 'Status menu berhasil diubah',
            ];
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('toggleStatusMenu failed: ' . $e->getMessage());

            return [
                'status'  => false,
                'message' => 'Terjadi kesalahan saat mengubah status menu',
            ];
        }
    }
}
