<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\V1\Auth\LoginRequest;
use App\Services\V1\Auth\AuthService;
use App\Traits\ApiResponse;
use App\Models\Pengguna;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use App\Models\ProfilPelamar;

class LoginController extends Controller
{
    use ApiResponse;

    /**
     * Injeksi AuthService melalui konstruktor.
     */
    public function __construct(
        protected AuthService $authService
    ) {}

    /**
     * Menangani proses login pengguna.
     */
    public function login(LoginRequest $request)
    {
        $hasil = $this->authService->prosesMasuk(
            $request->email,
            $request->kata_sandi
        );

        if (!$hasil['sukses']) {
            return $this->errorResponse($hasil['pesan'], $hasil['kode']);
        }

        return $this->successResponse($hasil['data'], $hasil['pesan']);
    }

    /**
     * Logout pengguna.
     */
    public function logout()
    {
        auth('api')->logout();

        return $this->successResponse(null, 'Berhasil logout.');
    }

    /**
     * Mengambil data profil pengguna yang sedang login.
     */
    public function me()
    {
        return $this->successResponse(auth('api')->user());
    }

    public function googleAuth(Request $request) 
{
    $request->validate([
        'nama_pengguna' => 'required|string',
        'email'         => 'required|email',
        'fcm_token'     => 'nullable|string'
    ]);

    // 1. Cek apakah email pengguna sudah terdaftar di database
    $user = Pengguna::where('email', $request->email)->first();

    if (!$user) {
        // 2. Jika BELUM terdaftar, buat data baru sesuai kolom di gambar Anda
        $user = Pengguna::create([
            'nama_pengguna' => $request->nama_pengguna,
            'email'         => $request->email,
            'kata_sandi'    => Hash::make(Str::random(16)), // Diisi string acak karena login via Google tidak pakai password
            'peran'         => 'Pelamar', // Otomatis diset sebagai Pelamar
            'status_akun'   => 'Aktif',   // Status default saat akun dibuat
            'fcm_token'     => $request->fcm_token,
        ]);
        
        ProfilPelamar::create([
            'id_pengguna' => $user->id_pengguna,
            'nama_lengkap' => $user->nama_pengguna,
        ]);

        $message = 'Registrasi akun Google berhasil';
    } else {
        // 3. Jika SUDAH terdaftar, tinggal update fcm_token (jika ada)
        if ($request->filled('fcm_token')) {
            $user->update(['fcm_token' => $request->fcm_token]);
        }
        $message = 'Login dengan Google berhasil';
    }

    // 4. Generate Token Otentikasi (Sesuaikan dengan library JWT/Passport/Sanctum yang Anda pakai)
    // Contoh jika menggunakan Passport (sesuai 'auth:api' di api.php Anda):
    $token = JWTAuth::fromUser($user);

    return response()->json([
        'status'  => true,
        'message' => $message,
        'token'   => $token,
        'data'    => [
            'id_pengguna'   => $user->id_pengguna,
            'nama_pengguna' => $user->nama_pengguna,
            'email'         => $user->email,
            'peran'         => $user->peran,
            'status_akun'   => $user->status_akun
            ]
        ], 200);
    }
}
