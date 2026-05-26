<?php

namespace App\Listeners;

use App\Events\CompanyAccountStatusChanged;
use App\Notifications\CompanyAccountStatusNotification;

class NotifyCompanyOfAccountStatusChange
{
    public function handle(CompanyAccountStatusChanged $event): void
    {
        $pengguna = $event->pengguna;
        if ($pengguna) {
            $pengguna->notify(new CompanyAccountStatusNotification($event->status));
        }
    }
}
