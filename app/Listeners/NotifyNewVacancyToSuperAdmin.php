<?php

namespace App\Listeners;

use App\Events\LowonganPublished;
use App\Models\Pengguna;
use App\Notifications\SuperAdminNewVacancyNotification;

class NotifyNewVacancyToSuperAdmin
{
    public function handle(LowonganPublished $event): void
    {
        $superAdmins = Pengguna::where('peran', 'Super_Admin')->get();

        foreach ($superAdmins as $sa) {
            $sa->notify(new SuperAdminNewVacancyNotification($event->lowongan));
        }
    }
}
