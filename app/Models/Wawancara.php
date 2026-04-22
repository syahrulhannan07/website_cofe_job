<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Wawancara extends Model
{
    protected $table = 'wawancara';
    protected $primaryKey = 'id_wawancara';

    protected $fillable = [
        'id_lamaran',
        'tanggal_wawancara',
        'lokasi',
        'catatan',
        'status',
    ];

    protected $casts = [
        'tanggal_wawancara' => 'datetime',
    ];

    public function lamaran()
    {
        return $this->belongsTo(Lamaran::class, 'id_lamaran', 'id_lamaran');
    }

    public function profil()
    {
        return $this->hasOneThrough(
            ProfilPelamar::class,
            Lamaran::class,
            'id_lamaran',   // FK on lamaran → wawancara
            'id_profil',    // FK on profil_pelamar → lamaran
            'id_lamaran',   // local key on wawancara
            'id_profil'     // local key on lamaran
        );
    }
}
