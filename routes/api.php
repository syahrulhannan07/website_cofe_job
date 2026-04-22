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
        Route::post('/register/perusahaan', [RegisterController::class, 'registrasiPerusahaan']);
        Route::post('/login', [LoginController::class, 'login']);
    });

    // Jenis Dokumen (Public)
    Route::get('/jenis-dokumen', [\App\Http\Controllers\Api\V1\JenisDokumenController::class, 'index']);


    // Fallback login route for authentication failures
    Route::get('/login', function () {
        return response()->json([
            'status' => 'error',
            'message' => 'Unauthenticated. Silakan login terlebih dahulu atau gunakan header Accept: application/json.'
        ], 401);
    })->name('login');

    // Profil Pelamar
    Route::middleware(['auth:api', 'role:Pelamar'])->prefix('pelamar/profil')->group(function () {
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
    Route::middleware(['auth:api', 'role:Pelamar'])->prefix('lamaran')->group(function () {
        Route::post('/mulai', [\App\Http\Controllers\Api\V1\Pelamar\LamaranController::class, 'mulai']);
        Route::post('/{id}/dokumen', [\App\Http\Controllers\Api\V1\Pelamar\LamaranController::class, 'uploadDokumen']);
        Route::post('/{id}/jawaban', [\App\Http\Controllers\Api\V1\Pelamar\LamaranController::class, 'simpanJawaban']);
        Route::post('/{id}/kirim', [\App\Http\Controllers\Api\V1\Pelamar\LamaranController::class, 'kirim']);
        Route::delete('/{id}', [\App\Http\Controllers\Api\V1\Pelamar\LamaranController::class, 'batalkan']);
    });

    // Tracking Lamaran & Wawancara (Protected)
    Route::middleware(['auth:api', 'role:Pelamar'])->prefix('pelamar/lamaran')->group(function () {
        Route::get('/', [\App\Http\Controllers\Api\V1\Pelamar\StatusLamaranController::class, 'index']);
        Route::get('/{id}', [\App\Http\Controllers\Api\V1\Pelamar\StatusLamaranController::class, 'show']);
        Route::get('/{id}/wawancara', [\App\Http\Controllers\Api\V1\Pelamar\StatusLamaranController::class, 'detailWawancara']);
    });

    Route::middleware(['auth:api', 'role:Admin_Perusahaan'])->prefix('admin')->group(function () {
        // Profil Perusahaan
        Route::prefix('profil-perusahaan')->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\V1\Admin\ProfilPerusahaanController::class, 'index']);
            Route::post('/', [\App\Http\Controllers\Api\V1\Admin\ProfilPerusahaanController::class, 'update']);
        });

        // Manajemen Lowongan
        Route::prefix('lowongan')->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\V1\Admin\LowonganController::class, 'index']);
            Route::post('/', [\App\Http\Controllers\Api\V1\Admin\LowonganController::class, 'store']);
            Route::get('/{id}', [\App\Http\Controllers\Api\V1\Admin\LowonganController::class, 'show']);
            Route::put('/{id}', [\App\Http\Controllers\Api\V1\Admin\LowonganController::class, 'update']);
            Route::delete('/{id}', [\App\Http\Controllers\Api\V1\Admin\LowonganController::class, 'destroy']);
            Route::post('/{id}/publish', [\App\Http\Controllers\Api\V1\Admin\LowonganController::class, 'publish']);
            Route::post('/{id}/tutup', [\App\Http\Controllers\Api\V1\Admin\LowonganController::class, 'tutup']);

            // Seleksi Lamaran: daftar kandidat per lowongan
            Route::get('/{id_lowongan}/pelamar', [\App\Http\Controllers\Api\V1\Admin\SeleksiLamaranController::class, 'daftarPelamar']);
        });

        // Seleksi Lamaran: detail & update status kandidat
        Route::prefix('lamaran')->group(function () {
            Route::get('/{id_lamaran}', [\App\Http\Controllers\Api\V1\Admin\SeleksiLamaranController::class, 'detailLamaran']);
            Route::put('/{id_lamaran}/status', [\App\Http\Controllers\Api\V1\Admin\SeleksiLamaranController::class, 'updateStatus']);

            // Wawancara Scheduling: buat jadwal untuk kandidat
            Route::post('/{id_lamaran}/wawancara', [\App\Http\Controllers\Api\V1\Admin\WawancaraController::class, 'store']);
        });

        // Manajemen Wawancara
        Route::prefix('wawancara')->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\V1\Admin\WawancaraController::class, 'index']);
            Route::put('/{id_wawancara}', [\App\Http\Controllers\Api\V1\Admin\WawancaraController::class, 'update']);
            Route::delete('/{id_wawancara}', [\App\Http\Controllers\Api\V1\Admin\WawancaraController::class, 'destroy']);
            Route::post('/{id_wawancara}/selesai', [\App\Http\Controllers\Api\V1\Admin\WawancaraController::class, 'selesai']);
        });
    });
});

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
