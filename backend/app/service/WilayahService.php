<?php

namespace App\Service;

use App\Models\tbl_master_provinsi;
use App\Models\tbl_master_kabupaten_kota;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

use App\Helper\DeviceHelper;

class WilayahService
{
    public function provinsiGetAll()
    {
        return tbl_master_provinsi::orderBy('nama_provinsi', 'ASC')->get();
    }

    private function generateKdProvinsi()
    {
        $currentMonth = Carbon::now()->format('Ym');
        $prefix = 'PRV-' . $currentMonth . '-';

        $lastProvinsi = tbl_master_provinsi::where('kd_provinsi', 'LIKE', $prefix . '%')
            ->lockForUpdate()
            ->orderBy('kd_provinsi', 'DESC')
            ->first();

        if (!$lastProvinsi) {
            return $prefix . '0000';
        }

        $lastId = $lastProvinsi->kd_provinsi;
        $lastNumber = substr($lastId, -4);

        $newNumber = str_pad(intval($lastNumber) + 1, 4, '0', STR_PAD_LEFT);
        return $prefix . $newNumber;
    }

    private function generateKdKabupatenKota()
    {
        $currentMonth = Carbon::now()->format('Ym');
        $prefix = 'KAB-' . $currentMonth . '-';

        $lastProvinsi = tbl_master_kabupaten_kota::where('kd_kabupaten_kota', 'LIKE', $prefix . '%')
            ->lockForUpdate()
            ->orderBy('kd_kabupaten_kota', 'DESC')
            ->first();

        if (!$lastProvinsi) {
            return $prefix . '0000';
        }

        $lastId = $lastProvinsi->kd_kabupaten_kota;
        $lastNumber = substr($lastId, -4);

        $newNumber = str_pad(intval($lastNumber) + 1, 4, '0', STR_PAD_LEFT);
        return $prefix . $newNumber;
    }

    public function syncProvinsi(array $data)
    {
        try {
            DB::beginTransaction();

            $now = Carbon::now('Asia/Jakarta');

            $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? null;
            $deviceInfo = DeviceHelper::detectDevice($userAgent);

            $deviceType = $deviceInfo['deviceType'] ?? 'UNKNOWN';
            $device = $deviceInfo['browser'] ?? 'Tidak Diketahui';

            foreach ($data as $item) {

                $exist = tbl_master_provinsi::where(
                    'id_provinsi',
                    $item['id_provinsi']
                )->first();

                $kd_provinsi = $this->generateKdProvinsi();
                if (!$exist) {

                    tbl_master_provinsi::create([
                        'kd_provinsi'   => $kd_provinsi,
                        'id_provinsi'   => $item['id_provinsi'],
                        'nama_provinsi' => strtoupper($item['nama_provinsi']),
                        'status_tampil' => 'YA',
                        'tgl_input'     => $now->toDateString(),
                        'bln_input'     => $now->format('m'),
                        'thn_input'     => $now->format('Y'),
                        'waktu_input'   => $now->format('H:i:s'),
                        'user_input'    => $item['user_input'] ?? 'SYSTEM',
                        'alamat_device' => request()->ip(),
                        'type_device'   => $deviceType,
                        'device'        => $device,
                    ]);
                }
            }

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('syncProvinsi failed: ' . $e->getMessage());
            return false;
        }
    }

    public function syncKotaKabupaten(array $data)
    {
        try {
            DB::beginTransaction();

            $now = Carbon::now('Asia/Jakarta');
            $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? null;
            $deviceInfo = DeviceHelper::detectDevice($userAgent);
            $deviceType = $deviceInfo['deviceType'] ?? 'UNKNOWN';
            $device = $deviceInfo['browser'] ?? 'Tidak Diketahui';

            foreach ($data as $item) {
                $exist = tbl_master_kabupaten_kota::where(
                    'id_kabupaten_kota',
                    $item['id_kabupaten_kota']
                )->first();

                $kd_kabupaten_kota = $this->generateKdKabupatenKota();

                if (!$exist) {
                    $provinsi = tbl_master_provinsi::where(
                        'id_provinsi',
                        $item['province_id']
                    )->first();

                    tbl_master_kabupaten_kota::create([
                        'kd_kabupaten_kota'   => $kd_kabupaten_kota,
                        'id_kabupaten_kota'   => $item['id_kabupaten_kota'],
                        'province_id'         => $item['province_id'],
                        'kd_provinsi'         => $provinsi ? $provinsi->kd_provinsi : null,
                        'nama_kabupaten_kota' => strtoupper($item['nama_kabupaten_kota']),
                        'status_tampil'       => 'YA',
                        'tgl_input'           => $now->toDateString(),
                        'bln_input'           => $now->format('m'),
                        'thn_input'           => $now->format('Y'),
                        'waktu_input'         => $now->format('H:i:s'),
                        'user_input'          => $item['user_input'] ?? 'SYSTEM',
                        'alamat_device'       => request()->ip(),
                        'type_device'         => $deviceType,
                        'device'              => $device,
                    ]);
                }
            }

            DB::commit();
            return true;
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('syncKotaKabupaten failed: ' . $e->getMessage());
            throw $e;
        }
    }
}
