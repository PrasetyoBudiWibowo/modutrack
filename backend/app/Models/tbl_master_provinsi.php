<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class tbl_master_provinsi extends Model
{
    protected $table = 'tbl_master_provinsi';

    protected $primaryKey = 'kd_provinsi';

    public $incrementing = false;

    protected $keyType = 'string';

    public $timestamps = false;

    protected $fillable = [
        'kd_provinsi',
        'id_provinsi',
        'nama_provinsi',
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
}
