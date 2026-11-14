<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
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
                $request->user()->user_name
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
        } catch (ValidationException $e) {
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

            $result = $this->moduleService->toggleStatusModule(
                $kdModule,
                $request->user()->user_name
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

    public function updateModule(Request $request, string $kdModule)
    {
        $log = AppLogger::getLogger('updateModule');

        try {

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

            $result = $this->moduleService->updateModule($kdModule, $request->all());

            if (!$result['status']) {
                return response()->json([
                    'status'  => false,
                    'message' => $result['message'],
                ], $result['code'] ?? 500);
            }

            return response()->json([
                'status'  => true,
                'message' => $result['message'],
            ]);
        } catch (ValidationException $e) {
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
}
