<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MasterHakAksesMenu extends Model
{
    protected $table = 'master_hak_akses_menu';
    protected $primaryKey = 'kd_hak_akses_menu';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'kd_hak_akses_menu',
        'kd_user',
        'kd_menu',
        'bisa_lihat',
        'bisa_insert',
        'bisa_edit',
        'bisa_hapus',
        'bisa_export',
        'status_akses',
        'tgl_input',
        'bln_input',
        'thn_input',
        'waktu_input',
        'user_input',
        'alamat_device',
        'type_device',
        'device',
    ];

    public function user()
    {
        return $this->belongsTo(tbl_user::class, 'kd_user', 'kd_user');
    }

    public function menu()
    {
        return $this->belongsTo(MasterMenu::class, 'kd_menu', 'kd_menu');
    }
}
