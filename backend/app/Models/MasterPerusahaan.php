<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MasterPerusahaan extends Model
{
    protected $table = 'master_perusahaan';
    protected $primaryKey = 'kd_perusahaan';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
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
        'tgl_input',
        'waktu_input',
        'user_input',
        'alamat_device',
        'type_device',
        'device',
    ];

    public function tipe()
    {
        return $this->belongsTo(MasterTipePerusahaan::class, 'kd_tipe_perusahaan', 'kd_tipe_perusahaan');
    }

    public function induk()
    {
        return $this->belongsTo(MasterPerusahaan::class, 'kd_induk', 'kd_perusahaan');
    }

    public function anak()
    {
        return $this->hasMany(MasterPerusahaan::class, 'kd_induk', 'kd_perusahaan');
    }

    public function riwayat()
    {
        return $this->hasMany(RiwayatPerusahaan::class, 'kd_perusahaan', 'kd_perusahaan');
    }
}
