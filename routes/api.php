<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\V1\Auth\RegisterController;
use App\Http\Controllers\Api\V1\Auth\LoginController;

use App\Http\Controllers\Api\V1\Pelamar\ProfilController;

Route::prefix('v1')->group(function () {
    Route::prefix('auth')->group(function () {
        Route::post('/daftar-pelamar', [RegisterController::class, 'daftarPelamar']);
        Route::post('/daftar-perusahaan', [RegisterController::class, 'daftarPerusahaan']);
        Route::post('/login', [LoginController::class, 'login']);
    });

    // Fallback login route for authentication failures
    Route::get('/login', function () {
        return response()->json([
            'status' => 'error',
            'message' => 'Unauthenticated. Silakan login terlebih dahulu atau gunakan header Accept: application/json.'
        ], 401);
    })->name('login');

    // Profil Pelamar
    Route::middleware(['auth:api', 'role'])->prefix('pelamar/profil')->group(function () {
        Route::get('/', [ProfilController::class, 'index']);
        Route::post('/update', [ProfilController::class, 'update']);
        
        // Skill
        Route::post('/skill', [ProfilController::class, 'storeSkill']);
        Route::delete('/skill/{id}', [ProfilController::class, 'deleteSkill']);

        // Pendidikan
        Route::post('/pendidikan', [ProfilController::class, 'storePendidikan']);
        Route::put('/pendidikan/{id}', [ProfilController::class, 'updatePendidikan']);
        Route::delete('/pendidikan/{id}', [ProfilController::class, 'deletePendidikan']);

        // Pengalaman Kerja
        Route::post('/pengalaman', [ProfilController::class, 'storePengalaman']);
        Route::put('/pengalaman/{id}', [ProfilController::class, 'updatePengalaman']);
        Route::delete('/pengalaman/{id}', [ProfilController::class, 'deletePengalaman']);
    });
});

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
