<?php

use Illuminate\Support\Facades\Route;

// Rute utama — menampilkan aplikasi React (SPA)
Route::get('/', function () {
    return view('welcome');
});

// Tangkap semua rute frontend — biarkan React Router yang menangani navigasi
// Pola regex mengecualikan rute yang dimulai dengan 'api'
Route::get('/{rute}', function () {
    return view('welcome');
})->where('rute', '^(?!api).*$');