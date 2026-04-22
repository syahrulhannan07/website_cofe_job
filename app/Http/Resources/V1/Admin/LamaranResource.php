<?php

namespace App\Http\Resources\V1\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LamaranResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_lamaran'      => $this->id_lamaran,
            'id_profil'       => $this->id_profil,
            'status'          => $this->status,
            'tanggal_melamar' => $this->created_at?->toDateTimeString(),
            'pelamar'         => [
                'nama_lengkap' => $this->profil?->nama_lengkap,
                'foto_profil'  => $this->profil?->foto_profil,
                'tentang_saya' => $this->profil?->tentang_saya,
                'telepon'      => $this->profil?->telepon,
                'alamat'       => $this->profil?->alamat,
            ],
            'lowongan'        => [
                'id_lowongan' => $this->lowongan?->id_lowongan,
                'posisi'      => $this->lowongan?->posisi,
            ],
            // Conditionally add more details if loaded
            'pendidikan'       => $this->whenLoaded('profil', fn() => $this->profil->pendidikan),
            'pengalaman'       => $this->whenLoaded('profil', fn() => $this->profil->pengalamanKerja),
            'skill'            => $this->whenLoaded('profil', fn() => $this->profil->skills),
            'dokumen'          => $this->whenLoaded('lamaranDokumen'),
            'jawaban_seleksi'  => $this->whenLoaded('jawabanPertanyaan'),
        ];
    }
}
