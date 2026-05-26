<?php

namespace App\Events;

use App\Models\ProfilPerusahaan;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CompanyRegistered
{
    use Dispatchable, SerializesModels;

    public ProfilPerusahaan $perusahaan;

    public function __construct(ProfilPerusahaan $perusahaan)
    {
        $this->perusahaan = $perusahaan;
    }
}
