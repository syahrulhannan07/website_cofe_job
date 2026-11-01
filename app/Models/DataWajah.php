<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DataWajah extends Model
{
    protected $table = 'data_wajah';
    protected $primaryKey = 'id_data_wajah';
    protected $fillable = ['id_profil', 'referensi_wajah'];

    public function profil()
    {
        return $this->belongsTo(ProfilPelamar::class, 'id_profil', 'id_profil');
    }
}
