<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class tbl_master_kabupaten_kota extends Model
{
    protected $table = 'tbl_master_kabupaten_kota';
    protected $primaryKey = 'kd_kabupaten_kota';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'kd_kabupaten_kota',
        'id_kabupaten_kota',
        'kd_provinsi',
        'nama_kabupaten_kota',
        'status_tampil',
        'tgl_input',
        'bln_input',
        'thn_input',
        'waktu_input',
        'user_input',
        'alamat_device',
        'type_device',
        'device',
        'province_id',
    ];

    public function provinsi()
    {
        return $this->belongsTo(tbl_master_provinsi::class, 'kd_provinsi', 'kd_provinsi');
    }
}
