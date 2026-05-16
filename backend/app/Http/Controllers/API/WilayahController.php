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

        try {
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
        } catch (\Throwable $th) {
            $log->error($th->getMessage());

            return response()->json([
                'status' => false,
                'message' => 'Terjadi kesalahan pada server'
            ], 500);
        }
    }

    public function syncKotaKabupaten(Request $request)
    {
        $log = AppLogger::getLogger('syncKotaKabupaten');

        try {
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
                    'message' => 'Data Kabupate Kota kosong'
                ], 422);
            }

            $data = $request->data;

            if (!is_array($data) || count($data) <= 0) {

                return response()->json([
                    'status' => false,
                    'message' => 'Data Kabupate Kota kosong'
                ], 422);
            }

            $dataToSave = [];

            foreach ($data as $item) {
                $dataToSave[] = [
                    'id_kabupaten_kota'   => $item['id'],
                    'nama_kabupaten_kota' => $item['name'],
                    'province_id' => $item['province_id'],
                    'user_input'    => $validateUser['user']->user_name ?? 'SYSTEM',
                ];
            }

            // $log->info("Data: " . json_encode($dataToSave));

            $this->wilayahService->syncKotaKabupaten($dataToSave);

            return response()->json([
                'status' => true,
                'message' => 'Data Kabupaten/Kota berhasil disimpan'
            ]);
        } catch (\Throwable $th) {
            $log->error($th->getMessage());

            return response()->json([
                'status' => false,
                'message' => 'Terjadi kesalahan pada server'
            ], 500);
        }
    }

    public function syncKecamatan(Request $request)
    {
        $log = AppLogger::getLogger('syncKecamatan');
        try {
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
                    'id_kecamatan'   => $item['id'],
                    'nama_kecamatan' => $item['name'],
                    'regency_id' => $item['regency_id'],
                    'user_input'    => $validateUser['user']->user_name ?? 'SYSTEM',
                ];
            }


            $this->wilayahService->syncKecamatan($dataToSave);

            return response()->json([
                'status' => true,
                'message' => 'Data Kabupaten/Kota berhasil disimpan'
            ]);
        } catch (\Throwable $th) {
            $log->error($th->getMessage());

            return response()->json([
                'status' => false,
                'message' => 'Terjadi kesalahan pada server'
            ], 500);
        }
    }
}
