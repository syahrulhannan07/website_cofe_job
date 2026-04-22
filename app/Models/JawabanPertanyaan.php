<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JawabanPertanyaan extends Model
{
    protected $table = 'jawaban_pertanyaan';
    protected $primaryKey = 'id_jawaban';

    protected $fillable = [
        'id_lamaran',
        'id_pertanyaan',
        'jawaban',
    ];

    public function lamaran()
    {
        return $this->belongsTo(Lamaran::class, 'id_lamaran', 'id_lamaran');
    }

    public function pertanyaan()
    {
        return $this->belongsTo(PertanyaanLowongan::class, 'id_pertanyaan', 'id_pertanyaan');
    }
}
