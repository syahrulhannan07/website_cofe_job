<?php

namespace App\Http\Resources\Api\V1\Pelamar;

use Illuminate\Http\Resources\Json\JsonResource;

class PerusahaanResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id_perusahaan' => $this->id_perusahaan,
            'nama_perusahaan' => $this->nama_perusahaan,
            'logo_perusahaan' => $this->logo_perusahaan ? asset('storage/' . $this->logo_perusahaan) : null,
            'alamat_perusahaan' => $this->alamat_perusahaan,
            'kecamatan' => $this->kecamatan,
            'deskripsi' => $this->deskripsi,
            'jumlah_lowongan' => $this->lowongan_count ?? $this->lowongan()->where('status', 'Active')->count(),
        ];
    }
}
