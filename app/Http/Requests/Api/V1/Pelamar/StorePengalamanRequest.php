<?php

namespace App\Http\Requests\Api\V1\Pelamar;

use Illuminate\Foundation\Http\FormRequest;

class StorePengalamanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nama_perusahaan' => 'required|string|max:255',
            'posisi' => 'required|string|max:255',
            'tanggal_mulai' => 'required|date_format:Y-m-d',
            'tanggal_selesai' => 'nullable|date_format:Y-m-d|after_or_equal:tanggal_mulai',
            'deskripsi' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'tanggal_mulai.date_format' => 'Format tanggal mulai harus YYYY-MM-DD.',
            'tanggal_selesai.date_format' => 'Format tanggal selesai harus YYYY-MM-DD.',
            'tanggal_selesai.after_or_equal' => 'Tanggal selesai harus setelah atau sama dengan tanggal mulai.',
        ];
    }
}
