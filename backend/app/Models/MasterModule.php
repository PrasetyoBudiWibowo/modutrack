<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MasterModule extends Model
{
    protected $table = 'master_module';
    protected $primaryKey = 'kd_module';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'kd_module',
        'nama_module',
        'icon_module',
        'url_module',
        'urutan',
        'status_module',
        'tgl_input',
        'bln_input',
        'thn_input',
        'waktu_input',
        'user_input',
        'alamat_device',
        'type_device',
        'device',
    ];

    public function menu()
    {
        return $this->hasMany(MasterMenu::class, 'kd_module', 'kd_module');
    }

    public function hakAksesModule()
    {
        return $this->hasMany(MasterHakAksesModule::class, 'kd_module', 'kd_module');
    }
}
