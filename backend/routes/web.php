<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;

Route::get('/', function () {
    return view('welcome');
});

Route::prefix('api')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::get('/check-session', [AuthController::class, 'checkSession']);
    Route::post('/logout', [AuthController::class, 'logout']);
});
