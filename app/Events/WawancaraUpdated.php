<?php

namespace App\Events;

use App\Models\Wawancara;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Poin 10 — Pembaruan Jadwal Wawancara
 * Diperluas dengan idLamaran agar listener dapat membangun deep-link URL yang benar.
 */
class WawancaraUpdated
{
    use Dispatchable, SerializesModels;

    public Wawancara $wawancara;
    public string $namaKafe;
    public int $idLamaran;

    public function __construct(Wawancara $wawancara, string $namaKafe, int $idLamaran)
    {
        $this->wawancara  = $wawancara;
        $this->namaKafe   = $namaKafe;
        $this->idLamaran  = $idLamaran;
    }
}
