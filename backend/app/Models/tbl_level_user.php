<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class tbl_level_user extends Model
{
    protected $table = 'tbl_level_user';

    protected $fillable = [
        'level_user'
    ];

    public $timestamps = false;
}
