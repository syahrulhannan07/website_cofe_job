<?php

namespace App\Listeners;

use App\Events\LamaranSubmitted;
use App\Notifications\NewApplicationNotification;

class NotifyNewApplicationToCompany
{
    public function handle(LamaranSubmitted $event): void
    {
        $owner = $event->lamaran->lowongan->perusahaan->pengguna;
        if ($owner) {
            $owner->notify(new NewApplicationNotification($event->lamaran));
        }
    }
}
