<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\API\Concerns\RespondsWithService;
use App\Http\Controllers\Controller;
use App\Service\PerusahaanService;
use Illuminate\Http\Request;

class PerusahaanController extends Controller
{
    use RespondsWithService;

    public function __construct(protected PerusahaanService $service) {}

    private function aturanForm(bool $baru): array
    {
        $rules = [
            'kode_cabang'         => ['required', 'string', 'max:30', 'regex:/^[A-Za-z0-9-]+$/'],
            'nama'                => ['required', 'string', 'max:150'],
            'singkatan'           => ['nullable', 'string', 'max:30'],
            'badan_hukum_sendiri' => ['required', 'in:YA,TIDAK'],
            'nama_badan_hukum'    => ['nullable', 'required_if:badan_hukum_sendiri,YA', 'string', 'max:150'],
            'npwp'                => ['nullable', 'required_if:badan_hukum_sendiri,YA', 'string', 'regex:/^[0-9.\-]{15,25}$/'],
            'no_akta'             => ['nullable', 'string', 'max:60'],
            'kd_provinsi'         => ['nullable', 'string', 'max:30'],
            'kd_kabupaten_kota'   => ['nullable', 'string', 'max:30'],
            'kd_kecamatan'        => ['nullable', 'string', 'max:30'],
            'mode_desa'           => ['nullable', 'in:PILIH,MANUAL'],
            'kd_village'          => ['nullable', 'string', 'max:30'],
            'nama_desa_manual'    => ['nullable', 'string', 'max:150'],
            'alamat_rinci'        => ['nullable', 'string', 'max:500'],
            'kode_pos'            => ['nullable', 'regex:/^[0-9]{5}$/'],
            'telepon'             => ['nullable', 'string', 'regex:/^[0-9+\-\s()]{6,30}$/'],
            'email'               => ['nullable', 'email', 'max:150'],
            'tgl_berdiri'         => ['nullable', 'date'],
        ];

        if ($baru) {
            $rules['kd_tipe_perusahaan']    = ['required', 'string', 'exists:master_tipe_perusahaan,kd_tipe_perusahaan'];
            $rules['kd_induk']              = ['nullable', 'string', 'exists:master_perusahaan,kd_perusahaan'];
        } else {
            $rules['konfirmasi_hapus_legal']    = ['nullable', 'boolean'];
            $rules['tgl_berlaku']               = ['nullable', 'date'];
            $rules['alasan']                    = ['nullable', 'string', 'max:500'];
            $rules['kd_tipe_perusahaan']        = ['nullable', 'string', 'exists:master_tipe_perusahaan,kd_tipe_perusahaan'];
        }

        return $rules;
    }

    private function pesanForm(): array
    {
        return [
            'kode_cabang.required'            => 'Kode cabang tidak boleh kosong',
            'kode_cabang.regex'               => 'Kode cabang hanya boleh huruf, angka, dan tanda hubung',
            'kode_cabang.max'                 => 'Kode cabang maksimal 30 karakter',
            'nama.required'                   => 'Nama tidak boleh kosong',
            'nama_badan_hukum.required_if'    => 'Nama badan hukum wajib diisi',
            'npwp.required_if'                => 'NPWP wajib diisi untuk badan hukum',
            'npwp.regex'                      => 'Format NPWP tidak valid',
            'kd_tipe_perusahaan.required'     => 'Tipe harus dipilih',
            'kd_tipe_perusahaan.exists'       => 'Tipe tidak ditemukan',
            'kd_induk.exists'                 => 'Induk tidak ditemukan',
            'kode_pos.regex'                  => 'Kode pos harus 5 digit',
            'telepon.regex'                   => 'Format telepon tidak valid',
            'email.email'                     => 'Format email tidak valid',
        ];
    }

    public function index(Request $request)
    {
        return $this->execute($request, 'daftarPerusahaan', [], [], fn() => [
            'status'  => true,
            'message' => 'Data perusahaan berhasil diambil',
            'data'    => $this->service->daftar(),
        ]);
    }

    public function opsiTipe(Request $request)
    {
        return $this->execute($request, 'opsiTipePerusahaan', [], [], fn() => [
            'status'  => true,
            'message' => 'Data tipe berhasil diambil',
            'data'    => $this->service->opsiTipe(),
        ]);
    }

    public function opsiWilayah(Request $request)
    {
        return $this->execute(
            $request,
            'opsiWilayah',
            [
                'level' => ['required', 'in:provinsi,kota,kecamatan,desa'],
                'induk' => ['required_unless:level,provinsi', 'nullable', 'string', 'max:30'],
            ],
            ['induk.required_unless' => 'Pilih wilayah di atasnya terlebih dahulu'],
            fn($v) => [
                'status'  => true,
                'message' => 'Data wilayah berhasil diambil',
                'data'    => $this->service->opsiWilayah($v['level'], $v['induk'] ?? null),
            ],
        );
    }

    public function riwayat(Request $request, string $kd)
    {
        return $this->execute($request, 'riwayatPerusahaan', [], [], function () use ($kd) {
            $data = $this->service->riwayat($kd);

            return $data === null
                ? ['status' => false, 'code' => 404, 'message' => 'Perusahaan tidak ditemukan']
                : ['status' => true, 'message' => 'Riwayat berhasil diambil', 'data' => $data];
        });
    }

    public function store(Request $request)
    {
        return $this->execute(
            $request,
            'buatPerusahaan',
            $this->aturanForm(true),
            $this->pesanForm(),
            fn($v, $actor) => $this->service->buat($v, $actor)
        );
    }

    public function update(Request $request, string $kd)
    {
        return $this->execute(
            $request,
            'ubahPerusahaan',
            $this->aturanForm(false),
            $this->pesanForm(),
            fn($v, $actor) => $this->service->ubah($kd, $v, $actor)
        );
    }

    public function pindah(Request $request, string $kd)
    {
        return $this->execute(
            $request,
            'pindahPerusahaan',
            [
                'kd_induk'    => ['required', 'string', 'exists:master_perusahaan,kd_perusahaan'],
                'tgl_berlaku' => ['required', 'date'],
                'alasan'      => ['nullable', 'string', 'max:500'],
            ],
            ['kd_induk.required' => 'Induk baru harus dipilih', 'kd_induk.exists' => 'Induk baru tidak ditemukan'],
            fn($v, $actor) => $this->service->pindah($kd, $v, $actor)
        );
    }

    public function nonaktifkan(Request $request, string $kd)
    {
        return $this->execute(
            $request,
            'nonaktifkanPerusahaan',
            [
                'tgl_berlaku' => ['required', 'date'],
                'alasan'      => ['required', 'string', 'min:5', 'max:500'],
            ],
            ['alasan.required' => 'Alasan wajib diisi', 'alasan.min' => 'Alasan minimal 5 karakter'],
            fn($v, $actor) => $this->service->ubahStatus($kd, false, $v, $actor)
        );
    }

    public function aktifkan(Request $request, string $kd)
    {
        return $this->execute(
            $request,
            'aktifkanPerusahaan',
            [
                'tgl_berlaku' => ['required', 'date'],
                'alasan'      => ['nullable', 'string', 'max:500'],
            ],
            [],
            fn($v, $actor) => $this->service->ubahStatus($kd, true, $v, $actor)
        );
    }

    public function hapus(Request $request, string $kd)
    {
        return $this->execute(
            $request,
            'hapusPerusahaan',
            ['konfirmasi_nama' => ['required', 'string', 'max:150']],
            ['konfirmasi_nama.required' => 'Ketik nama untuk konfirmasi'],
            fn($v, $actor) => $this->service->hapus($kd, $v['konfirmasi_nama'], $actor)
        );
    }
}
