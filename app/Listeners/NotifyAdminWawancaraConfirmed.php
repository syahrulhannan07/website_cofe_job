<?php

namespace App\Listeners;

use App\Events\WawancaraConfirmedByPelamar;
use App\Notifications\WawancaraConfirmedNotification;

class NotifyAdminWawancaraConfirmed
{
    /**
     * Handle the event.
     */
    public function handle(WawancaraConfirmedByPelamar $event): void
    {
        $admin = $event->lamaran->lowongan->perusahaan->pengguna;
        if ($admin) {
            $admin->notify(new WawancaraConfirmedNotification($event->lamaran));
        }
    }
}
