<?php

namespace App\Listeners;

use App\Events\LowonganPublished;
use App\Models\Pengguna;
use App\Notifications\NewVacancyNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class NotifyNewVacancyToPelamar implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle(LowonganPublished $event): void
    {
        $pelamars = Pengguna::where('peran', 'Pelamar')->get();

        foreach ($pelamars as $pelamar) {
            $pelamar->notify(new NewVacancyNotification($event->lowongan));
        }
    }
}
