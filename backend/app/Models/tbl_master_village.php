<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class tbl_master_village extends Model
{
    protected $table = 'tbl_master_village';
    protected $primaryKey = 'kd_village';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'kd_village',
        'id_village',
        'kd_kecamatan',
        'district_id',
        'nama_village',
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

    public function kecamatan()
    {
        return $this->belongsTo(tbl_master_kecamatan::class, 'kd_kecamatan', 'kd_kecamatan');
    }
}