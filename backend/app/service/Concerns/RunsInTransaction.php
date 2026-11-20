<?php

namespace App\Service\Concerns;

use Closure;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

trait RunsInTransaction
{
    protected function gagal(string $pesan, int $kode = 422): never
    {
        throw new \DomainException($pesan, $kode);
    }

    protected function pastikan(mixed $kondisi, string $pesan, int $kode = 422): void
    {
        if (!$kondisi) {
            $this->gagal($pesan, $kode);
        }
    }

    protected function transaksi(string $label, Closure $aksi, array $pesanUnik = []): array
    {
        try {
            $hasil = DB::transaction($aksi);

            return ['status' => true] + $hasil;
        } catch (\DomainException $e) {
            return ['status' => false, 'code' => $e->getCode() ?: 422, 'message' => $e->getMessage()];
        } catch (UniqueConstraintViolationException $e) {
            foreach ($pesanUnik as $fragmen => $pesan) {
                if (str_contains($e->getMessage(), $fragmen)) {
                    return ['status' => false, 'code' => 422, 'message' => $pesan];
                }
            }

            Log::error("$label gagal: " . $e->getMessage());

            return ['status' => false, 'code' => 500, 'message' => 'Terjadi kesalahan saat menyimpan data'];
        } catch (\Throwable $e) {
            Log::error("$label gagal: " . $e->getMessage());

            return ['status' => false, 'code' => 500, 'message' => 'Terjadi kesalahan saat memproses data'];
        }
    }
}
