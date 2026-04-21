<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\V1\Auth\RegisterController;
use App\Http\Controllers\Api\V1\Auth\LoginController;

Route::prefix('v1')->group(function () {
    Route::prefix('auth')->group(function () {
        Route::post('/daftar-pelamar', [RegisterController::class, 'daftarPelamar']);
        Route::post('/daftar-perusahaan', [RegisterController::class, 'daftarPerusahaan']);
        Route::post('/login', [LoginController::class, 'login']);
    });
});

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
