<?php

namespace App\Http\Requests\Api\V1\Pelamar;

use Illuminate\Foundation\Http\FormRequest;

class UploadDokumenRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth('api')->check();
    }

    public function rules(): array
    {
        return [
            'dokumen' => 'required|array|min:1',
            'dokumen.*' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'id_jenis_dokumen' => 'required|array|min:1',
            'id_jenis_dokumen.*' => 'required|exists:jenis_dokumen,id_jenis_dokumen',
        ];
    }

    public function messages()
    {
        return [
            'dokumen.*.mimes' => 'Format file harus pdf, jpg, jpeg, atau png.',
            'dokumen.*.max' => 'Ukuran file maksimal 5MB.',
        ];
    }
}
