<?php

namespace App\Service;

use App\Models\MasterJenisRiwayatPerusahaan;
use App\Models\MasterPerusahaan;
use App\Models\MasterTipePerusahaan;
use App\Models\RiwayatPerusahaan;
use App\Service\Concerns\GeneratesAuditData;
use App\Service\Concerns\RunsInTransaction;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PerusahaanService
{
    use GeneratesAuditData, RunsInTransaction;

    private const WILAYAH = [
        'provinsi'  => ['table' => 'tbl_master_provinsi',       'key' => 'id_provinsi',       'nama' => 'nama_provinsi',       'parent' => null],
        'kota'      => ['table' => 'tbl_master_kabupaten_kota', 'key' => 'id_kabupaten_kota', 'nama' => 'nama_kabupaten_kota', 'parent' => 'province_id'],
        'kecamatan' => ['table' => 'tbl_master_kecamatan',      'key' => 'id_kecamatan',      'nama' => 'nama_kecamatan',      'parent' => 'regency_id'],
        'desa'      => ['table' => 'tbl_master_village',        'key' => 'id_village',        'nama' => 'nama_village',        'parent' => 'district_id'],
    ];

    private const FIELD_LEGAL  = ['badan_hukum_sendiri', 'nama_badan_hukum', 'npwp', 'no_akta'];
    private const FIELD_ALAMAT = ['kd_provinsi', 'kd_kabupaten_kota', 'kd_kecamatan', 'mode_desa', 'kd_village', 'nama_desa_manual', 'alamat_rinci', 'kode_pos'];

    private const PESAN_UNIK = [
        'master_perusahaan_satu_akar'          => 'Grup utama sudah ada',
        'master_perusahaan_kode_cabang_unique' => 'Kode cabang sudah dipakai',
    ];

    private function dipakaiData(array $ids): ?string
    {
        return null;
    }

    private function superAdmin($actor): bool
    {
        return (int) $actor->level_user_id === 1;
    }

    private function bersihkan(array $d): array
    {
        $teks = [
            'kode_cabang',
            'nama',
            'singkatan',
            'nama_badan_hukum',
            'no_akta',
            'nama_desa_manual',
            'alamat_rinci',
            'telepon',
            'email',
            'kode_pos',
            'alasan'
        ];

        foreach ($teks as $f) {
            if (isset($d[$f])) {
                $nilai = trim(strip_tags((string) $d[$f]));
                $d[$f] = $nilai === '' ? null : $nilai;
            }
        }

        if (isset($d['kode_cabang'])) {
            $d['kode_cabang'] = strtoupper($d['kode_cabang']);
        }

        return $d;
    }

    private function olahLegal(array $d, MasterTipePerusahaan $tipe, bool $akar): array
    {
        $sendiri = $akar ? 'YA' : ($d['badan_hukum_sendiri'] ?? 'TIDAK');

        if ($sendiri !== 'YA') {
            return ['badan_hukum_sendiri' => 'TIDAK', 'nama_badan_hukum' => null, 'npwp' => null, 'no_akta' => null];
        }

        $this->pastikan(
            $tipe->boleh_badan_hukum === 'YA',
            $akar ? 'Tipe grup utama harus bertanda boleh berbadan hukum' : 'Tipe ini tidak diizinkan berbadan hukum',
        );

        $npwp = preg_replace('/\D/', '', (string) ($d['npwp'] ?? ''));

        $this->pastikan(in_array(strlen($npwp), [15, 16], true), 'NPWP harus 15 atau 16 digit');
        $this->pastikan(!empty($d['nama_badan_hukum']), 'Nama badan hukum wajib diisi');

        return [
            'badan_hukum_sendiri' => 'YA',
            'nama_badan_hukum'    => $d['nama_badan_hukum'],
            'npwp'                => $npwp,
            'no_akta'             => $d['no_akta'] ?? null,
        ];
    }

    private function olahAlamat(array $d): array
    {
        $kosong = array_fill_keys(self::FIELD_ALAMAT, null);

        $prov = $d['kd_provinsi'] ?? null;
        $kota = $d['kd_kabupaten_kota'] ?? null;
        $kec  = $d['kd_kecamatan'] ?? null;
        $mode = $d['mode_desa'] ?? null;
        $desa = $d['kd_village'] ?? null;
        $man  = $d['nama_desa_manual'] ?? null;

        if (!$prov && !$kota && !$kec && !$mode && !$desa && !$man) {
            $this->pastikan(
                empty($d['alamat_rinci']) && empty($d['kode_pos']),
                'Lengkapi provinsi, kota, dan kecamatan sebelum mengisi alamat rinci atau kode pos',
            );

            return $kosong;
        }

        $this->pastikan($prov && $kota && $kec, 'Provinsi, kabupaten/kota, dan kecamatan wajib dipilih lengkap');
        $this->pastikan(in_array($mode, ['PILIH', 'MANUAL'], true), 'Pilih cara mengisi desa/kelurahan');

        $this->pastikan($this->wilayahAda('provinsi', $prov), 'Provinsi tidak ditemukan');
        $this->pastikan($this->wilayahAda('kota', $kota, $prov), 'Kabupaten/kota tidak sesuai dengan provinsi yang dipilih');
        $this->pastikan($this->wilayahAda('kecamatan', $kec, $kota), 'Kecamatan tidak sesuai dengan kabupaten/kota yang dipilih');

        if ($mode === 'PILIH') {
            $this->pastikan($desa, 'Desa/kelurahan wajib dipilih');
            $this->pastikan($this->wilayahAda('desa', $desa, $kec), 'Desa/kelurahan tidak sesuai dengan kecamatan yang dipilih');
            $man = null;
        } else {
            $this->pastikan($man, 'Nama desa/kelurahan wajib diisi');
            $desa = null;
        }

        return [
            'kd_provinsi'       => $prov,
            'kd_kabupaten_kota' => $kota,
            'kd_kecamatan'      => $kec,
            'mode_desa'         => $mode,
            'kd_village'        => $desa,
            'nama_desa_manual'  => $man,
            'alamat_rinci'      => $d['alamat_rinci'] ?? null,
            'kode_pos'          => $d['kode_pos'] ?? null,
        ];
    }

    private function wilayahAda(string $level, string $id, ?string $induk = null): bool
    {
        $cfg = self::WILAYAH[$level];
        $q   = DB::table($cfg['table'])->where($cfg['key'], $id);

        if ($induk !== null && $cfg['parent']) {
            $q->where($cfg['parent'], $induk);
        }

        return $q->exists();
    }

    private function turunanIds(string $kd): array
    {
        $rows = DB::select(
            'WITH RECURSIVE pohon AS (
                SELECT kd_perusahaan FROM master_perusahaan WHERE kd_induk = ?
                UNION ALL
                SELECT p.kd_perusahaan FROM master_perusahaan p
                JOIN pohon ON p.kd_induk = pohon.kd_perusahaan
            ) SELECT kd_perusahaan FROM pohon',
            [$kd],
        );

        return array_column($rows, 'kd_perusahaan');
    }

    private function snapshot(array $data): array
    {
        return Arr::only($data, array_merge(
            ['nama', 'kode_cabang', 'kd_tipe_perusahaan', 'kd_induk'],
            self::FIELD_LEGAL,
            self::FIELD_ALAMAT,
        ));
    }

    private function selisih(array $lama, array $baru, array $kolom): ?array
    {
        $a = [];
        $b = [];

        foreach ($kolom as $k) {
            $x = $lama[$k] ?? null;
            $y = $baru[$k] ?? null;

            if ($x !== $y) {
                $a[$k] = $x;
                $b[$k] = $y;
            }
        }

        return $a ? [$a, $b] : null;
    }

    private function catat(string $kd, string $kodeJenis, ?array $lama, ?array $baru, string $tglBerlaku, ?string $alasan, $actor): void
    {
        $jenis = MasterJenisRiwayatPerusahaan::whereRaw('LOWER(kode) = ?', [strtolower($kodeJenis)])
            ->where('status', 'AKTIF')
            ->first();

        $this->pastikan(
            $jenis,
            "Jenis riwayat bawaan \"$kodeJenis\" belum tersedia. Jalankan seeder JenisRiwayatPerusahaanSeeder",
            500,
        );

        RiwayatPerusahaan::create([
            'kd_riwayat_perusahaan' => $this->nextCode(RiwayatPerusahaan::class, 'kd_riwayat_perusahaan', 'RWP'),
            'kd_perusahaan'         => $kd,
            'kd_jenis_riwayat'      => $jenis->kd_jenis_riwayat,
            'nilai_lama'            => $lama,
            'nilai_baru'            => $baru,
            'tgl_berlaku'           => $tglBerlaku,
            'alasan'                => $alasan,
        ] + $this->auditFieldsBaru($actor->user_name) + $this->deviceFields());
    }


    public function daftar()
    {
        $rows = MasterPerusahaan::with('tipe:kd_tipe_perusahaan,nama')->orderBy('nama')->get();
        $byId = $rows->keyBy('kd_perusahaan');

        $namaKota = DB::table(self::WILAYAH['kota']['table'])
            ->whereIn(self::WILAYAH['kota']['key'], $rows->pluck('kd_kabupaten_kota')->filter()->unique()->all())
            ->pluck(self::WILAYAH['kota']['nama'], self::WILAYAH['kota']['key']);

        $jumlahAnak = $rows->whereNotNull('kd_induk')->groupBy('kd_induk')->map->count();

        $efektif = function ($p) use ($byId) {
            for ($cur = $p; $cur; $cur = $cur->kd_induk ? $byId->get($cur->kd_induk) : null) {
                if ($cur->badan_hukum_sendiri === 'YA') {
                    return ['kd_perusahaan' => $cur->kd_perusahaan, 'nama_badan_hukum' => $cur->nama_badan_hukum];
                }
            }

            return null;
        };

        return $rows->map(fn($p) => $p->only([
            'kd_perusahaan',
            'kode_cabang',
            'nama',
            'singkatan',
            'kd_tipe_perusahaan',
            'kd_induk',
            'badan_hukum_sendiri',
            'nama_badan_hukum',
            'npwp',
            'no_akta',
            'kd_provinsi',
            'kd_kabupaten_kota',
            'kd_kecamatan',
            'mode_desa',
            'kd_village',
            'nama_desa_manual',
            'alamat_rinci',
            'kode_pos',
            'telepon',
            'email',
            'tgl_berdiri',
            'tgl_tutup',
            'status',
        ]) + [
            'nama_tipe'        => $p->tipe?->nama,
            'nama_kota'        => $namaKota[$p->kd_kabupaten_kota] ?? null,
            'jumlah_anak'      => $jumlahAnak[$p->kd_perusahaan] ?? 0,
            'badan_hukum_efektif' => $efektif($p),
        ])->values();
    }

    public function opsiTipe()
    {
        return MasterTipePerusahaan::where('status', 'AKTIF')
            ->orderBy('nama')
            ->get(['kd_tipe_perusahaan', 'nama', 'boleh_badan_hukum']);
    }

    public function opsiWilayah(string $level, ?string $induk)
    {
        $cfg = self::WILAYAH[$level];
        $q   = DB::table($cfg['table']);

        if ($cfg['parent']) {
            $q->where($cfg['parent'], $induk);
        }

        return $q->orderBy($cfg['nama'])->get([$cfg['key'] . ' as id', $cfg['nama'] . ' as nama']);
    }

    public function riwayat(string $kd): ?array
    {
        if (!MasterPerusahaan::where('kd_perusahaan', $kd)->exists()) {
            return null;
        }

        return RiwayatPerusahaan::with('jenis:kd_jenis_riwayat,kode,nama')
            ->where('kd_perusahaan', $kd)
            ->orderByDesc('tgl_berlaku')
            ->orderByDesc('kd_riwayat_perusahaan')
            ->limit(100)
            ->get()
            ->map(fn($r) => [
                'jenis_kode'  => $r->jenis?->kode,
                'jenis_nama'  => $r->jenis?->nama,
                'nilai_lama'  => $r->nilai_lama,
                'nilai_baru'  => $r->nilai_baru,
                'tgl_berlaku' => $r->tgl_berlaku,
                'alasan'      => $r->alasan,
                'dicatat_oleh' => $r->user_input,
                'dicatat_pada' => $r->tgl_input . ' ' . $r->waktu_input,
            ])
            ->all();
    }

    /* --------------------------------------------------------------- tulis */

    public function buat(array $d, $actor): array
    {
        return $this->transaksi('buatPerusahaan', function () use ($d, $actor) {
            $d = $this->bersihkan($d);

            $tipe = MasterTipePerusahaan::find($d['kd_tipe_perusahaan']);
            $this->pastikan($tipe && $tipe->status === 'AKTIF', 'Tipe tidak ditemukan atau tidak aktif');

            $akar    = MasterPerusahaan::whereNull('kd_induk')->first();
            $kdInduk = $d['kd_induk'] ?? null;

            if (!$akar) {
                $this->pastikan($this->superAdmin($actor), 'Hanya super admin yang dapat membuat grup utama', 403);
                $this->pastikan(!$kdInduk, 'Grup utama tidak memiliki induk');
                $jadiAkar = true;
            } else {
                $this->pastikan($kdInduk, 'Induk wajib dipilih karena grup utama sudah ada');
                $induk = MasterPerusahaan::find($kdInduk);
                $this->pastikan($induk && $induk->status === 'AKTIF', 'Induk tidak ditemukan atau tidak aktif');
                $jadiAkar = false;
            }

            $this->pastikan(
                !MasterPerusahaan::whereRaw('LOWER(kode_cabang) = ?', [strtolower($d['kode_cabang'])])->exists(),
                'Kode cabang sudah dipakai',
            );

            $kd = $this->nextCode(MasterPerusahaan::class, 'kd_perusahaan', 'PRS');

            $data = [
                'kd_perusahaan'      => $kd,
                'kode_cabang'        => $d['kode_cabang'],
                'nama'               => $d['nama'],
                'singkatan'          => $d['singkatan'] ?? null,
                'kd_tipe_perusahaan' => $tipe->kd_tipe_perusahaan,
                'kd_induk'           => $kdInduk,
            ] + $this->olahLegal($d, $tipe, $jadiAkar) + $this->olahAlamat($d) + [
                'telepon'     => $d['telepon'] ?? null,
                'email'       => $d['email'] ?? null,
                'tgl_berdiri' => $d['tgl_berdiri'] ?? null,
                'status'      => 'AKTIF',
            ] + $this->auditFieldsBaru($actor->user_name) + $this->deviceFields();

            MasterPerusahaan::create($data);

            $this->catat($kd, 'DIBUAT', null, $this->snapshot($data), now()->toDateString(), null, $actor);

            return [
                'message' => $jadiAkar ? 'Grup utama berhasil dibuat' : 'Cabang berhasil dibuat',
                'data'    => ['kd_perusahaan' => $kd],
            ];
        }, self::PESAN_UNIK);
    }

    public function ubah(string $kd, array $d, $actor): array
    {
        return $this->transaksi('ubahPerusahaan', function () use ($kd, $d, $actor) {
            $p = MasterPerusahaan::where('kd_perusahaan', $kd)->lockForUpdate()->first();
            $this->pastikan($p, 'Perusahaan tidak ditemukan', 404);

            $akar = $p->kd_induk === null;
            $this->pastikan(!$akar || $this->superAdmin($actor), 'Hanya super admin yang dapat mengubah grup utama', 403);

            $d = $this->bersihkan($d);

            $tipeLama   = MasterTipePerusahaan::find($p->kd_tipe_perusahaan);
            $kdTipeBaru = $d['kd_tipe_perusahaan'] ?? $p->kd_tipe_perusahaan;
            $gantiTipe  = $kdTipeBaru !== $p->kd_tipe_perusahaan;
            $tipe       = $gantiTipe ? MasterTipePerusahaan::find($kdTipeBaru) : $tipeLama;

            $this->pastikan($tipe && (!$gantiTipe || $tipe->status === 'AKTIF'), 'Tipe tidak ditemukan atau tidak aktif');

            $this->pastikan(
                !MasterPerusahaan::whereRaw('LOWER(kode_cabang) = ?', [strtolower($d['kode_cabang'])])
                    ->where('kd_perusahaan', '!=', $kd)->exists(),
                'Kode cabang sudah dipakai',
            );

            $legal = $this->olahLegal($d, $tipe, $akar);

            if ($p->badan_hukum_sendiri === 'YA' && $legal['badan_hukum_sendiri'] === 'TIDAK') {
                $this->pastikan(
                    !empty($d['konfirmasi_hapus_legal']),
                    'Mengubah menjadi ikut pusat akan menghapus data badan hukum. Konfirmasi diperlukan',
                );
            }

            $alamat     = $this->olahAlamat($d);
            $tglBerdiri = $d['tgl_berdiri'] ?? null;

            $this->pastikan(
                !$tglBerdiri || !$p->tgl_tutup || $tglBerdiri <= $p->tgl_tutup,
                'Tanggal berdiri tidak boleh setelah tanggal tutup',
            );

            $kolomRiwayat = array_merge(['nama', 'kode_cabang'], self::FIELD_LEGAL, self::FIELD_ALAMAT);
            $lama = $p->only($kolomRiwayat);
            $baru = ['nama' => $d['nama'], 'kode_cabang' => $d['kode_cabang']] + $legal + $alamat;

            $umumBaru = [
                'singkatan'   => $d['singkatan'] ?? null,
                'telepon'     => $d['telepon'] ?? null,
                'email'       => $d['email'] ?? null,
                'tgl_berdiri' => $tglBerdiri,
            ];

            $perubahan = array_filter([
                'GANTI_NAMA'       => $this->selisih($lama, $baru, ['nama']),
                'GANTI_KODE'       => $this->selisih($lama, $baru, ['kode_cabang']),
                'UBAH_ALAMAT'      => $this->selisih($lama, $baru, self::FIELD_ALAMAT),
                'UBAH_BADAN_HUKUM' => $this->selisih($lama, $baru, self::FIELD_LEGAL),
            ]);

            if ($gantiTipe) {
                $perubahan['UBAH_TIPE'] = [
                    ['kd_tipe_perusahaan' => $p->kd_tipe_perusahaan, 'nama_tipe' => $tipeLama?->nama],
                    ['kd_tipe_perusahaan' => $kdTipeBaru, 'nama_tipe' => $tipe->nama],
                ];
            }

            $adaUmum = $this->selisih($p->only(array_keys($umumBaru)), $umumBaru, array_keys($umumBaru)) !== null;

            $this->pastikan($perubahan || $adaUmum, 'Tidak ada perubahan yang disimpan');

            $p->update($baru + $umumBaru + ['kd_tipe_perusahaan' => $kdTipeBaru]);

            $tgl = $d['tgl_berlaku'] ?? now()->toDateString();

            foreach ($perubahan as $kode => [$a, $b]) {
                $this->catat($kd, $kode, $a, $b, $tgl, $d['alasan'] ?? null, $actor);
            }

            return ['message' => 'Data berhasil diperbarui'];
        }, self::PESAN_UNIK);
    }

    public function pindah(string $kd, array $d, $actor): array
    {
        return $this->transaksi('pindahPerusahaan', function () use ($kd, $d, $actor) {
            $d = $this->bersihkan($d);

            $p = MasterPerusahaan::where('kd_perusahaan', $kd)->lockForUpdate()->first();
            $this->pastikan($p, 'Perusahaan tidak ditemukan', 404);
            $this->pastikan($p->kd_induk !== null, 'Grup utama tidak dapat dipindahkan');

            $indukBaru = MasterPerusahaan::find($d['kd_induk']);
            $this->pastikan($indukBaru && $indukBaru->status === 'AKTIF', 'Induk baru tidak ditemukan atau tidak aktif');
            $this->pastikan($indukBaru->kd_perusahaan !== $p->kd_induk, 'Induk baru sama dengan induk saat ini');
            $this->pastikan(
                $indukBaru->kd_perusahaan !== $kd && !in_array($indukBaru->kd_perusahaan, $this->turunanIds($kd), true),
                'Tidak boleh dipindahkan ke bawah dirinya sendiri atau turunannya',
            );

            $indukLama = MasterPerusahaan::find($p->kd_induk);

            $p->update(['kd_induk' => $indukBaru->kd_perusahaan]);

            $this->catat(
                $kd,
                'PINDAH_INDUK',
                ['kd_induk' => $indukLama?->kd_perusahaan, 'nama_induk' => $indukLama?->nama],
                ['kd_induk' => $indukBaru->kd_perusahaan, 'nama_induk' => $indukBaru->nama],
                $d['tgl_berlaku'],
                $d['alasan'] ?? null,
                $actor,
            );

            return ['message' => 'Perusahaan berhasil dipindahkan'];
        });
    }

    public function ubahStatus(string $kd, bool $aktif, array $d, $actor): array
    {
        return $this->transaksi('ubahStatusPerusahaan', function () use ($kd, $aktif, $d, $actor) {
            $d = $this->bersihkan($d);

            $p = MasterPerusahaan::where('kd_perusahaan', $kd)->lockForUpdate()->first();
            $this->pastikan($p, 'Perusahaan tidak ditemukan', 404);
            $this->pastikan($p->kd_induk !== null || $this->superAdmin($actor), 'Hanya super admin yang dapat mengubah status grup utama', 403);

            $tgl = $d['tgl_berlaku'];

            if (!$aktif) {
                $this->pastikan($p->status === 'AKTIF', 'Sudah dalam keadaan nonaktif');
                $this->pastikan(
                    !MasterPerusahaan::where('kd_induk', $kd)->where('status', 'AKTIF')->exists(),
                    'Masih memiliki cabang aktif. Nonaktifkan atau pindahkan cabang tersebut terlebih dahulu',
                );
                $this->pastikan(!$p->tgl_berdiri || $tgl >= $p->tgl_berdiri, 'Tanggal tutup tidak boleh sebelum tanggal berdiri');

                $p->update(['status' => 'TIDAK', 'tgl_tutup' => $tgl]);

                $this->catat(
                    $kd,
                    'NONAKTIF',
                    ['status' => 'AKTIF', 'tgl_tutup' => null],
                    ['status' => 'TIDAK', 'tgl_tutup' => $tgl],
                    $tgl,
                    $d['alasan'] ?? null,
                    $actor,
                );

                return ['message' => 'Berhasil dinonaktifkan'];
            }

            $this->pastikan($p->status === 'TIDAK', 'Sudah dalam keadaan aktif');

            if ($p->kd_induk) {
                $induk = MasterPerusahaan::find($p->kd_induk);
                $this->pastikan($induk && $induk->status === 'AKTIF', 'Induknya masih nonaktif. Aktifkan induknya terlebih dahulu');
            }

            $p->update(['status' => 'AKTIF', 'tgl_tutup' => null]);

            $this->catat(
                $kd,
                'AKTIF_KEMBALI',
                ['status' => 'TIDAK', 'tgl_tutup' => $p->getOriginal('tgl_tutup')],
                ['status' => 'AKTIF', 'tgl_tutup' => null],
                $tgl,
                $d['alasan'] ?? null,
                $actor,
            );

            return ['message' => 'Berhasil diaktifkan kembali'];
        });
    }

    public function hapus(string $kd, string $konfirmasiNama, $actor): array
    {
        return $this->transaksi('hapusPerusahaan', function () use ($kd, $konfirmasiNama, $actor) {
            $p = MasterPerusahaan::where('kd_perusahaan', $kd)->lockForUpdate()->first();
            $this->pastikan($p, 'Perusahaan tidak ditemukan', 404);
            $this->pastikan($p->kd_induk !== null || $this->superAdmin($actor), 'Hanya super admin yang dapat menghapus grup utama', 403);

            $this->pastikan(
                mb_strtolower(trim($konfirmasiNama)) === mb_strtolower($p->nama),
                'Nama yang diketik tidak sesuai',
            );

            // Unit ini dan seluruh turunannya, yang terdalam lebih dulu
            $rows = DB::select(
                'WITH RECURSIVE pohon AS (
                SELECT kd_perusahaan, 0 AS depth FROM master_perusahaan WHERE kd_perusahaan = ?
                UNION ALL
                SELECT p.kd_perusahaan, pohon.depth + 1 FROM master_perusahaan p
                JOIN pohon ON p.kd_induk = pohon.kd_perusahaan
            ) SELECT kd_perusahaan, depth FROM pohon ORDER BY depth DESC',
                [$kd],
            );
            $ids = array_column($rows, 'kd_perusahaan');

            $alasan = $this->dipakaiData($ids);
            $this->pastikan($alasan === null, $alasan ?? '');

            RiwayatPerusahaan::whereIn('kd_perusahaan', $ids)->delete();

            foreach ($ids as $id) {
                MasterPerusahaan::where('kd_perusahaan', $id)->delete();
            }

            // Riwayatnya ikut terhapus, jadi jejaknya disimpan di log aplikasi
            Log::warning('Perusahaan dihapus', [
                'oleh' => $actor->user_name,
                'kd' => $kd,
                'nama' => $p->nama,
                'jumlah_unit' => count($ids),
            ]);

            return ['message' => count($ids) > 1 ? count($ids) . ' unit berhasil dihapus' : 'Berhasil dihapus'];
        });
    }
}
