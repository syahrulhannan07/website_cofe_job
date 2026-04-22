<?php

namespace App\Http\Resources\Api\V1\Pelamar;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LowonganDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        // Pengecekan apakah user sudah melamar
        $sudahMelamar = false;
        if (auth('api')->check()) {
            $profil = auth('api')->user()->profilPelamar;
            if ($profil) {
                $sudahMelamar = $this->lamaran()
                    ->where('id_profil', $profil->id_profil)
                    ->exists();
            }
        }

        return [
            'id' => $this->id_lowongan,
            'posisi' => $this->posisi,
            'deskripsi' => $this->deskripsi,
            'persyaratan' => $this->persyaratan,
            'batas_awal' => $this->batas_awal,
            'batas_akhir' => $this->batas_akhir,
            'status' => $this->status,
            'perusahaan' => [
                'nama' => $this->perusahaan->nama_perusahaan ?? null,
                'alamat' => $this->perusahaan->alamat_perusahaan ?? null,
                'logo' => $this->perusahaan->logo_perusahaan ? url('storage/' . $this->perusahaan->logo_perusahaan) : null,
                'deskripsi' => $this->perusahaan->deskripsi ?? null,
            ],
            'dokumen_yang_dibutuhkan' => $this->dokumenDibutuhkan->map(function ($doc) {
                return [
                    'id_jenis_dokumen' => $doc->id_jenis_dokumen,
                    'nama_dokumen' => $doc->jenisDokumen->nama_dokumen ?? null,
                    'wajib' => (bool)$doc->wajib,
                ];
            }),
            'pertanyaan_seleksi' => $this->pertanyaanSeleksi->map(function ($q) {
                return [
                    'id_pertanyaan' => $q->id_pertanyaan,
                    'pertanyaan' => $q->pertanyaan,
                    'tipe_jawaban' => $q->tipe_jawaban,
                ];
            }),
            'sudah_melamar' => $sudahMelamar,
            'dibuat_pada' => $this->created_at,
        ];
    }
}
