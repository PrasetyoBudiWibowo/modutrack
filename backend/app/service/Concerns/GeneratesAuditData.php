<?php

namespace App\Service\Concerns;

use App\Helper\DeviceHelper;

trait GeneratesAuditData
{
    protected function nextCode(string $model, string $column, string $prefix): string
    {
        $prefix = $prefix . '-' . now()->format('Ym') . '-';

        $last = $model::where($column, 'LIKE', $prefix . '%')
            ->lockForUpdate()
            ->orderBy($column, 'DESC')
            ->first();

        $number = $last ? intval(substr($last->$column, -4)) + 1 : 0;

        return $prefix . str_pad($number, 4, '0', STR_PAD_LEFT);
    }

    protected function auditFields(string $userName): array
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

    protected function deviceFields(): array
    {
        $info = DeviceHelper::detectDevice($_SERVER['HTTP_USER_AGENT'] ?? null);

        return [
            'alamat_device' => request()->ip(),
            'type_device'   => $info['deviceType'] ?? 'UNKNOWN',
            'device'        => $info['browser'] ?? 'Tidak Diketahui',
        ];
    }
}
