<?php

namespace App\Http\Controllers\API;

use App\Helper\AppLogger;
use App\Http\Controllers\Controller;
use App\Service\UserManagementService;
use Closure;
use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Validation\ValidationException;

class UserManagementController extends Controller
{
    public function __construct(protected UserManagementService $service) {}

    private function decryptKdUser(?string $value): ?string
    {
        try {
            return $value ? Crypt::decryptString($value) : null;
        } catch (DecryptException) {
            return null;
        }
    }

    private function handle(Request $request, string $logName, array $rules, array $messages, Closure $action)
    {
        $log = AppLogger::getLogger($logName);

        try {
            $validated = $request->validate($rules, $messages);
            $kdUser    = $this->decryptKdUser($validated['kd_user']);

            if (!$kdUser) {
                return response()->json(['status' => false, 'message' => 'User tidak valid'], 422);
            }

            $result = $action($kdUser, $validated, $request->user());

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

    public function listUsers(Request $request)
    {
        return response()->json([
            'status'  => true,
            'message' => 'Data user berhasil diambil',
            'data'    => $this->service->listUsers($request->user()),
        ]);
    }

    public function levels()
    {
        return response()->json([
            'status'  => true,
            'message' => 'Data level berhasil diambil',
            'data'    => $this->service->listLevels(),
        ]);
    }

    public function nonaktifkan(Request $request)
    {
        return $this->handle(
            $request,
            'nonaktifkanUser',
            ['kd_user' => ['required', 'string', 'max:1000']],
            [],
            fn($kd, $v, $actor) => $this->service->setStatus($kd, false, $actor),
        );
    }

    public function aktifkan(Request $request)
    {
        return $this->handle(
            $request,
            'aktifkanUser',
            ['kd_user' => ['required', 'string', 'max:1000']],
            [],
            fn($kd, $v, $actor) => $this->service->setStatus($kd, true, $actor),
        );
    }

    public function blokir(Request $request)
    {
        return $this->handle(
            $request,
            'blokirUser',
            [
                'kd_user'    => ['required', 'string', 'max:1000'],
                'jenis'      => ['required', 'in:SEMENTARA,PERMANEN'],
                'selesai_at' => ['required_if:jenis,SEMENTARA', 'nullable', 'date', 'after:now', 'before:+1 year'],
                'alasan'     => ['required', 'string', 'min:5', 'max:500'],
            ],
            [
                'jenis.in'                => 'Jenis blokir tidak valid',
                'selesai_at.required_if'  => 'Tanggal berakhir wajib diisi untuk suspend',
                'selesai_at.after'        => 'Tanggal berakhir harus di masa depan',
                'selesai_at.before'       => 'Suspend maksimal 1 tahun, gunakan blokir permanen untuk lebih lama',
                'alasan.required'         => 'Alasan wajib diisi',
                'alasan.min'              => 'Alasan minimal 5 karakter',
            ],
            fn($kd, $v, $actor) => $this->service->blokir($kd, $v, $actor),
        );
    }

    public function cabutBlokir(Request $request)
    {
        return $this->handle(
            $request,
            'cabutBlokirUser',
            [
                'kd_user' => ['required', 'string', 'max:1000'],
                'alasan'  => ['required', 'string', 'min:5', 'max:500'],
            ],
            ['alasan.required' => 'Alasan pencabutan wajib diisi', 'alasan.min' => 'Alasan minimal 5 karakter'],
            fn($kd, $v, $actor) => $this->service->cabutBlokir($kd, $v['alasan'], $actor),
        );
    }

    public function riwayat(Request $request)
    {
        $kdUser = $this->decryptKdUser($request->query('kd_user'));

        if (!$kdUser) {
            return response()->json(['status' => false, 'message' => 'User tidak valid'], 422);
        }

        $data = $this->service->riwayat($kdUser);

        if ($data === null) {
            return response()->json(['status' => false, 'message' => 'User tidak ditemukan'], 404);
        }

        return response()->json(['status' => true, 'message' => 'Riwayat berhasil diambil', 'data' => $data]);
    }

    public function ubah(Request $request)
    {
        return $this->handle(
            $request,
            'ubahUser',
            [
                'kd_user'       => ['required', 'string', 'max:1000'],
                'level_user_id' => ['nullable', 'integer', 'not_in:1', 'exists:tbl_level_user,id'],
                'password'      => ['nullable', 'string', 'min:8', 'max:72', 'confirmed'],
                'foto'          => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
                'hapus_foto'    => ['nullable', 'boolean'],
            ],
            [
                'level_user_id.not_in'  => 'Level super admin tidak dapat diberikan dari halaman ini',
                'level_user_id.exists'  => 'Level tidak ditemukan',
                'password.min'          => 'Password minimal 8 karakter',
                'password.confirmed'    => 'Konfirmasi password tidak cocok',
                'foto.mimes'            => 'Foto harus berformat JPG, PNG, atau WEBP',
                'foto.max'              => 'Ukuran foto maksimal 2 MB',
            ],
            fn($kd, $v, $actor) => $this->service->updateUser($kd, $v, $actor),
        );
    }
}
