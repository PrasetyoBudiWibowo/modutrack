<?php

namespace App\Service;

use App\Models\tbl_user;
use App\Models\tbl_level_user;
use App\Models\UserBlokir;
use App\Service\Concerns\GeneratesAuditData;
use Carbon\Carbon;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UserManagementService
{
    use GeneratesAuditData;

    private function photoUrl(?string $name, ?string $ext): ?string
    {
        if (!$name || !$ext) {
            return null;
        }

        return asset('storage/user-photos/' . $name . '.' . $ext);
    }

    public function syncExpired(?string $kdUser = null): void
    {
        $query = UserBlokir::where('status', 'AKTIF')
            ->where('jenis', 'SEMENTARA')
            ->where('selesai_at', '<=', now());

        if ($kdUser) {
            $query->where('kd_user', $kdUser);
        }

        $expired = $query->get();

        if ($expired->isEmpty()) {
            return;
        }

        DB::transaction(function () use ($expired) {
            UserBlokir::whereIn('kd_blokir', $expired->pluck('kd_blokir'))
                ->update(['status' => 'BERAKHIR']);

            tbl_user::whereIn('kd_user', $expired->pluck('kd_user'))
                ->update(['blokir' => 'TIDAK']);
        });
    }

    public function blockMessage(string $kdUser): string
    {
        $block = UserBlokir::where('kd_user', $kdUser)->where('status', 'AKTIF')->first();

        if ($block && $block->jenis === 'SEMENTARA' && $block->selesai_at) {
            return 'Akun Anda disuspend sampai '
                . $block->selesai_at->timezone(config('app.timezone'))->format('d/m/Y H:i')
                . '. Hubungi administrator jika ada pertanyaan.';
        }

        return 'Akun Anda diblokir. Hubungi administrator.';
    }

    private function guardTarget(?tbl_user $target, $actor): ?array
    {
        if (!$target) {
            return ['status' => false, 'code' => 404, 'message' => 'User tidak ditemukan'];
        }

        if ($target->kd_user === $actor->kd_user) {
            return ['status' => false, 'code' => 422, 'message' => 'Anda tidak dapat mengubah akun sendiri'];
        }

        if ((int) $target->level_user_id === 1) {
            return ['status' => false, 'code' => 422, 'message' => 'Akun super admin tidak dapat dinonaktifkan atau diblokir'];
        }

        return null;
    }

    public function listLevels()
    {
        return tbl_level_user::where('id', '!=', 1)
            ->orderBy('id')
            ->get(['id', 'level_user']);
    }

    public function listUsers($actor)
    {
        $this->syncExpired();

        $blocks = UserBlokir::where('status', 'AKTIF')->get()->keyBy('kd_user');

        return tbl_user::with('level')->orderBy('user_name')->get()->map(function ($u) use ($blocks, $actor) {
            $b = $blocks->get($u->kd_user);

            return [
                'kd_user'        => Crypt::encryptString($u->kd_user),
                'user_name'      => $u->user_name,
                'level_user_id'  => $u->level_user_id,
                'level_user'     => $u->level->level_user ?? null,
                'status_user'    => $u->status_user,
                'blokir'         => $u->blokir,
                'is_super_admin' => (int) $u->level_user_id === 1,
                'is_self'        => $u->kd_user === $actor->kd_user,
                'login_terakhir' => $u->tgl_login_terakhir
                    ? trim($u->tgl_login_terakhir . ' ' . $u->waktu_login_terakhir)
                    : null,
                'blokir_aktif'   => $b ? [
                    'jenis'      => $b->jenis,
                    'alasan'     => $b->alasan,
                    'mulai_at'   => $b->mulai_at?->toIso8601String(),
                    'selesai_at' => $b->selesai_at?->toIso8601String(),
                ] : null,
                'foto_url' => $this->photoUrl($u->img_user, $u->format_img_user),
            ];
        });
    }

    public function setStatus(string $kdUser, bool $aktif, $actor): array
    {
        try {
            DB::beginTransaction();

            $target = tbl_user::where('kd_user', $kdUser)->lockForUpdate()->first();

            if ($error = $this->guardTarget($target, $actor)) {
                DB::rollBack();
                return $error;
            }

            $target->update(['status_user' => $aktif ? 'ACTIVE' : 'INACTIVE']);

            if (!$aktif) {
                $target->tokens()->delete(); // sesi berakhir saat itu juga
            }

            DB::commit();

            return [
                'status'  => true,
                'message' => $aktif ? 'User berhasil diaktifkan' : 'User berhasil dinonaktifkan',
            ];
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('setStatus failed: ' . $e->getMessage());

            return ['status' => false, 'code' => 500, 'message' => 'Terjadi kesalahan saat mengubah status user'];
        }
    }

    public function blokir(string $kdUser, array $data, $actor): array
    {
        try {
            DB::beginTransaction();

            $target = tbl_user::where('kd_user', $kdUser)->lockForUpdate()->first();

            if ($error = $this->guardTarget($target, $actor)) {
                DB::rollBack();
                return $error;
            }

            $this->syncExpired($kdUser);

            $sudahAktif = UserBlokir::where('kd_user', $kdUser)->where('status', 'AKTIF')->exists();

            if ($sudahAktif) {
                DB::rollBack();
                return ['status' => false, 'code' => 422, 'message' => 'User sudah dalam status diblokir'];
            }

            $permanen = $data['jenis'] === 'PERMANEN';

            UserBlokir::create([
                'kd_blokir'  => $this->nextCode(UserBlokir::class, 'kd_blokir', 'BLK'),
                'kd_user'    => $kdUser,
                'jenis'      => $data['jenis'],
                'alasan'     => strip_tags($data['alasan']),
                'mulai_at'   => now(),
                'selesai_at' => $permanen ? null : Carbon::parse($data['selesai_at']),
                'status'     => 'AKTIF',
            ] + $this->auditFields($actor->user_name) + $this->deviceFields());

            $target->update(['blokir' => 'YA']);
            $target->tokens()->delete();

            DB::commit();

            return [
                'status'  => true,
                'message' => $permanen ? 'User berhasil diblokir permanen' : 'User berhasil disuspend',
            ];
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('blokir failed: ' . $e->getMessage());

            return ['status' => false, 'code' => 500, 'message' => 'Terjadi kesalahan saat memblokir user'];
        }
    }

    public function cabutBlokir(string $kdUser, string $alasan, $actor): array
    {
        try {
            DB::beginTransaction();

            $target = tbl_user::where('kd_user', $kdUser)->lockForUpdate()->first();

            if ($error = $this->guardTarget($target, $actor)) {
                DB::rollBack();
                return $error;
            }

            $block = UserBlokir::where('kd_user', $kdUser)->where('status', 'AKTIF')->lockForUpdate()->first();

            if (!$block && $target->blokir !== 'YA') {
                DB::rollBack();
                return ['status' => false, 'code' => 422, 'message' => 'User tidak sedang diblokir'];
            }

            if ($block) {
                $block->update([
                    'status'       => 'DICABUT',
                    'dicabut_at'   => now(),
                    'dicabut_oleh' => $actor->user_name,
                    'alasan_cabut' => strip_tags($alasan),
                ]);
            }

            $target->update(['blokir' => 'TIDAK']);

            DB::commit();

            return ['status' => true, 'message' => 'Blokir berhasil dicabut'];
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('cabutBlokir failed: ' . $e->getMessage());

            return ['status' => false, 'code' => 500, 'message' => 'Terjadi kesalahan saat mencabut blokir'];
        }
    }

    public function riwayat(string $kdUser): ?array
    {
        if (!tbl_user::where('kd_user', $kdUser)->exists()) {
            return null;
        }

        $this->syncExpired($kdUser);

        return UserBlokir::where('kd_user', $kdUser)
            ->orderByDesc('mulai_at')
            ->limit(50)
            ->get()
            ->map(fn($b) => [
                'jenis'        => $b->jenis,
                'status'       => $b->status,
                'alasan'       => $b->alasan,
                'mulai_at'     => $b->mulai_at?->toIso8601String(),
                'selesai_at'   => $b->selesai_at?->toIso8601String(),
                'diblokir_oleh' => $b->user_input,
                'dicabut_at'   => $b->dicabut_at?->toIso8601String(),
                'dicabut_oleh' => $b->dicabut_oleh,
                'alasan_cabut' => $b->alasan_cabut,
            ])
            ->all();
    }

    public function updateUser(string $kdUser, array $data, $actor): array
    {
        $newPhoto = null;
        $oldPhoto = null;

        try {
            DB::beginTransaction();

            $target = tbl_user::where('kd_user', $kdUser)->lockForUpdate()->first();

            if ($error = $this->guardTarget($target, $actor)) {
                DB::rollBack();
                return $error;
            }

            $changes = [];

            if (isset($data['level_user_id']) && (int) $data['level_user_id'] !== (int) $target->level_user_id) {
                $changes['level_user_id'] = (int) $data['level_user_id'];
            }

            $passwordChanged = !empty($data['password']);
            if ($passwordChanged) {
                $changes['password'] = Hash::make($data['password']);
            }

            $oldPhoto = ($target->img_user && $target->format_img_user)
                ? 'user-photos/' . $target->img_user . '.' . $target->format_img_user
                : null;

            if (!empty($data['foto'])) {
                $ext = strtolower($data['foto']->extension());
                $ext = $ext === 'jpeg' ? 'jpg' : $ext;

                $name = $kdUser . '_' . now()->format('YmdHis');

                Storage::disk('public')->putFileAs('user-photos', $data['foto'], $name . '.' . $ext);

                $newPhoto = 'user-photos/' . $name . '.' . $ext;
                $changes['img_user']        = $name;
                $changes['format_img_user'] = $ext;
            } elseif (!empty($data['hapus_foto']) && $oldPhoto) {
                $changes['img_user']        = null;
                $changes['format_img_user'] = null;
            }

            if (empty($changes)) {
                DB::rollBack();
                return ['status' => false, 'code' => 422, 'message' => 'Tidak ada perubahan yang disimpan'];
            }

            $target->forceFill($changes)->save();

            if ($passwordChanged) {
                $target->tokens()->delete();
            }

            DB::commit();

            if ($oldPhoto && (array_key_exists('img_user', $changes))) {
                Storage::disk('public')->delete($oldPhoto);
            }

            return ['status' => true, 'message' => 'Data user berhasil diperbarui'];
        } catch (\Throwable $e) {
            DB::rollBack();

            if ($newPhoto) {
                Storage::disk('public')->delete($newPhoto);
            }

            Log::error('updateUser failed: ' . $e->getMessage());

            return ['status' => false, 'code' => 500, 'message' => 'Terjadi kesalahan saat memperbarui user'];
        }
    }
}
