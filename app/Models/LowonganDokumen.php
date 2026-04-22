<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LowonganDokumen extends Model
{
    protected $table = 'lowongan_dokumen';
    protected $primaryKey = 'id_lowongan_dokumen';

    protected $fillable = [
        'id_lowongan',
        'id_jenis_dokumen',
        'wajib',
    ];

    public function lowongan()
    {
        return $this->belongsTo(Lowongan::class, 'id_lowongan', 'id_lowongan');
    }

    public function jenisDokumen()
    {
        return $this->belongsTo(JenisDokumen::class, 'id_jenis_dokumen', 'id_jenis_dokumen');
    }
}
