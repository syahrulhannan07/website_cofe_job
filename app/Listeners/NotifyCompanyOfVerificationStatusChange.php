<?php

namespace App\Listeners;

use App\Events\CompanyVerificationStatusChanged;
use App\Notifications\CompanyVerificationStatusNotification;

class NotifyCompanyOfVerificationStatusChange
{
    public function handle(CompanyVerificationStatusChanged $event): void
    {
        $pengguna = $event->perusahaan->pengguna;
        if ($pengguna) {
            $pengguna->notify(new CompanyVerificationStatusNotification($event->perusahaan, $event->status, $event->alasan));
        }
    }
}
