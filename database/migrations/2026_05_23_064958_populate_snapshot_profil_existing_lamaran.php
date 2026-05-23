<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Lamaran;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $lamaranList = Lamaran::whereNull('snapshot_profil')->get();
        foreach ($lamaranList as $lamaran) {
            $profil = $lamaran->profil;
            if ($profil) {
                $profil->load(['pengguna', 'pendidikan', 'skills', 'pengalamanKerja']);
                $snapshot = [
                    'pelamar' => [
                        'nama_lengkap'  => $profil->nama_lengkap,
                        'email'         => $profil->pengguna?->email,
                        'foto_profil'   => $profil->foto_profil,
                        'tentang_saya'  => $profil->tentang_saya,
                        'telepon'       => $profil->nomor_telepon,
                        'alamat'        => $profil->alamat,
                        'tanggal_lahir' => $profil->tanggal_lahir,
                        'jenis_kelamin' => $profil->jenis_kelamin,
                    ],
                    'pendidikan' => $profil->pendidikan->map(fn($p) => [
                        'id_pendidikan' => $p->id_pendidikan,
                        'institusi'     => $p->institusi,
                        'tingkat'       => $p->tingkat,
                        'jurusan'       => $p->jurusan,
                        'tahun_mulai'   => $p->tahun_mulai,
                        'tahun_selesai' => $p->tahun_selesai,
                    ])->toArray(),
                    'pengalaman' => $profil->pengalamanKerja->map(fn($p) => [
                        'id_pengalaman'  => $p->id_pengalaman,
                        'nama_perusahaan'=> $p->nama_perusahaan,
                        'posisi'         => $p->posisi,
                        'tanggal_mulai'  => $p->tanggal_mulai,
                        'tanggal_selesai'=> $p->tanggal_selesai,
                        'deskripsi'      => $p->deskripsi,
                    ])->toArray(),
                    'skills' => $profil->skills->map(fn($s) => [
                        'id_skill'   => $s->id_skill,
                        'nama_skill' => $s->nama_skill,
                    ])->toArray(),
                ];
                $lamaran->update(['snapshot_profil' => $snapshot]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No action needed for rollback
    }
};
