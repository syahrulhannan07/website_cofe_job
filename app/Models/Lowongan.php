<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Carbon\Carbon;

class Lowongan extends Model
{
    use SoftDeletes;

    protected $table = 'lowongan';
    protected $dates = ['deleted_at'];
    protected $primaryKey = 'id_lowongan';

    protected $fillable = [
        'id_perusahaan',
        'posisi',
        'deskripsi',
        'persyaratan',
        'lokasi',
        'gaji',
        'batas_awal',
        'batas_akhir',
        'status',
    ];

    public function perusahaan()
    {
        return $this->belongsTo(ProfilPerusahaan::class, 'id_perusahaan', 'id_perusahaan');
    }

    public function dokumenDibutuhkan()
    {
        return $this->hasMany(LowonganDokumen::class, 'id_lowongan', 'id_lowongan');
    }

    public function pertanyaanSeleksi()
    {
        return $this->hasMany(PertanyaanLowongan::class, 'id_lowongan', 'id_lowongan');
    }

    public function lamaran()
    {
        return $this->hasMany(Lamaran::class, 'id_lowongan', 'id_lowongan');
    }

    /**
     * Scope untuk memfilter lowongan yang aktif dan berasal dari perusahaan yang terverifikasi serta akun admin aktif.
     */
    public function scopeAktifTerverifikasi($query)
    {
        return $query->where('status', 'Active')
            ->whereHas('perusahaan', function ($q) {
                $q->where('status_verifikasi', 'Diterima')
                  ->whereHas('pengguna', function ($u) {
                      $u->where('status_akun', 'Aktif');
                  });
            })
            ->where('batas_akhir', '>=', now()->toDateString());
    }

    /**
     * Get the dynamic status based on dates.
     */
    public function getStatusLabelAttribute()
    {
        // Jika status akun perusahaan belum disetujui atau akun admin tidak aktif -> Paksa Draft
        if ($this->perusahaan) {
            if ($this->perusahaan->status_verifikasi !== 'Diterima' || 
                ($this->perusahaan->pengguna && $this->perusahaan->pengguna->status_akun !== 'Aktif')) {
                return 'Draft';
            }
        }

        $today = Carbon::now('Asia/Jakarta')->format('Y-m-d');
        $start = Carbon::parse($this->batas_awal)->format('Y-m-d');
        $end   = Carbon::parse($this->batas_akhir)->format('Y-m-d');

        // Jika Belum Waktunya -> Paksa Draft
        if ($today < $start) {
            return 'Draft';
        }

        // Jika Sudah Lewat -> Paksa Closed
        if ($today > $end) {
            return 'Closed';
        }

        // Jika sedang dalam rentang tanggal -> Ikuti pilihan manual HR di database
        return $this->status;
    }

    protected $appends = ['status_label'];
}
