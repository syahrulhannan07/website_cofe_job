<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Models\Pengguna;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use App\Traits\ApiResponse;

class LoginController extends Controller
{
    use ApiResponse;

    public function login(Request $request)
    {
        // 1. Validasi input
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'kata_sandi' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        // 2. Cari pengguna berdasarkan email
        $pengguna = Pengguna::where('email', $request->email)->first();

        // 3. Jika tidak ditemukan
        if (!$pengguna) {
            return response()->json([
                'status' => 'error',
                'message' => 'Akun belum terdaftar'
            ], 401);
        }

        // 4. Verifikasi kata_sandi
        if (!Hash::check($request->kata_sandi, $pengguna->kata_sandi)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Username atau password salah'
            ], 401);
        }

        // 4.5 Cek status akun
        if ($pengguna->status_akun === 'Diblokir') {
            return response()->json([
                'status' => 'error',
                'message' => 'Akun Anda telah ditangguhkan. Silakan hubungi bantuan.'
            ], 403);
        }

        // 5. Generate JWT token
        // Token akan otomatis berisi id_pengguna sebagai 'sub' 
        // We can manually add claims if needed, but the requirements say "sertakan payload: id_pengguna, email, peran"
        $token = auth('api')->login($pengguna);

        // 6. Siapkan data response
        $responseData = [
            'status' => 'success',
            'data' => [
                'token' => $token,
                'pengguna' => [
                    'id_pengguna' => $pengguna->id_pengguna,
                    'nama_pengguna' => $pengguna->nama_pengguna,
                    'email' => $pengguna->email,
                    'peran' => $pengguna->peran,
                ]
            ]
        ];

        // 7. Logika khusus Admin_Perusahaan
        if ($pengguna->peran === 'Admin_Perusahaan') {
            $profil = $pengguna->profilPerusahaan;
            $responseData['data']['profil_perusahaan'] = [
                'status_verifikasi' => $profil ? $profil->status_verifikasi : 'Pending'
            ];
        }

        return $this->successResponse($responseData['data'], 'Login berhasil');
    }

    /**
     * Logout pengguna (Invalidate token).
     */
    public function logout()
    {
        auth('api')->logout();

        return $this->successResponse(null, 'Berhasil logout');
    }

    /**
     * Ambil data pengguna yang sedang login.
     */
    public function me()
    {
        return $this->successResponse(auth('api')->user());
    }
}
