<?php

namespace App\Http\Requests\Api\V1\Pelamar;

use Illuminate\Foundation\Http\FormRequest;

class StorePendidikanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'institusi' => 'required|string|max:255',
            'jurusan' => 'required|string|max:255',
            'tingkat' => 'required|string|max:100',
            'tahun_mulai' => 'required|date_format:Y-m-d',
            'tahun_selesai' => 'nullable|date_format:Y-m-d|after_or_equal:tahun_mulai',
        ];
    }

    public function messages(): array
    {
        return [
            'tahun_mulai.date_format' => 'Format tahun mulai harus YYYY-MM-DD.',
            'tahun_selesai.date_format' => 'Format tahun selesai harus YYYY-MM-DD.',
            'tahun_selesai.after_or_equal' => 'Tahun selesai harus setelah atau sama dengan tahun mulai.',
        ];
    }
}
