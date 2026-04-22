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

    public function lamaran()
    {
        return $this->belongsTo(Lamaran::class, 'id_lamaran', 'id_lamaran');
    }
}
