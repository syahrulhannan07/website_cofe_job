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
            'lokasi' => $this->lokasi,
            'kecamatan' => $this->perusahaan->kecamatan ?? null,
            'gaji' => $this->gaji,
            'deskripsi' => $this->deskripsi,
            'persyaratan' => $this->persyaratan,
            'batas_akhir' => $this->batas_akhir,
            'dibuat_pada' => $this->created_at,
            'perusahaan' => [
                'id_perusahaan' => $this->perusahaan->id_perusahaan ?? null,
                'nama_perusahaan' => $this->perusahaan->nama_perusahaan ?? null,
                'deskripsi' => $this->perusahaan->deskripsi ?? null,
                'alamat_perusahaan' => $this->perusahaan->alamat_perusahaan ?? null,
                'kecamatan' => $this->perusahaan->kecamatan ?? null,
                'logo_perusahaan' => $this->perusahaan->logo_perusahaan ? url('storage/' . $this->perusahaan->logo_perusahaan) : null,
                'tanggal_berdiri' => $this->perusahaan->tanggal_berdiri ?? '-',
                'status_verifikasi' => $this->perusahaan->status_verifikasi ?? null,
                'jumlah_lowongan' => $this->perusahaan->lowongan()->where('status', 'Active')->count(),
            ],
        ];
    }
}
