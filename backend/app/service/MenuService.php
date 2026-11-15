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

    private function getDescendantIds(string $kdMenu): array
    {
        $ids   = [];
        $queue = [$kdMenu];

        while (!empty($queue)) {
            $children = MasterMenu::whereIn('parent_menu', $queue)->pluck('kd_menu')->all();
            $children = array_values(array_diff($children, $ids));
            $ids      = array_merge($ids, $children);
            $queue    = $children;
        }

        return $ids;
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

    public function updateMenu(string $kdMenu, array $data)
    {
        try {
            DB::beginTransaction();

            $menu = MasterMenu::where('kd_menu', $kdMenu)->lockForUpdate()->first();

            if (!$menu) {
                DB::rollBack();
                return ['status' => false, 'code' => 404, 'message' => 'Menu tidak ditemukan'];
            }

            $isParent    = (bool) ($data['is_parent'] ?? false);
            $parentId    = $data['parent_menu'] ?: null;
            $hasChildren = MasterMenu::where('parent_menu', $kdMenu)->exists();

            // Aturan 3: menu yang punya anak harus tetap menjadi grup
            if ($hasChildren && !$isParent) {
                DB::rollBack();
                return [
                    'status' => false,
                    'code' => 422,
                    'message' => 'Menu yang memiliki sub menu tidak bisa dijadikan menu biasa',
                ];
            }

            // Aturan 2: parent harus satu module, grup, bukan diri sendiri/turunannya
            if ($parentId) {
                $parent = MasterMenu::where('kd_menu', $parentId)->first();

                if (!$parent || $parent->kd_module !== $menu->kd_module) {
                    DB::rollBack();
                    return ['status' => false, 'code' => 422, 'message' => 'Parent menu harus dari module yang sama'];
                }

                if ($parent->url_menu) {
                    DB::rollBack();
                    return ['status' => false, 'code' => 422, 'message' => 'Parent menu harus berupa grup (tanpa URL)'];
                }

                if ($parentId === $kdMenu || in_array($parentId, $this->getDescendantIds($kdMenu), true)) {
                    DB::rollBack();
                    return ['status' => false, 'code' => 422, 'message' => 'Parent menu tidak boleh diri sendiri atau turunannya'];
                }
            }

            // Aturan 1: kd_module tidak ikut diubah
            $menu->update([
                'parent_menu' => $parentId,
                'nama_menu'   => strtoupper(strip_tags($data['nama_menu'])),
                'icon_menu'   => $data['icon_menu'] ?? null,
                'url_menu'    => $isParent ? null : ($data['url_menu'] ?? null),
                'urutan'      => $data['urutan'] ?? 0,
            ]);

            DB::commit();

            return ['status' => true, 'message' => 'Menu berhasil diperbarui'];
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('updateMenu failed: ' . $e->getMessage());

            return ['status' => false, 'code' => 500, 'message' => 'Terjadi kesalahan saat memperbarui menu'];
        }
    }
}
