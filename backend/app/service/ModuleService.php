<?php

namespace App\Service;

use App\Models\MasterModule;
use App\Models\MasterMenu;
use App\Models\MasterHakAksesModule;
use App\Models\MasterHakAksesMenu;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

use App\Helper\DeviceHelper;

class ModuleService
{
    private function generateKdModule()
    {
        $currentMonth = Carbon::now()->format('Ym');
        $prefix = 'MOD-' . $currentMonth . '-';

        $last = MasterModule::where('kd_module', 'LIKE', $prefix . '%')
            ->lockForUpdate()
            ->orderBy('kd_module', 'DESC')
            ->first();

        if (!$last) {
            return $prefix . '0000';
        }

        $lastNumber = substr($last->kd_module, -4);
        $newNumber = str_pad(intval($lastNumber) + 1, 4, '0', STR_PAD_LEFT);

        return $prefix . $newNumber;
    }

    public function getAllModule()
    {
        return MasterModule::orderBy('urutan', 'ASC')
            ->orderBy('nama_module', 'ASC')
            ->get();
    }

    public function getModuleMenusBySlug(string $slug, $user): array
    {
        $module = MasterModule::where('url_module', '/dashboard/' . $slug)
            ->where('status_module', 'AKTIF')
            ->first();

        if (!$module) {
            return ['code' => 404, 'message' => 'Module tidak ditemukan'];
        }

        $isSuper = (int) $user->level_user_id === 1;

        if (!$isSuper) {
            $punyaAkses = MasterHakAksesModule::where('kd_user', $user->kd_user)
                ->where('kd_module', $module->kd_module)
                ->where('status_akses', 'YA')
                ->exists();

            if (!$punyaAkses) {
                return ['code' => 403, 'message' => 'Anda tidak memiliki akses ke module ini'];
            }
        }

        $all = MasterMenu::where('kd_module', $module->kd_module)
            ->where('status_akses', 'AKTIF')
            ->orderBy('urutan')
            ->orderBy('nama_menu')
            ->get(['kd_menu', 'parent_menu', 'nama_menu', 'icon_menu', 'url_menu', 'urutan'])
            ->keyBy('kd_menu');

        $full       = ['lihat' => true, 'insert' => true, 'edit' => true, 'hapus' => true, 'export' => true];
        $izinMap    = [];
        $visibleIds = [];

        if ($isSuper) {
            foreach ($all->keys() as $kd) {
                $visibleIds[$kd] = true;
                $izinMap[$kd]    = $full;
            }
        } else {
            $perms = MasterHakAksesMenu::where('kd_user', $user->kd_user)
                ->where('status_akses', 'YA')
                ->where('bisa_lihat', 'YA')
                ->whereIn('kd_menu', $all->keys())
                ->get()
                ->keyBy('kd_menu');

            foreach ($perms as $kd => $p) {
                $visibleIds[$kd] = true;
                $izinMap[$kd] = [
                    'lihat'  => true,
                    'insert' => $p->bisa_insert === 'YA',
                    'edit'   => $p->bisa_edit === 'YA',
                    'hapus'  => $p->bisa_hapus === 'YA',
                    'export' => $p->bisa_export === 'YA',
                ];

                // Grup induk ikut tampil
                $parent = $all[$kd]->parent_menu;
                while ($parent && $all->has($parent) && !isset($visibleIds[$parent])) {
                    $visibleIds[$parent] = true;
                    $parent = $all[$parent]->parent_menu;
                }
            }
        }

        $menus = $all
            ->filter(fn($m, $kd) => isset($visibleIds[$kd]))
            ->map(function ($m, $kd) use ($izinMap) {
                $row         = $m->toArray();
                $row['izin'] = $izinMap[$kd] ?? null; // grup tidak punya izin
                return $row;
            })
            ->values();

        return [
            'code' => 200,
            'data' => [
                'module' => $module->only(['kd_module', 'nama_module', 'icon_module', 'url_module']),
                'menus'  => $menus,
            ],
        ];
    }

    public function createModule(array $data, string $userName)
    {
        try {
            DB::beginTransaction();

            $now = Carbon::now('Asia/Jakarta');

            $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? null;
            $deviceInfo = DeviceHelper::detectDevice($userAgent);
            $deviceType = $deviceInfo['deviceType'] ?? 'UNKNOWN';
            $device = $deviceInfo['browser'] ?? 'Tidak Diketahui';

            $kd_module = $this->generateKdModule();

            MasterModule::create([
                'kd_module'     => $kd_module,
                'nama_module'   => strtoupper($data['nama_module']),
                'icon_module'   => $data['icon_module'] ?? null,
                'url_module'    => $data['url_module'] ?? null,
                'urutan'        => $data['urutan'] ?? 0,
                'status_module' => 'AKTIF',
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
                'message' => 'Module berhasil dibuat',
            ];
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('createModule failed: ' . $e->getMessage());

            return [
                'status'  => false,
                'message' => 'Terjadi kesalahan saat membuat module',
            ];
        }
    }

    public function toggleStatusModule(string $kdModule, string $userName)
    {
        try {
            DB::beginTransaction();

            $module = MasterModule::where('kd_module', $kdModule)->first();

            if (!$module) {
                return [
                    'status'  => false,
                    'message' => 'Module tidak ditemukan',
                ];
            }

            $module->update([
                'status_module' => $module->status_module === 'AKTIF' ? 'TIDAK' : 'AKTIF',
            ]);

            DB::commit();

            return [
                'status'  => true,
                'message' => 'Status module berhasil diubah',
            ];
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('toggleStatusModule failed: ' . $e->getMessage());

            return [
                'status'  => false,
                'message' => 'Terjadi kesalahan saat mengubah status module',
            ];
        }
    }

    public function updateModule(string $kdModule, array $data)
    {
        try {
            DB::beginTransaction();

            $module = MasterModule::where('kd_module', $kdModule)->first();

            if (!$module) {
                DB::rollBack();
                return [
                    'status'  => false,
                    'code'    => 404,
                    'message' => 'Module tidak ditemukan',
                ];
            }

            $module->update([
                'nama_module' => strtoupper($data['nama_module']),
                'icon_module' => $data['icon_module'] ?? null,
                'url_module'  => $data['url_module'] ?? null,
                'urutan'      => $data['urutan'] ?? 0,
            ]);

            DB::commit();

            return [
                'status'  => true,
                'message' => 'Module berhasil diperbarui',
            ];
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('updateModule failed: ' . $e->getMessage());

            return [
                'status'  => false,
                'code'    => 500,
                'message' => 'Terjadi kesalahan saat memperbarui module',
            ];
        }
    }
}
