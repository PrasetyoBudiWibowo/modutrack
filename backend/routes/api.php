<?php

use App\Http\Controllers\API\AksesController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\UserController;
use App\Http\Controllers\API\WilayahController;
use App\Http\Controllers\API\ModuleController;
use App\Http\Controllers\API\MenuController;
use App\Http\Controllers\API\UserManagementController;

// Route::get('/tes', function () {
//     return 'API works';
// });

Route::middleware(['auth:sanctum', 'session.active'])->group(function () {

    Route::get('/check-session', [AuthController::class, 'checkSession']);

    Route::post('/logout', [AuthController::class, 'logout']);

    Route::prefix('users')->middleware('auth:sanctum')->group(function () {
        Route::get('/all-user', [UserController::class, 'getAllUser']);
    });

    Route::get('/me/modules', [AksesController::class, 'myModules']);
    Route::get('/module-menu/{slug}', [ModuleController::class, 'getModuleMenus'])
        ->where('slug', '[A-Za-z0-9_-]+');

    Route::middleware('level:1')->group(function () {
        Route::post('/provinsi/sync', [WilayahController::class, 'syncProvinsi']);
        Route::post('/kabupaten-kota/sync', [WilayahController::class, 'syncKotaKabupaten']);
        Route::post('/kecamatan/sync', [WilayahController::class, 'syncKecamatan']);
        Route::post('/desa-kelurahan/sync', [WilayahController::class, 'syncVillage']);
    });

    Route::prefix('module')->middleware('level:1')->group(function () {
        Route::get('/', [ModuleController::class, 'getAllModule']);
        Route::post('/create', [ModuleController::class, 'createModule']);
        Route::put('/{kdModule}', [ModuleController::class, 'updateModule']);
        Route::patch('/{kdModule}/toggle-status', [ModuleController::class, 'toggleStatusModule']);
    });


    Route::prefix('menu')->middleware('level:1')->group(function () {
        Route::get('/', [MenuController::class, 'getAllMenu']);
        Route::get('/module/{kdModule}', [MenuController::class, 'getMenuByModule']);
        Route::post('/create', [MenuController::class, 'createMenu']);
        Route::patch('/{kdMenu}/toggle-status', [MenuController::class, 'toggleStatusMenu']);
        Route::put('/{kdMenu}', [MenuController::class, 'updateMenu']);
    });

    Route::prefix('akses')->middleware('level:1')->group(function () {
        Route::get('/users', [AksesController::class, 'listUsers']);
        Route::get('/user', [AksesController::class, 'getUserAkses']);
        Route::put('/user', [AksesController::class, 'saveUserAkses']);
    });

    Route::prefix('user-management')->middleware('level:1')->group(function () {
        Route::get('/users', [UserManagementController::class, 'listUsers']);
        Route::get('/riwayat', [UserManagementController::class, 'riwayat']);
        Route::post('/nonaktifkan', [UserManagementController::class, 'nonaktifkan']);
        Route::post('/aktifkan', [UserManagementController::class, 'aktifkan']);
        Route::post('/blokir', [UserManagementController::class, 'blokir']);
        Route::post('/cabut-blokir', [UserManagementController::class, 'cabutBlokir']);
        Route::get('/levels', [UserManagementController::class, 'levels']);
        Route::post('/update', [UserManagementController::class, 'ubah']);
    });
});


Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:5,1');
Route::get('/level-user', [AuthController::class, 'getLevelUser']);
