<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProfilPerusahaan extends Model
{
    protected $table = 'profil_perusahaan';
    protected $primaryKey = 'id_perusahaan';

    protected $fillable = [
        'id_pengguna',
        'logo_perusahaan',
        'nama_perusahaan',
        'alamat_perusahaan',
        'dokumen_izin',
        'dokumen_legalitas',
        'deskripsi',
        'status_verifikasi',
    ];

    public function pengguna()
    {
        return $this->belongsTo(Pengguna::class, 'id_pengguna', 'id_pengguna');
    }

    public function lowongan()
    {
        return $this->hasMany(Lowongan::class, 'id_perusahaan', 'id_perusahaan');
    }
}
