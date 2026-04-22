<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LogStatusLamaran extends Model
{
    protected $table = 'log_status_lamaran';
    public $timestamps = false; // Kita pakai 'dibuat_pada' manual atau useCurrent()

    protected $fillable = [
        'id_lamaran',
        'status_lama',
        'status_baru',
        'keterangan',
        'dibuat_pada',
    ];

    public function lamaran()
    {
        return $this->belongsTo(Lamaran::class, 'id_lamaran', 'id_lamaran');
    }
}
