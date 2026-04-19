<?php

namespace App\Service;

use App\Models\tbl_user;
use App\Models\tbl_level_user;
use App\Models\tbl_history_login;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Crypt;
use Carbon\Carbon;

use App\Helper\AppLogger;
use App\Helper\GeoDetector;
use App\Helper\DeviceHelper;

class UserService
{
    public function allDataUser()
    {
        $user = tbl_user::with('level')
            ->get();

        return $user;
    }
}
