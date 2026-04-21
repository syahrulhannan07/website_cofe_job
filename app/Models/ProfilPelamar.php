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
}
