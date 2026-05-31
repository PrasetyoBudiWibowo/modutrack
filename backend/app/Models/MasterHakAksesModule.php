<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MasterHakAksesModule extends Model
{
    protected $table = 'master_hak_akses_module';
    protected $primaryKey = 'kd_hak_akses_module';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'kd_hak_akses_module',
        'kd_user',
        'kd_module',
        'status_akses',
        'tgl_input',
        'bln_input',
        'thn_input',
        'waktu_input',
        'user_input',
    ];

    public function user()
    {
        return $this->belongsTo(tbl_user::class, 'kd_user', 'kd_user');
    }

    public function module()
    {
        return $this->belongsTo(MasterModule::class, 'kd_module', 'kd_module');
    }
}
