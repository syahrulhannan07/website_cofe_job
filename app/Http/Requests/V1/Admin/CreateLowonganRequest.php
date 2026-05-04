<?php

namespace App\Http\Requests\V1\Admin;

use Illuminate\Foundation\Http\FormRequest;

class CreateLowonganRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Middleware handles this
    }

    public function rules(): array
    {
        return [
            'posisi'                               => 'required|string|max:255',
            'deskripsi'                            => 'required|string',
            'persyaratan'                          => 'required|string',
            'lokasi'                               => 'nullable|string|max:255',
            'gaji'                                 => 'nullable|string|max:255',
            'batas_awal'                           => 'required|date|date_format:Y-m-d',
            'batas_akhir'                          => 'required|date|date_format:Y-m-d|after:batas_awal',
            'status'                               => 'nullable|in:Draft,Active',
            'dokumen_dibutuhkan'                   => 'nullable|array',
            'dokumen_dibutuhkan.*.id_jenis_dokumen'=> 'required|exists:jenis_dokumen,id_jenis_dokumen',
            'dokumen_dibutuhkan.*.wajib'           => 'required|boolean',
            'pertanyaan'                           => 'nullable|array',
            'pertanyaan.*.pertanyaan'              => 'required|string',
            'pertanyaan.*.tipe_jawaban'            => 'required|string|in:text,boolean,number,pilihan_ganda',
        ];
    }
}
