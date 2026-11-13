<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Nib;

class ProfilPerusahaan extends Model
{
    protected $table = 'profil_perusahaan';
    protected $primaryKey = 'id_perusahaan';

    protected $fillable = [
        'id_pengguna',
        'logo_perusahaan',
        'foto_outlet',
        'nama_perusahaan',
        'alamat_perusahaan',
        'latitude',
        'longitude',
        'dokumen_izin',
        'tanggal_berdiri',
        'deskripsi',
        'status_verifikasi',
        'alasan_penolakan',
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
    ];

    public function pengguna()
    {
        return $this->belongsTo(Pengguna::class, 'id_pengguna', 'id_pengguna');
    }

    public function lowongan()
    {
        return $this->hasMany(Lowongan::class, 'id_perusahaan', 'id_perusahaan');
    }

    /**
     * Scope untuk memfilter perusahaan yang sudah terverifikasi (Diterima)
     * dan akun admin (pengguna) dalam status Aktif.
     */
    public function scopeAktifTerverifikasi($query)
    {
        return $query->where('status_verifikasi', 'Diterima')
            ->whereHas('pengguna', function ($q) {
                $q->where('status_akun', 'Aktif');
            });
    }

    public function nib()
    {
        return $this->hasOne(Nib::class, 'id_perusahaan', 'id_perusahaan');
    }
}
