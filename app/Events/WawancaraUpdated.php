<?php

namespace App\Events;

use App\Models\Wawancara;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class WawancaraUpdated
{
    use Dispatchable, SerializesModels;

    public Wawancara $wawancara;
    public string $namaKafe;

    public function __construct(Wawancara $wawancara, string $namaKafe)
    {
        $this->wawancara = $wawancara;
        $this->namaKafe = $namaKafe;
    }
}
