<?php

namespace App\Events;

use App\Models\Lamaran;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class WawancaraConfirmedByPelamar
{
    use Dispatchable, SerializesModels;

    public Lamaran $lamaran;

    public function __construct(Lamaran $lamaran)
    {
        $this->lamaran = $lamaran;
    }
}
