<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Crypt;
use Carbon\Carbon;

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
            $validator = Validator::make($request->all(), [
                'user_name' => ['required', 'regex:/^[A-Za-z\s]+$/', 'max:100'],
                'password'  => ['required', 'string', 'max:255'],
            ], [
                'user_name.required' => 'User name tidak boleh kosong',
                'user_name.regex'    => 'User name hanya boleh mengandung huruf dan spasi',
                'password.required'  => 'Password tidak boleh kosong',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'fail',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $result = $this->authService->login($validator->validated());

            if (!$result['status']) {
                $log->warning('Login gagal: ' . $request->input('user_name') . ' | IP ' . $request->ip());

                return response()->json([
                    'status'  => 'fail',
                    'message' => $result['message'],
                ], $result['code'] ?? 401);
            }

            $userModel = $result['user_model'];

            $userModel->tokens()->delete();

            $tokenResult = $userModel->createToken('auth_token');

            $tokenResult->accessToken->forceFill([
                'last_activity' => now(),
            ])->save();

            return response()->json([
                'status'  => 'success',
                'message' => 'Login berhasil',
                'token'   => $tokenResult->plainTextToken,
                'user'    => $result['data'],
            ]);
        } catch (\Throwable $th) {
            $log->error($th->getMessage());

            return response()->json([
                'status'  => 'error',
                'message' => 'Terjadi kesalahan pada server',
            ], 500);
        }
    }

    public function checkSession(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'status' => 'unauthenticated'
            ], 401);
        }

        $token = $user->currentAccessToken();
        $lastActivity = null;
        $inactiveSeconds = null;

        if ($token && $token->last_activity) {
            $lastActivity = Carbon::parse($token->last_activity)->timezone('Asia/Jakarta');
            $now = Carbon::now('Asia/Jakarta');
            $inactiveSeconds = $lastActivity->diffInSeconds($now);

            if ($user->level_user_id == 1) {
                if (!$lastActivity->isSameDay($now)) {
                    $user->tokens()->delete();

                    return response()->json([
                        'status'  => 'unauthenticated',
                        'message' => 'Session expired, silakan login kembali',
                    ], 401);
                }
            } else {
                // USER BIASA: timeout 30 menit
                $timeoutMinutes = 30;

                if ($inactiveSeconds >= ($timeoutMinutes * 60)) {
                    $user->tokens()->delete();

                    return response()->json([
                        'status'  => 'unauthenticated',
                        'message' => 'Session expired',
                    ], 401);
                }
            }
        }

        return response()->json([
            'status' => 'authenticated',
            'user' => [
                'user_name'       => $user->user_name,
                'img_user'        => $user->img_user,
                'format_img_user' => $user->format_img_user,
                'status_user'     => $user->status_user,
                'blokir'          => $user->blokir,
            ],
            'last_activity' => $lastActivity,
            'now'           => now(),
            'inactive'      => $inactiveSeconds,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Logout berhasil'
        ]);
    }
}
