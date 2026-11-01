<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\ValidationException;

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

    public function assertScheduleEditable(): void
    {
        if ($this->presensi()->exists()) {
            throw ValidationException::withMessages([
                'id_wawancara' => 'Jadwal wawancara tidak dapat diubah setelah presensi tercatat. Anda tetap dapat menyelesaikan wawancara.',
            ]);
        }
    }

    public function presensi()
    {
        return $this->hasOne(PresensiWawancara::class, 'id_wawancara', 'id_wawancara');
    }

    public function verifikasiWajah()
    {
        return $this->hasMany(VerifikasiWajah::class, 'id_wawancara', 'id_wawancara');
    }

    public function alasanPresensi(Lamaran $lamaran): ?string
    {
        if ($this->presensi) {
            return 'Presensi wawancara sudah tercatat.';
        }
        if ($lamaran->status !== 'Wawancara' || $this->status !== 'Terjadwal') {
            return 'Jadwal wawancara tidak aktif.';
        }
        if (!$this->tanggal_wawancara->isSameDay(now(config('app.timezone')))) {
            return 'Presensi hanya tersedia pada tanggal wawancara.';
        }
        if (empty($lamaran->profil?->foto_profil)) {
            return 'Lengkapi foto profil sebelum melakukan presensi.';
        }

        return null;
    }

    public function attendanceData(Lamaran $lamaran): array
    {
        $reason = $this->alasanPresensi($lamaran);

        return [
            'id_wawancara' => $this->id_wawancara,
            'presensi' => $this->presensi?->responseData(),
            'can_presensi' => $reason === null,
            'alasan_presensi' => $reason,
        ];
    }

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
