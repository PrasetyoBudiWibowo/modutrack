<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Crypt;

use App\Helper\AppLogger;

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
        $log = AppLogger::getLogger('VALIDASI LOGIN');
        try {
            if (!$request->isMethod('post')) {
                return response()->json([
                    'status' => 'error',
                    'message' => "Metode request tidak valid di auth_login"
                ], 405);
            }

            $log->info("<=== LOLOS TAHAP 1 =====>");

            $validator = Validator::make($request->all(), [
                'user_name' => ['required', 'regex:/^[A-Za-z\s]+$/'],
                'password'  => 'required'
            ], [
                'user_name.required' => 'User name tidak boleh kosong',
                'user_name.regex'    => 'User name hanya boleh mengandung huruf dan spasi',
                'password.required'  => 'Password tidak boleh kosong'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'fail',
                    'errors' => $validator->errors()
                ], 422);
            }

            $log->info("<=== LOLOS TAHAP 2 =====>");

            $result = $this->authService->login($request->all());

            if (!$result['status']) {
                return response()->json([
                    'status' => 'fail',
                    'message' => $result['message']
                ]);
            }

            $log->info("<=== LOLOS TAHAP 3 =====>");

            $user = $result['data'];

            session([
                'user' => [
                    'kd_user' => $user['kd_user'],
                    'user_name' => $user['user_name'],
                    'level_user_id' => $user['level_user_id'],
                    'level_user' => $user['level_user'][0]['level_user'] ?? 'Unknown',
                    'img_user' => $user['img_user'],
                    'format_img_user' => $user['format_img_user'],
                    'status_user' => $user['status_user'],
                    'blokir' => $user['blokir'],
                ],
                'user_logged_in' => true
            ]);

            $log->info("<=== BERHASIL LOGIN =====>");

            return response()->json([
                'status' => 'success',
                'message' => 'Login berhasil',
                'user' => $user,
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => $th->getMessage(),
            ], 500);
        }
    }

    public function checkSession()
    {
        if (!session('user_logged_in') || !session('user')) {
            return response()->json([
                'status' => 'unauthenticated',
                'message' => 'Belum login'
            ], 401);
        }

        return response()->json([
            'status' => 'authenticated',
            'user' => session('user')
        ]);
    }

    public function logout()
    {
        session()->flush();

        return response()->json([
            'status' => 'success',
            'message' => 'Logout berhasil'
        ]);
    }
}
