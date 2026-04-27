<?php

namespace App\Http\Requests\V1\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

/**
 * LoginRequest — Creational Pattern (Form Request sebagai Value Object).
 *
 * Kelas ini bertanggung jawab tunggal (Prinsip SRP dari SOLID) untuk
 * memvalidasi dan menstandarkan data masukan dari pengguna sebelum
 * logika bisnis dijalankan di Service Layer.
 *
 * Dengan memisahkan validasi ke sini, LoginController menjadi sangat tipis
 * dan tidak perlu mengetahui aturan validasi apapun.
 */
class LoginRequest extends FormRequest
{
    /**
     * Tentukan apakah pengguna berhak membuat permintaan ini.
     * Endpoint login bersifat publik, sehingga selalu mengizinkan.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Aturan validasi yang berlaku untuk data masukan.
     */
    public function rules(): array
    {
        return [
            'email'      => 'required|string|email',
            'kata_sandi' => 'required|string',
        ];
    }

    /**
     * Pesan kustom untuk setiap aturan validasi yang gagal.
     */
    public function messages(): array
    {
        return [
            'email.required'      => 'Kolom email wajib diisi.',
            'email.email'         => 'Format email tidak valid.',
            'kata_sandi.required' => 'Kolom kata sandi wajib diisi.',
        ];
    }

    /**
     * Tangani kegagalan validasi dengan mengembalikan JSON error.
     *
     * Meng-override metode default agar tidak redirect melainkan
     * mengembalikan respons JSON yang konsisten dengan ApiResponse trait.
     */
    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(
            response()->json([
                'status'  => 'error',
                'message' => 'Validasi gagal.',
                'errors'  => $validator->errors(),
            ], 422)
        );
    }
}
