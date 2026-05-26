<?php

namespace App\Events;

use App\Models\ProfilPerusahaan;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CompanyVerificationStatusChanged
{
    use Dispatchable, SerializesModels;

    public ProfilPerusahaan $perusahaan;
    public string $status;
    public ?string $alasan;

    public function __construct(ProfilPerusahaan $perusahaan, string $status, ?string $alasan = null)
    {
        $this->perusahaan = $perusahaan;
        $this->status = $status;
        $this->alasan = $alasan;
    }
}
