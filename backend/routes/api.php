<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\UserController;
use App\Http\Controllers\API\WilayahController;
use App\Http\Controllers\API\ModuleController;
use App\Http\Controllers\API\MenuController;

// Route::get('/tes', function () {
//     return 'API works';
// });

Route::middleware(['auth:sanctum'])->group(function () {

    Route::get('/check-session', [AuthController::class, 'checkSession']);

    Route::post('/logout', [AuthController::class, 'logout']);

    Route::prefix('users')->middleware('auth:sanctum')->group(function () {
        Route::get('/all-user', [UserController::class, 'getAllUser']);
    });

    Route::prefix('wilayah')->group(function () {

        Route::get('/provinsi', [WilayahController::class, 'provinsiGetAll']);
        Route::post('/provinsi/sync', [WilayahController::class, 'syncProvinsi']);
        Route::post('/kabupaten-kota/sync', [WilayahController::class, 'syncKotaKabupaten']);
        Route::post('/kecamatan/sync', [WilayahController::class, 'syncKecamatan']);
        Route::post('/desa-kelurahan/sync', [WilayahController::class, 'syncVillage']);
    });

    Route::prefix('module')->group(function () {
        Route::get('/', [ModuleController::class, 'getAllModule']);
        Route::post('/create', [ModuleController::class, 'createModule']);
        Route::patch('/{kdModule}/toggle-status', [ModuleController::class, 'toggleStatusModule']);
    });

    Route::prefix('menu')->group(function () {
        Route::get('/', [MenuController::class, 'getAllMenu']);
        Route::get('/{kdModule}', [MenuController::class, 'getMenuByModule']);
        Route::post('/create', [MenuController::class, 'createMenu']);
        Route::patch('/{kdMenu}/toggle-status', [MenuController::class, 'toggleStatusMenu']);
    });
});


Route::post('/register', [AuthController::class, 'register']);
Route::get('/level-user', [AuthController::class, 'getLevelUser']);
