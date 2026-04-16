<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AuthController extends Controller
{
    // Menampilkan Halaman Login (Sederhana)
    public function showLogin()
    {
        return view('auth.login');
    }

    // Menampilkan Halaman Register dengan Tab Switcher
    public function showRegister(Request $request)
    {
        // Ambil parameter 'type' dari URL (misal: /register?type=perusahaan)
        // Jika tidak ada, default-nya adalah 'pelamar'
        $type = $request->query('type', 'pelamar');

        // Validasi agar hanya 'pelamar' atau 'perusahaan' yang diperbolehkan
        if (!in_array($type, ['pelamar', 'perusahaan'])) {
            $type = 'pelamar';
        }

        // Kirim variabel $type ke dalam view
        return view('auth.register', compact('type'));
    }
}