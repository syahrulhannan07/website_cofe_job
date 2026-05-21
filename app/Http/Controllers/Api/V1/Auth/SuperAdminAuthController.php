<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Models\Pengguna;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class SuperAdminAuthController extends Controller
{
    use ApiResponse;

    /**
     * Menangani proses login khusus untuk Super Admin (UC-10).
     * [UPDATE LOGIC]
     */
    public function login(Request $request)
    {
        // [UPDATE LOGIC] - Validasi input username/email dan kata_sandi
        $validator = Validator::make($request->all(), [
            'username_email' => 'required|string',
            'kata_sandi'     => 'required|string',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validasi gagal', 422, $validator->errors());
        }

        // [UPDATE LOGIC] - Cari pengguna berdasarkan email atau nama_pengguna
        $pengguna = Pengguna::where('email', $request->username_email)
            ->orWhere('nama_pengguna', $request->username_email)
            ->first();

        // [UPDATE LOGIC] - Verifikasi kredensial dan hak akses tingkat tinggi
        // Jika tidak ditemukan, password salah, atau perannya bukan Super_Admin,
        // kembalikan respons error 401 secara seragam untuk keamanan.
        if (!$pengguna || !Hash::check($request->kata_sandi, $pengguna->kata_sandi) || $pengguna->peran !== 'Super_Admin') {
            return $this->errorResponse('Username atau password salah', 401);
        }

        // [UPDATE LOGIC] - Verifikasi status akun pengguna
        if ($pengguna->status_akun === 'Diblokir') {
            return $this->errorResponse('Akun Anda telah ditangguhkan. Silakan hubungi bantuan.', 403);
        }

        // [UPDATE LOGIC] - Buat token otentikasi JWT
        $token = auth('api')->login($pengguna);

        // [UPDATE LOGIC] - Kembalikan data sukses beserta token
        return $this->successResponse([
            'token'    => $token,
            'pengguna' => [
                'id_pengguna'   => $pengguna->id_pengguna,
                'nama_pengguna' => $pengguna->nama_pengguna,
                'email'         => $pengguna->email,
                'peran'         => $pengguna->peran,
            ],
        ], 'Login berhasil.');
    }
}
