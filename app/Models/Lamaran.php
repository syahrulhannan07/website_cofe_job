<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Lamaran extends Model
{
    protected $table = 'lamaran';
    protected $primaryKey = 'id_lamaran';

    protected $fillable = [
        'id_lowongan',
        'id_profil',
        'status',
    ];

    public function lowongan()
    {
        return $this->belongsTo(Lowongan::class, 'id_lowongan', 'id_lowongan');
    }

    public function profil()
    {
        return $this->belongsTo(ProfilPelamar::class, 'id_profil', 'id_profil');
    }

    public function lamaranDokumen()
    {
        return $this->hasMany(LamaranDokumen::class, 'id_lamaran', 'id_lamaran');
    }

    public function jawabanPertanyaan()
    {
        return $this->hasMany(JawabanPertanyaan::class, 'id_lamaran', 'id_lamaran');
    }
}
