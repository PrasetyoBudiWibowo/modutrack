<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MasterJenisRiwayatPerusahaan extends Model
{
    protected $table = 'master_jenis_riwayat_perusahaan';
    protected $primaryKey = 'kd_jenis_riwayat';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'kd_jenis_riwayat',
        'kode',
        'nama',
        'keterangan',
        'otomatis',
        'status',
        'tgl_input',
        'waktu_input',
        'user_input',
        'alamat_device',
        'type_device',
        'device',
    ];
}
