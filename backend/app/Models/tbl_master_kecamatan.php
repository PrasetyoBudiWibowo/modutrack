<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class tbl_master_kecamatan extends Model
{
    protected $table = 'tbl_master_kecamatan';
    protected $primaryKey = 'kd_kecamatan';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'kd_kecamatan',
        'id_kecamatan',
        'kd_kabupaten_kota',
        'regency_id',
        'nama_kecamatan',
        'status_tampil',
        'tgl_input',
        'bln_input',
        'thn_input',
        'waktu_input',
        'user_input',
        'alamat_device',
        'type_device',
        'device',
    ];

    public function kabupatenKota()
    {
        return $this->belongsTo(tbl_master_kabupaten_kota::class, 'kd_kabupaten_kota', 'kd_kabupaten_kota');
    }
}
