<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MasterTipePerusahaan extends Model
{
    protected $table = 'master_tipe_perusahaan';
    protected $primaryKey = 'kd_tipe_perusahaan';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'kd_tipe_perusahaan',
        'nama',
        'boleh_badan_hukum',
        'status',
        'tgl_input',
        'waktu_input',
        'user_input',
        'alamat_device',
        'type_device',
        'device',
    ];

    public function perusahaan()
    {
        return $this->hasMany(MasterPerusahaan::class, 'kd_tipe_perusahaan', 'kd_tipe_perusahaan');
    }
}
