<?php

namespace App\Service;

use App\Helper\DeviceHelper;
use App\Models\MasterHakAksesMenu;
use App\Models\MasterHakAksesModule;
use App\Models\MasterMenu;
use App\Models\MasterModule;
use App\Models\tbl_user;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AksesService
{
    private function nextCode(string $model, string $column, string $prefix): string
    {
        $prefix = $prefix . '-' . now()->format('Ym') . '-';

        $last = $model::where($column, 'LIKE', $prefix . '%')
            ->lockForUpdate()
            ->orderBy($column, 'DESC')
            ->first();

        $number = $last ? intval(substr($last->$column, -4)) + 1 : 0;

        return $prefix . str_pad($number, 4, '0', STR_PAD_LEFT);
    }

    private function auditFields(string $userName): array
    {
        $now = now();

        return [
            'tgl_input'   => $now->toDateString(),
            'bln_input'   => $now->format('m'),
            'thn_input'   => $now->format('Y'),
            'waktu_input' => $now->format('H:i:s'),
            'user_input'  => $userName,
        ];
    }

    private function deviceFields(): array
    {
        $info = DeviceHelper::detectDevice($_SERVER['HTTP_USER_AGENT'] ?? null);

        return [
            'alamat_device' => request()->ip(),
            'type_device'   => $info['deviceType'] ?? 'UNKNOWN',
            'device'        => $info['browser'] ?? 'Tidak Diketahui',
        ];
    }

    /** Module yang boleh diakses user yang sedang login */
    public function getMyModules($user): array
    {
        $isSuper = (int) $user->level_user_id === 1;

        $query = MasterModule::where('status_module', 'AKTIF');

        if (!$isSuper) {
            $query->whereIn(
                'kd_module',
                MasterHakAksesModule::where('kd_user', $user->kd_user)
                    ->where('status_akses', 'YA')
                    ->select('kd_module')
            );
        }

        return [
            'is_super_admin' => $isSuper,
            'modules' => $query->orderBy('urutan')->orderBy('nama_module')
                ->get(['kd_module', 'nama_module', 'icon_module', 'url_module']),
        ];
    }

    /** Daftar user untuk halaman pengaturan hak akses */
    public function listUsers()
    {
        $totals = MasterHakAksesModule::where('status_akses', 'YA')
            ->selectRaw('kd_user, COUNT(*) AS total')
            ->groupBy('kd_user')
            ->pluck('total', 'kd_user');

        return tbl_user::orderBy('user_name')->get()->map(fn($u) => [
            'kd_user'        => Crypt::encryptString($u->kd_user),
            'user_name'      => $u->user_name,
            'level_user_id'  => $u->level_user_id,
            'is_super_admin' => (int) $u->level_user_id === 1,
            'total_module'   => (int) ($totals[$u->kd_user] ?? 0),
        ]);
    }

    /** Seluruh module + menu beserta izin milik satu user */
    public function getUserAkses(string $kdUser): ?array
    {
        $user = tbl_user::where('kd_user', $kdUser)->first();

        if (!$user) {
            return null;
        }

        $granted = MasterHakAksesModule::where('kd_user', $kdUser)
            ->where('status_akses', 'YA')
            ->pluck('kd_module')
            ->all();

        $perms = MasterHakAksesMenu::where('kd_user', $kdUser)->get()->keyBy('kd_menu');

        $menus = MasterMenu::orderBy('urutan')->orderBy('nama_menu')->get()->groupBy('kd_module');

        $modules = MasterModule::orderBy('urutan')->orderBy('nama_module')->get()
            ->map(function ($m) use ($granted, $perms, $menus) {
                return [
                    'kd_module'     => $m->kd_module,
                    'nama_module'   => $m->nama_module,
                    'status_module' => $m->status_module,
                    'akses'         => in_array($m->kd_module, $granted, true),
                    'menus'         => ($menus->get($m->kd_module) ?? collect())->map(function ($mn) use ($perms) {
                        $p   = $perms->get($mn->kd_menu);
                        $yes = fn($field) => $p && $p->$field === 'YA';

                        return [
                            'kd_menu'      => $mn->kd_menu,
                            'parent_menu'  => $mn->parent_menu,
                            'nama_menu'    => $mn->nama_menu,
                            'url_menu'     => $mn->url_menu,
                            'status_akses' => $mn->status_akses,
                            'izin'         => [
                                'lihat'  => $yes('bisa_lihat'),
                                'insert' => $yes('bisa_insert'),
                                'edit'   => $yes('bisa_edit'),
                                'hapus'  => $yes('bisa_hapus'),
                                'export' => $yes('bisa_export'),
                            ],
                        ];
                    })->values(),
                ];
            })->values();

        return [
            'user' => [
                'user_name'      => $user->user_name,
                'is_super_admin' => (int) $user->level_user_id === 1,
            ],
            'modules' => $modules,
        ];
    }

    public function saveUserAkses(string $kdUser, array $modules, string $adminName): array
    {
        try {
            DB::beginTransaction();

            $target = tbl_user::where('kd_user', $kdUser)->first();

            if (!$target) {
                DB::rollBack();
                return ['status' => false, 'code' => 404, 'message' => 'User tidak ditemukan'];
            }

            if ((int) $target->level_user_id === 1) {
                DB::rollBack();
                return ['status' => false, 'code' => 422, 'message' => 'Super admin memiliki akses penuh, tidak perlu diatur'];
            }

            foreach ($modules as $mod) {
                $kdModule = $mod['kd_module'];
                $akses    = (bool) $mod['akses'];

                $row = MasterHakAksesModule::where('kd_user', $kdUser)
                    ->where('kd_module', $kdModule)->first();

                if ($row) {
                    $row->update(['status_akses' => $akses ? 'YA' : 'TIDAK']);
                } else {
                    MasterHakAksesModule::create([
                        'kd_hak_akses_module' => $this->nextCode(MasterHakAksesModule::class, 'kd_hak_akses_module', 'HAMOD'),
                        'kd_user'             => $kdUser,
                        'kd_module'           => $kdModule,
                        'status_akses'        => $akses ? 'YA' : 'TIDAK',
                    ] + $this->auditFields($adminName));
                }

                // Hanya menu milik module ini yang diterima
                $validMenus = MasterMenu::where('kd_module', $kdModule)->pluck('kd_menu')->all();

                foreach ($mod['menus'] ?? [] as $menu) {
                    if (!in_array($menu['kd_menu'], $validMenus, true)) {
                        continue;
                    }

                    $lihat = $akses && (bool) $menu['lihat'];

                    $izin = [
                        'bisa_lihat'   => $lihat ? 'YA' : 'TIDAK',
                        'bisa_insert'  => ($lihat && $menu['insert']) ? 'YA' : 'TIDAK',
                        'bisa_edit'    => ($lihat && $menu['edit']) ? 'YA' : 'TIDAK',
                        'bisa_hapus'   => ($lihat && $menu['hapus']) ? 'YA' : 'TIDAK',
                        'bisa_export'  => ($lihat && $menu['export']) ? 'YA' : 'TIDAK',
                        'status_akses' => $lihat ? 'YA' : 'TIDAK',
                    ];

                    $menuRow = MasterHakAksesMenu::where('kd_user', $kdUser)
                        ->where('kd_menu', $menu['kd_menu'])->first();

                    if ($menuRow) {
                        $menuRow->update($izin);
                    } else {
                        MasterHakAksesMenu::create([
                            'kd_hak_akses_menu' => $this->nextCode(MasterHakAksesMenu::class, 'kd_hak_akses_menu', 'HAMEN'),
                            'kd_user'           => $kdUser,
                            'kd_menu'           => $menu['kd_menu'],
                        ] + $izin + $this->auditFields($adminName) + $this->deviceFields());
                    }
                }
            }

            DB::commit();

            return ['status' => true, 'message' => 'Hak akses berhasil disimpan'];
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('saveUserAkses failed: ' . $e->getMessage());

            return ['status' => false, 'code' => 500, 'message' => 'Terjadi kesalahan saat menyimpan hak akses'];
        }
    }
}
