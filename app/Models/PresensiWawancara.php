<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PresensiWawancara extends Model
{
    protected $table = 'presensi_wawancara';
    protected $primaryKey = 'id_presensi';
    protected $fillable = ['id_wawancara', 'id_pengguna', 'id_verifikasi_wajah', 'waktu_presensi', 'status_kehadiran'];
    protected $casts = ['waktu_presensi' => 'datetime'];

    public function wawancara()
    {
        return $this->belongsTo(Wawancara::class, 'id_wawancara', 'id_wawancara');
    }

    public function pengguna()
    {
        return $this->belongsTo(Pengguna::class, 'id_pengguna', 'id_pengguna');
    }

    public function verifikasiWajah()
    {
        return $this->belongsTo(VerifikasiWajah::class, 'id_verifikasi_wajah', 'id_verifikasi');
    }

    public function responseData(): array
    {
        return [
            'id_presensi' => $this->id_presensi,
            'id_wawancara' => $this->id_wawancara,
            'waktu_presensi' => $this->waktu_presensi->toIso8601String(),
            'status_kehadiran' => $this->status_kehadiran,
        ];
    }
}
