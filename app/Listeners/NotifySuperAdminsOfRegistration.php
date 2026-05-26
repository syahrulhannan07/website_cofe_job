<?php

namespace App\Listeners;

use App\Events\CompanyRegistered;
use App\Models\Pengguna;
use App\Notifications\NewCompanyRegisteredNotification;

class NotifySuperAdminsOfRegistration
{
    public function handle(CompanyRegistered $event): void
    {
        $superAdmins = Pengguna::where('peran', 'Super_Admin')->get();

        foreach ($superAdmins as $sa) {
            $sa->notify(new NewCompanyRegisteredNotification($event->perusahaan));
        }
    }
}
