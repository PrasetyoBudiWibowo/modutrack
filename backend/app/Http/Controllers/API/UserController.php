<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Helper\AppLogger;

use App\Service\UserService;

class UserController extends Controller
{
    protected $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    public function getAllUser()
    {
        $data = $this->userService->allDataUser();

        return response()->json([
            'status' => true,
            'message' => 'Data user berhasil diambil',
            'data' => $data
        ]);
    }
}
