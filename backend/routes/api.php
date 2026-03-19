<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;

Route::get('/tes', function () {
    return 'API works';
});

Route::post('/login', [AuthController::class, 'login']);
