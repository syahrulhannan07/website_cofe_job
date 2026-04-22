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

    // Lowongan (Public/Optional Auth)
    Route::prefix('lowongan')->group(function () {
        Route::get('/', [\App\Http\Controllers\Api\V1\Pelamar\LowonganController::class, 'index']);
        Route::get('/{id}', [\App\Http\Controllers\Api\V1\Pelamar\LowonganController::class, 'show']);
    });

    // Lamaran (Protected)
    Route::middleware(['auth:api', 'role'])->prefix('lamaran')->group(function () {
        Route::post('/mulai', [\App\Http\Controllers\Api\V1\Pelamar\LamaranController::class, 'mulai']);
        Route::post('/{id}/dokumen', [\App\Http\Controllers\Api\V1\Pelamar\LamaranController::class, 'uploadDokumen']);
        Route::post('/{id}/jawaban', [\App\Http\Controllers\Api\V1\Pelamar\LamaranController::class, 'simpanJawaban']);
        Route::post('/{id}/kirim', [\App\Http\Controllers\Api\V1\Pelamar\LamaranController::class, 'kirim']);
        Route::delete('/{id}', [\App\Http\Controllers\Api\V1\Pelamar\LamaranController::class, 'batalkan']);
    });

    // Tracking Lamaran & Wawancara (Protected)
    Route::middleware(['auth:api', 'role'])->prefix('pelamar/lamaran')->group(function () {
        Route::get('/', [\App\Http\Controllers\Api\V1\Pelamar\StatusLamaranController::class, 'index']);
        Route::get('/{id}', [\App\Http\Controllers\Api\V1\Pelamar\StatusLamaranController::class, 'show']);
        Route::get('/{id}/wawancara', [\App\Http\Controllers\Api\V1\Pelamar\StatusLamaranController::class, 'detailWawancara']);
    });
});

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
