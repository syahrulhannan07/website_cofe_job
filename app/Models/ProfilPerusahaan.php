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
        'tanggal_berdiri',
        'deskripsi',
        'status_verifikasi',
        'alasan_penolakan',
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
}
