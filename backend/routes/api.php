<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\UserController;

// Route::get('/tes', function () {
//     return 'API works';
// });

Route::get('/check-session', [AuthController::class, 'checkSession'])
    ->middleware('auth:sanctum');

Route::post('/logout', [AuthController::class, 'logout'])
    ->middleware('auth:sanctum');

Route::prefix('users')->middleware('auth:sanctum')->group(function () {
    Route::get('/all-user', [UserController::class, 'getAllUser']);
});


Route::post('/register', [AuthController::class, 'register']);
Route::get('/level-user', [AuthController::class, 'getLevelUser']);
