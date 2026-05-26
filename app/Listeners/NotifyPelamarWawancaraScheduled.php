<?php

namespace App\Listeners;

use App\Events\WawancaraScheduled;
use App\Events\StatusLamaranDiperbarui;
use App\Notifications\WawancaraScheduledNotification;
use App\Models\Pengguna;
use Illuminate\Support\Facades\Log;

class NotifyPelamarWawancaraScheduled
{
    public function handle(WawancaraScheduled $event): void
    {
        $pelamar = Pengguna::find($event->idPengguna);
        if ($pelamar) {
            // 1. Send Laravel notification (handles mail and database)
            $pelamar->notify(new WawancaraScheduledNotification($event->wawancara, $event->namaKafe, $event->posisi));

            // 2. Broadcast the real-time event to the frontend
            try {
                $idLowongan = $event->wawancara->lamaran?->id_lowongan ?? 0;
                
                event(new StatusLamaranDiperbarui(
                    idPengguna:     $event->idPengguna,
                    statusBaru:     'Wawancara',
                    idLowongan:     $idLowongan,
                    posisi:         $event->posisi,
                    namaPerusahaan: $event->namaKafe
                ));
            } catch (\Exception $e) {
                Log::error('Gagal broadcast event status lamaran wawancara terjadwal: ' . $e->getMessage());
            }
        }
    }
}
