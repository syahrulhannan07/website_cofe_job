<?php

namespace App\Listeners;

use App\Events\LamaranSubmitted;
use App\Notifications\LamaranSubmittedNotification;

class NotifyLamaranSubmittedToPelamar
{
    public function handle(LamaranSubmitted $event): void
    {
        $pelamar = $event->lamaran->profil->pengguna;
        if ($pelamar) {
            $pelamar->notify(new LamaranSubmittedNotification($event->lamaran));
        }
    }
}
