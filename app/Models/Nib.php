<?php

namespace App\Models;

use App\Enums\StatusScreening;
use Illuminate\Database\Eloquent\Model;

class Nib extends Model
{
    protected $table = 'nib';
    protected $primaryKey = 'id_nib';

    const CREATED_AT = 'dibuat_pada';
    const UPDATED_AT = 'diperbarui_pada';

    protected $fillable = [
        'id_perusahaan',
        'nomor_nib',
        'dokumen_nib',
        'data_qr',
        'hasil_screening',
        'status_screening',
        'diperiksa_pada',
    ];

    protected $casts = [
        'data_qr' => 'array',
        'status_screening' => StatusScreening::class,
        'diperiksa_pada' => 'datetime',
        'dibuat_pada' => 'datetime',
        'diperbarui_pada' => 'datetime',
    ];

    public function profilPerusahaan()
    {
        return $this->belongsTo(ProfilPerusahaan::class, 'id_perusahaan', 'id_perusahaan');
    }
}