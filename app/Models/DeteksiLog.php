<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeteksiLog extends Model
{
    protected $table = 'deteksi_log';
    protected $primaryKey = 'id_deteksi';
    public $timestamps = false;

    protected $fillable = [
        'id_pengguna',
        'id_lowongan',
        'skor_total',
        'tindakan',
        'detail_signal',
        'catatan',
        'dieksekusi_oleh',
        'dibuat_pada',
    ];

    protected function casts(): array
    {
        return [
            'detail_signal' => 'array',
            'dibuat_pada' => 'datetime',
        ];
    }

    public function pengguna()
    {
        return $this->belongsTo(Pengguna::class, 'id_pengguna', 'id_pengguna');
    }

    public function lowongan()
    {
        return $this->belongsTo(Lowongan::class, 'id_lowongan', 'id_lowongan');
    }
}
