<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserBlokir extends Model
{
    protected $table = 'tbl_user_blokir';
    protected $primaryKey = 'kd_blokir';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'kd_blokir',
        'kd_user',
        'jenis',
        'alasan',
        'mulai_at',
        'selesai_at',
        'status',
        'dicabut_at',
        'dicabut_oleh',
        'alasan_cabut',
        'tgl_input',
        'bln_input',
        'thn_input',
        'waktu_input',
        'user_input',
        'alamat_device',
        'type_device',
        'device',
    ];

    protected $casts = [
        'mulai_at'   => 'datetime',
        'selesai_at' => 'datetime',
        'dicabut_at' => 'datetime',
    ];
}
