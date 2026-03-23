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
        'password_tampil',
        'status_user',
        'blokir',
        'level_user_id',
        'tgl_input',
        'waktu_input',
        'email',
        'tgl_login_terakhir',
        'waktu_login_terakhir',
    ];

    public function level()
    {
        return $this->belongsTo(tbl_level_user::class, 'level_user_id', 'id');
    }
}
