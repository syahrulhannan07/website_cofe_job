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
            'nama_kafe' => $this->perusahaan->nama_perusahaan ?? null,
            'alamat_kafe' => $this->perusahaan->alamat_perusahaan ?? null,
            'logo_kafe' => $this->perusahaan->logo_perusahaan ? url('storage/' . $this->perusahaan->logo_perusahaan) : null,
            'lokasi' => $this->lokasi,
            'kecamatan' => $this->perusahaan->kecamatan ?? null,
            'gaji' => $this->gaji,
            'deskripsi' => $this->deskripsi,
            'persyaratan' => $this->persyaratan,
            'batas_awal' => $this->batas_awal,
            'batas_akhir' => $this->batas_akhir,
            'status' => $this->status,
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
