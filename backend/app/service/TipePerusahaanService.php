<?php

namespace App\Service;

use App\Models\MasterPerusahaan;
use App\Models\MasterTipePerusahaan;
use App\Service\Concerns\GeneratesAuditData;
use App\Service\Concerns\RunsInTransaction;

class TipePerusahaanService
{
    use GeneratesAuditData, RunsInTransaction;

    private const PESAN_UNIK = [
        'master_tipe_perusahaan_nama_unique' => 'Nama tipe sudah dipakai',
    ];

    public function daftar()
    {
        return MasterTipePerusahaan::withCount('perusahaan')
            ->orderBy('nama')
            ->get()
            ->map(fn($t) => [
                'kd_tipe_perusahaan' => $t->kd_tipe_perusahaan,
                'nama'               => $t->nama,
                'boleh_badan_hukum'  => $t->boleh_badan_hukum,
                'status'             => $t->status,
                'jumlah_dipakai'     => $t->perusahaan_count,
            ]);
    }

    public function buat(array $d, $actor): array
    {
        return $this->transaksi('buatTipePerusahaan', function () use ($d, $actor) {
            $nama = trim(strip_tags($d['nama']));

            $this->pastikan(
                !MasterTipePerusahaan::whereRaw('LOWER(nama) = ?', [mb_strtolower($nama)])->exists(),
                'Nama tipe sudah dipakai',
            );

            $kd = $this->nextCode(MasterTipePerusahaan::class, 'kd_tipe_perusahaan', 'TPP');

            MasterTipePerusahaan::create([
                'kd_tipe_perusahaan' => $kd,
                'nama'               => $nama,
                'boleh_badan_hukum'  => $d['boleh_badan_hukum'],
                'status'             => 'AKTIF',
            ] + $this->auditFieldsBaru($actor->user_name) + $this->deviceFields());

            return ['message' => 'Tipe berhasil dibuat', 'data' => ['kd_tipe_perusahaan' => $kd]];
        }, self::PESAN_UNIK);
    }

    public function ubah(string $kd, array $d, $actor): array
    {
        return $this->transaksi('ubahTipePerusahaan', function () use ($kd, $d) {
            $tipe = MasterTipePerusahaan::where('kd_tipe_perusahaan', $kd)->lockForUpdate()->first();
            $this->pastikan($tipe, 'Tipe tidak ditemukan', 404);

            $nama = trim(strip_tags($d['nama']));

            $this->pastikan(
                !MasterTipePerusahaan::whereRaw('LOWER(nama) = ?', [mb_strtolower($nama)])
                    ->where('kd_tipe_perusahaan', '!=', $kd)->exists(),
                'Nama tipe sudah dipakai',
            );


            if ($tipe->boleh_badan_hukum === 'YA' && $d['boleh_badan_hukum'] === 'TIDAK') {
                $this->pastikan(
                    !MasterPerusahaan::where('kd_tipe_perusahaan', $kd)->where('badan_hukum_sendiri', 'YA')->exists(),
                    'Tipe ini dipakai oleh perusahaan yang berbadan hukum sendiri, izinnya tidak dapat dicabut',
                );
            }

            $tipe->update([
                'nama'              => $nama,
                'boleh_badan_hukum' => $d['boleh_badan_hukum'],
            ]);

            return ['message' => 'Tipe berhasil diperbarui'];
        }, self::PESAN_UNIK);
    }

    public function toggleStatus(string $kd): array
    {
        return $this->transaksi('toggleTipePerusahaan', function () use ($kd) {
            $tipe = MasterTipePerusahaan::where('kd_tipe_perusahaan', $kd)->lockForUpdate()->first();
            $this->pastikan($tipe, 'Tipe tidak ditemukan', 404);

            if ($tipe->status === 'AKTIF') {
                $this->pastikan(
                    !MasterPerusahaan::where('kd_tipe_perusahaan', $kd)->where('status', 'AKTIF')->exists(),
                    'Tipe ini masih dipakai perusahaan yang aktif',
                );
            }

            $tipe->update(['status' => $tipe->status === 'AKTIF' ? 'TIDAK' : 'AKTIF']);

            return ['message' => 'Status tipe berhasil diubah'];
        });
    }
}
