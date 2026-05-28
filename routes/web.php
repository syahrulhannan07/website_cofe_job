<?php

use Illuminate\Support\Facades\Route;

// Rute utama — menampilkan aplikasi React (SPA)
Route::get('/', function () {
    return view('welcome');
});

Route::get('/storage/lamaran_dokumen/{id_lamaran}/{filename}', function ($id_lamaran, $filename) {
    $path = "lamaran_dokumen/{$id_lamaran}/{$filename}";
    if (!Illuminate\Support\Facades\Storage::disk('local')->exists($path)) {
        abort(404);
    }
    return Illuminate\Support\Facades\Storage::disk('local')->response($path);
});

// Tangkap semua rute frontend — biarkan React Router yang menangani navigasi
Route::fallback(function () {
    return view('welcome');
});