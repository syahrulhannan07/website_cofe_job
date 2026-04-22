<?php

namespace App\Http\Requests\Api\V1\Pelamar;

use Illuminate\Foundation\Http\FormRequest;

class SimpanJawabanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth('api')->check();
    }

    public function rules(): array
    {
        return [
            'jawaban' => 'required|array|min:1',
            'jawaban.*.id_pertanyaan' => 'required|exists:pertanyaan_lowongan,id_pertanyaan',
            'jawaban.*.jawaban' => 'required|string',
        ];
    }
}
