<?php

namespace App\Http\Resources\Api\V1\Pelamar;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LowonganResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id_lowongan,
            'posisi' => $this->posisi,
            'nama_kafe' => $this->perusahaan->nama_perusahaan ?? null,
            'alamat_kafe' => $this->perusahaan->alamat_perusahaan ?? null,
            'logo_kafe' => $this->perusahaan->logo_perusahaan ? url('storage/' . $this->perusahaan->logo_perusahaan) : null,
            'batas_akhir' => $this->batas_akhir,
            'dibuat_pada' => $this->created_at,
        ];
    }
}
