<?php

namespace App\Listeners;

use App\Events\WawancaraUpdated;
use App\Notifications\WawancaraUpdatedNotification;

class NotifyPelamarWawancaraUpdated
{
    public function handle(WawancaraUpdated $event): void
    {
        $pelamar = $event->wawancara->lamaran?->profil?->pengguna;
        if ($pelamar) {
            // Send Laravel notification (handles mail and database)
            $pelamar->notify(new WawancaraUpdatedNotification($event->wawancara, $event->namaKafe));
        }
    }
}
