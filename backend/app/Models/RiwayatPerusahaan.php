<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RiwayatPerusahaan extends Model
{
    protected $table = 'riwayat_perusahaan';
    protected $primaryKey = 'kd_riwayat_perusahaan';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'kd_riwayat_perusahaan',
        'kd_perusahaan',
        'kd_jenis_riwayat',
        'nilai_lama',
        'nilai_baru',
        'tgl_berlaku',
        'alasan',
        'tgl_input',
        'waktu_input',
        'user_input',
        'alamat_device',
        'type_device',
        'device',
    ];

    protected $casts = [
        'nilai_lama' => 'array',
        'nilai_baru' => 'array',
    ];

    public function jenis()
    {
        return $this->belongsTo(MasterJenisRiwayatPerusahaan::class, 'kd_jenis_riwayat', 'kd_jenis_riwayat');
    }

    public function perusahaan()
    {
        return $this->belongsTo(MasterPerusahaan::class, 'kd_perusahaan', 'kd_perusahaan');
    }
}
