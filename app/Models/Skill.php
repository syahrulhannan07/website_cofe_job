<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Skill extends Model
{
    protected $table = 'skill';
    protected $primaryKey = 'id_skill';
    public $timestamps = false; // Berdasarkan migrasi tidak ada timestamps

    protected $fillable = [
        'id_profil',
        'nama_skill',
        'deskripsi',
    ];

    public function profilPelamar()
    {
        return $this->belongsTo(ProfilPelamar::class, 'id_profil', 'id_profil');
    }
}
