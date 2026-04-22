<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JenisDokumen extends Model
{
    protected $table = 'jenis_dokumen';
    protected $primaryKey = 'id_jenis_dokumen';

    protected $fillable = [
        'nama_dokumen',
    ];
}
