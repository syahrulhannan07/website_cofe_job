<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pendidikan extends Model
{
    protected $table = 'pendidikan';
    protected $primaryKey = 'id_pendidikan';
    public $timestamps = false;

    protected $fillable = [
        'id_profil',
        'institusi',
        'jurusan',
        'tingkat',
        'tahun_mulai',
        'tahun_selesai',
    ];

    protected $casts = [
        'tahun_mulai' => 'date',
        'tahun_selesai' => 'date',
    ];

    public function profilPelamar()
    {
        return $this->belongsTo(ProfilPelamar::class, 'id_profil', 'id_profil');
    }
}
