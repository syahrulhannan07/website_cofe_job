<?php

namespace App\Events;

use App\Models\Pengguna;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CompanyAccountStatusChanged
{
    use Dispatchable, SerializesModels;

    public Pengguna $pengguna;
    public string $status;

    public function __construct(Pengguna $pengguna, string $status)
    {
        $this->pengguna = $pengguna;
        $this->status = $status;
    }
}
