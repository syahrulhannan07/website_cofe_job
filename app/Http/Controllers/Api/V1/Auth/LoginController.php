<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\V1\Auth\LoginRequest;
use App\Services\V1\Auth\AuthService;
use App\Traits\ApiResponse;

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
}
