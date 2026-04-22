<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Lowongan extends Model
{
    use SoftDeletes;

    protected $table = 'lowongan';
    protected $dates = ['deleted_at'];
    protected $primaryKey = 'id_lowongan';

    protected $fillable = [
        'id_perusahaan',
        'posisi',
        'deskripsi',
        'persyaratan',
        'batas_awal',
        'batas_akhir',
        'status',
    ];

    public function perusahaan()
    {
        return $this->belongsTo(ProfilPerusahaan::class, 'id_perusahaan', 'id_perusahaan');
    }

    public function dokumenDibutuhkan()
    {
        return $this->hasMany(LowonganDokumen::class, 'id_lowongan', 'id_lowongan');
    }

    public function pertanyaanSeleksi()
    {
        return $this->hasMany(PertanyaanLowongan::class, 'id_lowongan', 'id_lowongan');
    }

    public function lamaran()
    {
        return $this->hasMany(Lamaran::class, 'id_lowongan', 'id_lowongan');
    }
}
