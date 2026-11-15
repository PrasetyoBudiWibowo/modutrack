<?php

namespace App\Http\Controllers\API;

use App\Helper\AppLogger;
use App\Http\Controllers\Controller;
use App\Service\AksesService;
use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Validation\ValidationException;

class AksesController extends Controller
{
    public function __construct(protected AksesService $aksesService) {}

    private function decryptKdUser(?string $value): ?string
    {
        try {
            return $value ? Crypt::decryptString($value) : null;
        } catch (DecryptException) {
            return null;
        }
    }

    public function myModules(Request $request)
    {
        return response()->json([
            'status'  => true,
            'message' => 'Data module berhasil diambil',
            'data'    => $this->aksesService->getMyModules($request->user()),
        ]);
    }

    public function listUsers()
    {
        return response()->json([
            'status'  => true,
            'message' => 'Data user berhasil diambil',
            'data'    => $this->aksesService->listUsers(),
        ]);
    }

    public function getUserAkses(Request $request)
    {
        $kdUser = $this->decryptKdUser($request->query('kd_user'));

        if (!$kdUser) {
            return response()->json(['status' => false, 'message' => 'User tidak valid'], 422);
        }

        $data = $this->aksesService->getUserAkses($kdUser);

        if (!$data) {
            return response()->json(['status' => false, 'message' => 'User tidak ditemukan'], 404);
        }

        return response()->json([
            'status'  => true,
            'message' => 'Data hak akses berhasil diambil',
            'data'    => $data,
        ]);
    }

    public function saveUserAkses(Request $request)
    {
        $log = AppLogger::getLogger('saveUserAkses');

        try {
            $validated = $request->validate([
                'kd_user'                         => ['required', 'string', 'max:1000'],
                'modules'                         => ['required', 'array', 'max:200'],
                'modules.*.kd_module'             => ['required', 'string', 'max:50', 'exists:master_module,kd_module'],
                'modules.*.akses'                 => ['required', 'boolean'],
                'modules.*.menus'                 => ['nullable', 'array', 'max:2000'],
                'modules.*.menus.*.kd_menu'       => ['required', 'string', 'max:50', 'exists:master_menu,kd_menu'],
                'modules.*.menus.*.lihat'         => ['required', 'boolean'],
                'modules.*.menus.*.insert'        => ['required', 'boolean'],
                'modules.*.menus.*.edit'          => ['required', 'boolean'],
                'modules.*.menus.*.hapus'         => ['required', 'boolean'],
                'modules.*.menus.*.export'        => ['required', 'boolean'],
            ]);

            $kdUser = $this->decryptKdUser($validated['kd_user']);

            if (!$kdUser) {
                return response()->json(['status' => false, 'message' => 'User tidak valid'], 422);
            }

            $result = $this->aksesService->saveUserAkses(
                $kdUser,
                $validated['modules'],
                $request->user()->user_name
            );

            if (!$result['status']) {
                return response()->json([
                    'status'  => false,
                    'message' => $result['message'],
                ], $result['code'] ?? 500);
            }

            return response()->json(['status' => true, 'message' => $result['message']]);
        } catch (ValidationException $e) {
            return response()->json(['status' => false, 'errors' => $e->errors()], 422);
        } catch (\Throwable $th) {
            $log->error($th->getMessage());

            return response()->json(['status' => false, 'message' => 'Terjadi kesalahan pada server'], 500);
        }
    }
}
