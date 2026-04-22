<?php

namespace App\Http\Requests\Api\V1\Pelamar;

use App\Models\Lamaran;
use App\Models\Lowongan;
use Illuminate\Foundation\Http\FormRequest;

class MulaiLamaranRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth('api')->check();
    }

    public function rules(): array
    {
        return [
            'id_lowongan' => [
                'required',
                'exists:lowongan,id_lowongan',
                function ($attribute, $value, $fail) {
                    $lowongan = Lowongan::find($value);
                    if (!$lowongan) return;

                    // 1. Cek status aktif dan batas akhir
                    if ($lowongan->status !== 'Aktif' || $lowongan->batas_akhir < now()->toDateString()) {
                        $fail('Lowongan ini sudah tidak aktif atau sudah melewati batas akhir pendaftaran.');
                    }

                    // 2. Cek apakah sudah pernah melamar
                    $profil = auth('api')->user()->profilPelamar;
                    if ($profil) {
                        $exists = Lamaran::where('id_lowongan', $value)
                            ->where('id_profil', $profil->id_profil)
                            ->exists();
                        
                        if ($exists) {
                            $fail('Anda sudah pernah melamar pada lowongan ini.');
                        }
                    }
                }
            ],
        ];
    }
}
