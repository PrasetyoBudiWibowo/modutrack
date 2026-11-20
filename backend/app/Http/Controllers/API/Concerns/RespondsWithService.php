<?php

namespace App\Http\Controllers\API\Concerns;

use App\Helper\AppLogger;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

trait RespondsWithService
{
    /** $aksi menerima ($validated, $actor) dan mengembalikan array dari service */
    protected function execute(Request $request, string $logName, array $rules, array $messages, Closure $aksi)
    {
        $log = AppLogger::getLogger($logName);

        try {
            $validated = $request->validate($rules, $messages);
            $result    = $aksi($validated, $request->user());

            if (!$result['status']) {
                return response()->json([
                    'status'  => false,
                    'message' => $result['message'],
                ], $result['code'] ?? 500);
            }

            return response()->json([
                'status'  => true,
                'message' => $result['message'],
                'data'    => $result['data'] ?? null,
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'status'  => false,
                'message' => collect($e->errors())->flatten()->first(),
                'errors'  => $e->errors(),
            ], 422);
        } catch (\Throwable $th) {
            $log->error($th->getMessage());

            return response()->json(['status' => false, 'message' => 'Terjadi kesalahan pada server'], 500);
        }
    }
}
