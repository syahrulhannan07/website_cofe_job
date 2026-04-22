<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PertanyaanLowongan extends Model
{
    protected $table = 'pertanyaan_lowongan';
    protected $primaryKey = 'id_pertanyaan';

    protected $fillable = [
        'id_lowongan',
        'pertanyaan',
        'tipe_jawaban',
    ];

    public function lowongan()
    {
        return $this->belongsTo(Lowongan::class, 'id_lowongan', 'id_lowongan');
    }
}
