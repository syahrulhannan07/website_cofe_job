<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PengalamanKerja extends Model
{
    protected $table = 'pengalaman_kerja';
    protected $primaryKey = 'id_pengalaman';
    public $timestamps = false;

    protected $fillable = [
        'id_profil',
        'nama_perusahaan',
        'posisi',
        'tanggal_mulai',
        'tanggal_selesai',
        'deskripsi',
    ];

    protected $casts = [
        'tanggal_mulai' => 'date',
        'tanggal_selesai' => 'date',
    ];

    public function profilPelamar()
    {
        return $this->belongsTo(ProfilPelamar::class, 'id_profil', 'id_profil');
    }
}
