<?php

namespace App\Http\Requests\Api\V1\Pelamar;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfilRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; 
    }

    public function rules(): array
    {
        return [
            'nama_lengkap' => 'sometimes|string|max:255',
            'tentang_saya' => 'sometimes|string',
            'tanggal_lahir' => 'sometimes|date_format:Y-m-d',
            'nomor_telepon' => 'sometimes|string|max:20',
            'alamat' => 'sometimes|string',
            'jenis_kelamin' => 'sometimes|in:Laki-laki,Perempuan',
            'foto_profil' => 'sometimes|image|mimes:jpg,jpeg,png|max:2048',
        ];
    }

    public function messages(): array
    {
        return [
            'tanggal_lahir.date_format' => 'Format tanggal lahir harus YYYY-MM-DD.',
            'jenis_kelamin.in' => 'Jenis kelamin harus Laki-laki atau Perempuan.',
            'foto_profil.image' => 'File harus berupa gambar.',
            'foto_profil.max' => 'Ukuran foto maksimal 2MB.',
        ];
    }
}
