<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LamaranDokumen extends Model
{
    protected $table = 'lamaran_dokumen';
    protected $primaryKey = 'id_lamaran_dokumen';

    protected $fillable = [
        'id_lamaran',
        'id_jenis_dokumen',
        'lokasi_file',
    ];

    public function lamaran()
    {
        return $this->belongsTo(Lamaran::class, 'id_lamaran', 'id_lamaran');
    }

    public function jenisDokumen()
    {
        return $this->belongsTo(JenisDokumen::class, 'id_jenis_dokumen', 'id_jenis_dokumen');
    }
}
