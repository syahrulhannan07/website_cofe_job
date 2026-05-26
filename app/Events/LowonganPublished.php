<?php

namespace App\Events;

use App\Models\Lowongan;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LowonganPublished
{
    use Dispatchable, SerializesModels;

    public Lowongan $lowongan;

    public function __construct(Lowongan $lowongan)
    {
        $this->lowongan = $lowongan;
    }
}
