<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Lamaran extends Model
{
    protected $table = 'lamaran';
    protected $primaryKey = 'id_lamaran';

    protected $fillable = [
        'id_lowongan',
        'id_profil',
        'status',
    ];

    public function lowongan()
    {
        return $this->belongsTo(Lowongan::class, 'id_lowongan', 'id_lowongan');
    }

    public function profil()
    {
        return $this->belongsTo(ProfilPelamar::class, 'id_profil', 'id_profil');
    }

    public function lamaranDokumen()
    {
        return $this->hasMany(LamaranDokumen::class, 'id_lamaran', 'id_lamaran');
    }

    public function jawabanPertanyaan()
    {
        return $this->hasMany(JawabanPertanyaan::class, 'id_lamaran', 'id_lamaran');
    }

    public function logStatus()
    {
        return $this->hasMany(LogStatusLamaran::class, 'id_lamaran', 'id_lamaran');
    }

    public function wawancara()
    {
        return $this->hasOne(Wawancara::class, 'id_lamaran', 'id_lamaran');
    }

    protected static function booted()
    {
        // Log status saat pertama kali dibuat
        static::created(function ($lamaran) {
            LogStatusLamaran::create([
                'id_lamaran' => $lamaran->id_lamaran,
                'status_lama' => null,
                'status_baru' => $lamaran->status,
                'keterangan' => 'Lamaran berhasil dikirim.',
            ]);
        });

        // Log status saat diupdate
        static::updated(function ($lamaran) {
            if ($lamaran->isDirty('status')) {
                LogStatusLamaran::create([
                    'id_lamaran' => $lamaran->id_lamaran,
                    'status_lama' => $lamaran->getOriginal('status'),
                    'status_baru' => $lamaran->status,
                    'keterangan' => self::getKeteranganStatus($lamaran->status),
                ]);
            }
        });
    }

    private static function getKeteranganStatus($status)
    {
        return match ($status) {
            'Diproses' => 'Lamaran sedang ditinjau oleh pihak kafe.',
            'Wawancara' => 'Selamat! Anda diundang untuk mengikuti sesi wawancara.',
            'Diterima' => 'Selamat! Anda diterima bekerja di kafe ini.',
            'Ditolak' => 'Mohon maaf, lamaran Anda belum dapat diproses lebih lanjut.',
            default => 'Status lamaran diperbarui.',
        };
    }
}
