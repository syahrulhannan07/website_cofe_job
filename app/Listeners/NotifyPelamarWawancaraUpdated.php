<?php

namespace App\Listeners;

use App\Events\WawancaraUpdated;
use App\Notifications\WawancaraUpdatedNotification;

class NotifyPelamarWawancaraUpdated
{
    public function handle(WawancaraUpdated $event): void
    {
        // Resolve pelamar dari relasi: wawancara → lamaran → profil → pengguna
        $pelamar = $event->wawancara->lamaran?->profil?->pengguna;

        if ($pelamar) {
            // Kirim notifikasi dengan idLamaran untuk membangun deep-link yang benar
            $pelamar->notify(new WawancaraUpdatedNotification(
                $event->wawancara,
                $event->namaKafe,
                $event->idLamaran
            ));
        }
    }
}
