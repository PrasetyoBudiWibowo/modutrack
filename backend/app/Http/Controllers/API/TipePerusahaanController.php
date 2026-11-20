<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\API\Concerns\RespondsWithService;
use App\Http\Controllers\Controller;
use App\Service\TipePerusahaanService;
use Illuminate\Http\Request;

class TipePerusahaanController extends Controller
{
    use RespondsWithService;

    public function __construct(protected TipePerusahaanService $service) {}

    private function aturan(): array
    {
        return [
            'nama'              => ['required', 'string', 'max:100'],
            'boleh_badan_hukum' => ['required', 'in:YA,TIDAK'],
        ];
    }

    private function pesan(): array
    {
        return [
            'nama.required'              => 'Nama tipe tidak boleh kosong',
            'nama.max'                   => 'Nama tipe maksimal 100 karakter',
            'boleh_badan_hukum.required' => 'Pilih apakah tipe ini boleh berbadan hukum',
            'boleh_badan_hukum.in'       => 'Pilihan badan hukum tidak valid',
        ];
    }

    public function index(Request $request)
    {
        return $this->execute($request, 'daftarTipePerusahaan', [], [], fn() => [
            'status'  => true,
            'message' => 'Data tipe berhasil diambil',
            'data'    => $this->service->daftar(),
        ]);
    }

    public function store(Request $request)
    {
        return $this->execute(
            $request,
            'buatTipePerusahaan',
            $this->aturan(),
            $this->pesan(),
            fn($v, $actor) => $this->service->buat($v, $actor)
        );
    }

    public function update(Request $request, string $kd)
    {
        return $this->execute(
            $request,
            'ubahTipePerusahaan',
            $this->aturan(),
            $this->pesan(),
            fn($v, $actor) => $this->service->ubah($kd, $v, $actor)
        );
    }

    public function toggleStatus(Request $request, string $kd)
    {
        return $this->execute(
            $request,
            'toggleTipePerusahaan',
            [],
            [],
            fn() => $this->service->toggleStatus($kd)
        );
    }
}
