<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VerifikasiWajah extends Model
{
    protected $table = 'verifikasi_wajah';
    protected $primaryKey = 'id_verifikasi';
    protected $fillable = [
        'id_pengguna', 'id_lamaran', 'id_wawancara', 'jenis_verifikasi',
        'skor_kemiripan', 'ambang_batas', 'status_verifikasi', 'referensi_wajah', 'jadwal_wawancara',
    ];
    protected $casts = ['skor_kemiripan' => 'float', 'ambang_batas' => 'float', 'jadwal_wawancara' => 'datetime'];

    public function pengguna()
    {
        return $this->belongsTo(Pengguna::class, 'id_pengguna', 'id_pengguna');
    }

    public function lamaran()
    {
        return $this->belongsTo(Lamaran::class, 'id_lamaran', 'id_lamaran');
    }

    public function wawancara()
    {
        return $this->belongsTo(Wawancara::class, 'id_wawancara', 'id_wawancara');
    }

    public function presensi()
    {
        return $this->hasOne(PresensiWawancara::class, 'id_verifikasi_wajah', 'id_verifikasi');
    }
}
