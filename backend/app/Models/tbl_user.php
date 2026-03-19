<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class tbl_user extends Model
{
    protected $table = 'tbl_user';

    protected $primaryKey = 'kd_user';
    public $incrementing = false;
    protected $keyType = 'string';

    public $timestamps = false;

    protected $fillable = [
        'kd_user',
        'user_name',
        'password',
        'status_user',
        'blokir',
        'level_user_id',
        'tgl_input',
        'waktu_input'
    ];
}
