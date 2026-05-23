<?php

namespace App\Http\Resources\V1\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LamaranResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $hasSnapshot = !empty($this->snapshot_profil);

        $pelamar = $hasSnapshot ? ($this->snapshot_profil['pelamar'] ?? []) : [
            'nama_lengkap'  => $this->profil?->nama_lengkap,
            'email'         => $this->profil?->pengguna?->email,
            'foto_profil'   => $this->profil?->foto_profil,
            'tentang_saya'  => $this->profil?->tentang_saya,
            'telepon'       => $this->profil?->nomor_telepon,
            'alamat'        => $this->profil?->alamat,
            'tanggal_lahir' => $this->profil?->tanggal_lahir,
            'jenis_kelamin' => $this->profil?->jenis_kelamin,
        ];

        // Format pendidikan_terakhir
        if ($hasSnapshot) {
            $sortedPendidikan = collect($this->snapshot_profil['pendidikan'] ?? [])->sortByDesc('tahun_selesai')->first();
            $pendidikanTerakhir = $sortedPendidikan 
                ? ($sortedPendidikan['tingkat'] . ' ' . $sortedPendidikan['jurusan']) 
                : '-';
        } else {
            $latestPendidikan = $this->profil?->pendidikan()->orderBy('tahun_selesai', 'desc')->first();
            $pendidikanTerakhir = $latestPendidikan 
                ? ($latestPendidikan->tingkat . ' ' . $latestPendidikan->jurusan) 
                : '-';
        }

        return [
            'id_lamaran'      => $this->id_lamaran,
            'id_profil'       => $this->id_profil,
            'status'          => $this->status,
            'tanggal_melamar' => $this->created_at?->toDateTimeString(),
            'pelamar'         => $pelamar,
            'pendidikan_terakhir' => $pendidikanTerakhir,
            'lowongan'        => [
                'id_lowongan' => $this->lowongan?->id_lowongan,
                'posisi'      => $this->lowongan?->posisi,
            ],
            // Conditionally add more details if loaded
            'pendidikan'       => $hasSnapshot 
                ? ($this->snapshot_profil['pendidikan'] ?? []) 
                : $this->whenLoaded('profil', fn() => $this->profil->pendidikan),
            'pengalaman'       => $hasSnapshot 
                ? ($this->snapshot_profil['pengalaman'] ?? []) 
                : $this->whenLoaded('profil', fn() => $this->profil->pengalamanKerja),
            'skill'            => $hasSnapshot 
                ? ($this->snapshot_profil['skills'] ?? []) 
                : $this->whenLoaded('profil', fn() => $this->profil->skills),
            'dokumen'          => $this->whenLoaded('lamaranDokumen'),
            'dokumen_lowongan' => $this->whenLoaded('lowongan', fn() => $this->lowongan->dokumenDibutuhkan),
            'jawaban_seleksi'  => $this->whenLoaded('jawabanPertanyaan'),
        ];
    }
}
