<?php

namespace App\Events;

use App\Models\Lamaran;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LamaranStatusUpdated
{
    use Dispatchable, SerializesModels;

    public Lamaran $lamaran;
    public string $statusBaru;
    public string $namaKafe;

    public function __construct(Lamaran $lamaran, string $statusBaru, string $namaKafe)
    {
        $this->lamaran = $lamaran;
        $this->statusBaru = $statusBaru;
        $this->namaKafe = $namaKafe;
    }
}
