<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class JenisRiwayatPerusahaanSeeder extends Seeder
{
    private const JENIS = [
        ['kd' => 'JRP-SISTEM-0001', 'kode' => 'DIBUAT',           'nama' => 'Dibuat',               'keterangan' => 'Perusahaan atau cabang pertama kali dibuat'],
        ['kd' => 'JRP-SISTEM-0002', 'kode' => 'GANTI_NAMA',       'nama' => 'Ganti nama',           'keterangan' => 'Nama perusahaan atau cabang berubah'],
        ['kd' => 'JRP-SISTEM-0003', 'kode' => 'GANTI_KODE',       'nama' => 'Ganti kode cabang',    'keterangan' => 'Kode cabang berubah'],
        ['kd' => 'JRP-SISTEM-0004', 'kode' => 'PINDAH_INDUK',     'nama' => 'Pindah induk',         'keterangan' => 'Unit dipindahkan ke bawah induk yang lain'],
        ['kd' => 'JRP-SISTEM-0005', 'kode' => 'UBAH_ALAMAT',      'nama' => 'Ubah alamat',          'keterangan' => 'Alamat berubah'],
        ['kd' => 'JRP-SISTEM-0006', 'kode' => 'UBAH_BADAN_HUKUM', 'nama' => 'Ubah badan hukum',    'keterangan' => 'Status atau data badan hukum berubah'],
        ['kd' => 'JRP-SISTEM-0007', 'kode' => 'NONAKTIF',         'nama' => 'Dinonaktifkan',        'keterangan' => 'Perusahaan atau cabang dinonaktifkan'],
        ['kd' => 'JRP-SISTEM-0008', 'kode' => 'AKTIF_KEMBALI',    'nama' => 'Diaktifkan kembali',   'keterangan' => 'Perusahaan atau cabang diaktifkan kembali'],
    ];

    public function run(): void
    {
        $now = now();

        foreach (self::JENIS as $j) {
            $sudahAda = DB::table('master_jenis_riwayat_perusahaan')
                ->whereRaw('LOWER(kode) = ?', [strtolower($j['kode'])])
                ->exists();

            if ($sudahAda) {
                continue;
            }

            DB::table('master_jenis_riwayat_perusahaan')->insert([
                'kd_jenis_riwayat' => $j['kd'],
                'kode'             => $j['kode'],
                'nama'             => $j['nama'],
                'keterangan'       => $j['keterangan'],
                'otomatis'         => 'YA',
                'status'           => 'AKTIF',
                'tgl_input'        => $now->toDateString(),
                'waktu_input'      => $now->format('H:i:s'),
                'user_input'       => 'SYSTEM',
            ]);
        }
    }
}
