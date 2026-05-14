<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Service\WilayahService;
use App\Service\AuthService;

use App\Helper\AppLogger;

class WilayahController extends Controller
{
    protected $wilayahService;
    protected $authService;

    public function __construct(
        WilayahService $wilayahService,
        AuthService $authService
    ) {
        $this->wilayahService = $wilayahService;
        $this->authService = $authService;
    }

    public function provinsiGetAll()
    {
        $data = $this->wilayahService->provinsiGetAll();

        return response()->json([
            'status' => true,
            'message' => 'Data provinsi berhasil diambil',
            'data' => $data
        ]);
    }

    public function syncProvinsi(Request $request)
    {
        $log = AppLogger::getLogger('syncProvinsi');

        $validateUser = $this->authService
            ->validateUser($request);

        if (!$validateUser['status']) {

            return response()->json([
                'status' => false,
                'message' => $validateUser['message']
            ], $validateUser['code']);
        }

        $data = $request->data;

        if (!is_array($data) || count($data) <= 0) {

            return response()->json([
                'status' => false,
                'message' => 'Data provinsi kosong'
            ], 422);
        }

        $dataToSave = [];

        foreach ($data as $item) {
            $dataToSave[] = [
                'id_provinsi'   => $item['id'],
                'nama_provinsi' => $item['name'],
                'user_input'    => $validateUser['user']->user_name ?? 'SYSTEM',
            ];
        }

        $this->wilayahService->syncProvinsi($dataToSave);

        return response()->json([
            'status' => true,
            'message' => 'Data provinsi berhasil disimpan'
        ]);
    }
}
