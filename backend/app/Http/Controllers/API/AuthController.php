<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Service\AuthService;

class AuthController extends Controller
{
    protected $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    public function getLevelUser()
    {
        $data = $this->authService->allLevelUser();

        return response()->json([
            'status' => true,
            'message' => 'success',
            'data' => $data
        ]);
    }

    public function register(Request $request)
    {
        $request->validate([
            'user_name' => [
                'required',
                'regex:/^[A-Za-z]/',
                'unique:tbl_user,user_name'
            ],
            'password' => [
                'required',
            ],
            'level_user_id' => [
                'required',
                'exists:tbl_level_user,id'
            ]
        ], [
            'user_name.required' => 'User name tidak boleh kosong',
            'user_name.regex' => 'User name hanya boleh huruf tanpa spasi atau karakter khusus',
            'user_name.unique' => 'User name sudah digunakan',

            'password.required' => 'Password tidak boleh kosong',
            'password.min' => 'Password minimal 6 karakter',

            'level_user_id.required' => 'Level user harus dipilih',
            'level_user_id.exists' => 'Level user tidak valid'
        ]);

        $result = $this->authService->register($request->all());

        return response()->json($result);
    }


    public function login(Request $request)
    {
        $request->validate([
            'user_name' => 'required',
            'password' => 'required'
        ]);

        return response()->json([
            'message' => 'Validasi berhasil',
            'data' => $request->all()
        ]);
    }
}
