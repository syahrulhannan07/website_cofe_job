<?php

namespace App\Http\Resources\V1\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WawancaraResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_wawancara'      => $this->id_wawancara,
            'tanggal_wawancara' => $this->tanggal_wawancara?->toDateTimeString(),
            'lokasi'            => $this->lokasi,
            'catatan'           => $this->catatan,
            'status'            => $this->status,
            'kandidat'          => [
                'id_lamaran'   => $this->lamaran?->id_lamaran,
                'nama_lengkap' => $this->lamaran?->profil?->nama_lengkap,
                'foto_profil'  => $this->lamaran?->profil?->foto_profil,
            ],
            'lowongan'          => [
                'id_lowongan'  => $this->lamaran?->lowongan?->id_lowongan,
                'posisi'       => $this->lamaran?->lowongan?->posisi,
            ],
        ];
    }
}
