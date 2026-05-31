<?php

namespace App\Service;

use App\Models\MasterModule;
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
}
