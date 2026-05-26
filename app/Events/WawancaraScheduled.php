<?php

namespace App\Events;

use App\Models\Wawancara;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class WawancaraScheduled
{
    use Dispatchable, SerializesModels;

    public Wawancara $wawancara;
    public string $namaKafe;
    public string $posisi;
    public int $idPengguna;

    public function __construct(Wawancara $wawancara, string $namaKafe, string $posisi, int $idPengguna)
    {
        $this->wawancara = $wawancara;
        $this->namaKafe = $namaKafe;
        $this->posisi = $posisi;
        $this->idPengguna = $idPengguna;
    }
}
