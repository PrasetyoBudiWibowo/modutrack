<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\UserController;
use App\Http\Controllers\API\WilayahController;

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
    });
});


Route::post('/register', [AuthController::class, 'register']);
Route::get('/level-user', [AuthController::class, 'getLevelUser']);
