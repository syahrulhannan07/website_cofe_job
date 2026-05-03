<?php

namespace App\Http\Resources\V1\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LowonganResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id_lowongan,
            'posisi'         => $this->posisi,
            'deskripsi'      => $this->deskripsi,
            'persyaratan'    => $this->persyaratan,
            'status'         => $this->status,
            'jumlah_pelamar' => $this->lamaran_count ?? $this->lamaran()->count(),
            'batas_awal'     => $this->batas_awal,
            'batas_akhir'    => $this->batas_akhir,
            'created_at'     => $this->created_at?->toDateTimeString(),
            'updated_at'     => $this->updated_at?->toDateTimeString(),
            'perusahaan'     => [
                'nama'   => $this->perusahaan?->nama_perusahaan,
                'alamat' => $this->perusahaan?->alamat_perusahaan,
                'email'  => $this->perusahaan?->pengguna?->email,
                'logo'   => $this->perusahaan?->logo_perusahaan,
            ],
            'dokumen'        => $this->whenLoaded('dokumenDibutuhkan'),
            'pertanyaan'     => $this->whenLoaded('pertanyaanSeleksi'),
        ];
    }
}
