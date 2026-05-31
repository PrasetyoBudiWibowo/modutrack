<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MasterMenu extends Model
{
    protected $table = 'master_menu';
    protected $primaryKey = 'kd_menu';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'kd_menu',
        'kd_module',
        'parent_menu',
        'nama_menu',
        'icon_menu',
        'url_menu',
        'urutan',
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

    public function module()
    {
        return $this->belongsTo(MasterModule::class, 'kd_module', 'kd_module');
    }

    public function parent()
    {
        return $this->belongsTo(MasterMenu::class, 'parent_menu', 'kd_menu');
    }

    public function children()
    {
        return $this->hasMany(MasterMenu::class, 'parent_menu', 'kd_menu');
    }

    public function hakAksesMenu()
    {
        return $this->hasMany(MasterHakAksesMenu::class, 'kd_menu', 'kd_menu');
    }
}
