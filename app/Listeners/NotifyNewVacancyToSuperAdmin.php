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
            // Hindari duplikasi jika notifikasi baru saja dikirim dalam 5 detik terakhir
            $exists = \App\Models\Notifikasi::where('id_pengguna', $sa->id_pengguna)
                ->where('url', 'like', "%/super-admin/kelola-akun/lowongan/{$event->lowongan->id_lowongan}%")
                ->where('created_at', '>=', now()->subSeconds(5))
                ->exists();

            if (!$exists) {
                $sa->notify(new SuperAdminNewVacancyNotification($event->lowongan));
            }
        }
    }
}
