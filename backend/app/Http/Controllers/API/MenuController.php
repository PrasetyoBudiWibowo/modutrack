<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Helper\AppLogger;
use App\Service\MenuService;
use App\Service\AuthService;

class MenuController extends Controller
{
    protected $menuService;
    protected $authService;

    public function __construct(
        MenuService $menuService,
        AuthService $authService,
    ) {
        $this->menuService = $menuService;
        $this->authService = $authService;
    }

    public function getAllMenu()
    {
        $data = $this->menuService->getAllMenu();

        return response()->json([
            'status'  => true,
            'message' => 'Data menu berhasil diambil',
            'data'    => $data,
        ]);
    }

    public function getMenuByModule(string $kdModule)
    {
        $data = $this->menuService->getMenuByModule($kdModule);

        return response()->json([
            'status'  => true,
            'message' => 'Data menu berhasil diambil',
            'data'    => $data,
        ]);
    }

    public function createMenu(Request $request)
    {
        $log = AppLogger::getLogger('createMenu');

        try {
            $validateUser = $this->authService->validateUser($request);

            if (!$validateUser['status']) {
                return response()->json([
                    'status'  => false,
                    'message' => $validateUser['message'],
                ], $validateUser['code']);
            }

            $isParent = $request->boolean('is_parent');

            $rules = [
                'kd_module' => 'required|string|exists:master_module,kd_module',
                'nama_menu' => 'required|string|max:100',
                'icon_menu' => 'nullable|string|max:50',
                'urutan'    => 'nullable|integer|min:0',
            ];

            $messages = [
                'kd_module.required' => 'Module harus dipilih',
                'kd_module.exists'   => 'Module tidak ditemukan',
                'nama_menu.required' => 'Nama menu tidak boleh kosong',
                'nama_menu.max'      => 'Nama menu maksimal 100 karakter',
                'urutan.integer'     => 'Urutan harus berupa angka',
                'urutan.min'         => 'Urutan minimal 0',
            ];

            if ($isParent) {
                $rules['icon_menu'] = 'required|string|max:50';
                $messages['icon_menu.required'] = 'Icon wajib diisi untuk parent menu';
            } else {
                $rules['url_menu']    = 'required|string|max:100';
                $rules['parent_menu'] = 'nullable|string|exists:master_menu,kd_menu';
                $messages['url_menu.required']   = 'URL wajib diisi untuk menu';
                $messages['parent_menu.exists']  = 'Parent menu tidak ditemukan';
            }

            $request->validate($rules, $messages);

            $result = $this->menuService->createMenu(
                $request->all(),
                $validateUser['user']->user_name,
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

    public function toggleStatusMenu(Request $request, string $kdMenu)
    {
        $log = AppLogger::getLogger('toggleStatusMenu');

        try {
            $validateUser = $this->authService->validateUser($request);

            if (!$validateUser['status']) {
                return response()->json([
                    'status'  => false,
                    'message' => $validateUser['message'],
                ], $validateUser['code']);
            }

            $result = $this->menuService->toggleStatusMenu($kdMenu);

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
