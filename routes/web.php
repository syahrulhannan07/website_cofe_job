<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::middleware(['auth', 'role:company_admin'])->prefix('admin')->group(function () {

    // 1. Dashboard
    Route::get('/dashboard', [AdminDashboardController::class, 'index']);

    // 2. Profile perusahaan
    Route::get('/company-profile', [CompanyController::class, 'index']);
    Route::post('/company-profile', [CompanyController::class, 'update']);

    // 3. Lowongan
    Route::resource('/jobs', JobController::class);

    // 4. Pelamar
    Route::get('/applicants', [ApplicationController::class, 'index']);
    Route::post('/applicants/{id}/status', [ApplicationController::class, 'updateStatus']);

    // 5. Interview
    Route::get('/interviews', [InterviewController::class, 'index']);
    Route::post('/interviews/schedule', [InterviewController::class, 'store']);

});