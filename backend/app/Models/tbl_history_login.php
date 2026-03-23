<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class tbl_history_login extends Model
{
    protected $table = 'tbl_history_login';

    protected $primaryKey = 'kd_history_login';
    public $incrementing = false;
    protected $keyType = 'string';

    public $timestamps = false;

    protected $fillable = [
        'kd_history_login',
        'kd_user',
        'user_name',
        'tgl_login',
        'waktu_login',
        'alamat_device',
        'type_device',
        'device',
    ];
}
