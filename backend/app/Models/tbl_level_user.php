<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class tbl_level_user extends Model
{
    use HasFactory;

    protected $table = 'tbl_level_user';

    protected $primaryKey = 'id';

    public $incrementing = false;

    protected $keyType = 'int';

    public $timestamps = false;

    protected $fillable = [
        'id',
        'level_user',
    ];
}
