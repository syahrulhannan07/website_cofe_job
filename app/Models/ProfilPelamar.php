<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProfilPelamar extends Model
{
    protected $table = 'profil_pelamar';
    protected $primaryKey = 'id_profil';

    protected $fillable = [
        'id_pengguna',
        'foto_profil',
        'nama_lengkap',
        'tentang_saya',
        'tanggal_lahir',
        'nomor_telepon',
        'alamat',
        'jenis_kelamin',
    ];

    public function pengguna()
    {
        return $this->belongsTo(Pengguna::class, 'id_pengguna', 'id_pengguna');
    }

    public function skills()
    {
        return $this->hasMany(Skill::class, 'id_profil', 'id_profil');
    }

    public function pendidikan()
    {
        return $this->hasMany(Pendidikan::class, 'id_profil', 'id_profil');
    }

    public function pengalamanKerja()
    {
        return $this->hasMany(PengalamanKerja::class, 'id_profil', 'id_profil');
    }

    public function lamaran()
    {
        return $this->hasMany(Lamaran::class, 'id_profil', 'id_profil');
    }
}
