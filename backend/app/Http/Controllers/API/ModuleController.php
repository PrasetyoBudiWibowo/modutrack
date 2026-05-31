<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Helper\AppLogger;
use App\Service\ModuleService;
use App\Service\AuthService;

class ModuleController extends Controller
{
    protected $moduleService;
    protected $authService;

    public function __construct(
        ModuleService $moduleService,
        AuthService $authService
    ) {
        $this->moduleService = $moduleService;
        $this->authService   = $authService;
    }

    public function getAllModule()
    {
        $data = $this->moduleService->getAllModule();

        return response()->json([
            'status'  => true,
            'message' => 'Data module berhasil diambil',
            'data'    => $data,
        ]);
    }

    public function createModule(Request $request)
    {
        $log = AppLogger::getLogger('createModule');

        try {
            $validateUser = $this->authService->validateUser($request);

            if (!$validateUser['status']) {
                return response()->json([
                    'status'  => false,
                    'message' => $validateUser['message'],
                ], $validateUser['code']);
            }

            $request->validate([
                'nama_module' => 'required|string|max:100',
                'icon_module' => 'nullable|string|max:50',
                'url_module'  => 'nullable|string|max:100',
                'urutan'      => 'nullable|integer|min:0',
            ], [
                'nama_module.required' => 'Nama module tidak boleh kosong',
                'nama_module.max'      => 'Nama module maksimal 100 karakter',
                'urutan.integer'       => 'Urutan harus berupa angka',
                'urutan.min'           => 'Urutan minimal 0',
            ]);

            $result = $this->moduleService->createModule(
                $request->all(),
                $validateUser['user']->user_name
            );

            if (!$result['status']) {
                return response()->json([
                    'status'  => false,
                    'message' => $result['message'],
                ], 500);
            }

            return response()->json([
                'status'  => true,
                'message' => $result['message'],
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => false,
                'errors' => $e->errors(),
            ], 422);
        } catch (\Throwable $th) {
            $log->error($th->getMessage());

            return response()->json([
                'status'  => false,
                'message' => 'Terjadi kesalahan pada server',
            ], 500);
        }
    }

    public function toggleStatusModule(Request $request, string $kdModule)
    {
        $log = AppLogger::getLogger('toggleStatusModule');

        try {
            $validateUser = $this->authService->validateUser($request);

            if (!$validateUser['status']) {
                return response()->json([
                    'status'  => false,
                    'message' => $validateUser['message'],
                ], $validateUser['code']);
            }

            $result = $this->moduleService->toggleStatusModule(
                $kdModule,
                $validateUser['user']->user_name
            );

            if (!$result['status']) {
                return response()->json([
                    'status'  => false,
                    'message' => $result['message'],
                ], 404);
            }

            return response()->json([
                'status'  => true,
                'message' => $result['message'],
            ]);
        } catch (\Throwable $th) {
            $log->error($th->getMessage());

            return response()->json([
                'status'  => false,
                'message' => 'Terjadi kesalahan pada server',
            ], 500);
        }
    }
}
