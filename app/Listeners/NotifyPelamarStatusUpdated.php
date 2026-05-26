<?php

namespace App\Listeners;

use App\Events\LamaranStatusUpdated;
use App\Events\StatusLamaranDiperbarui;
use App\Notifications\LamaranStatusUpdatedNotification;
use Illuminate\Support\Facades\Log;

class NotifyPelamarStatusUpdated
{
    public function handle(LamaranStatusUpdated $event): void
    {
        $pelamar = $event->lamaran->profil->pengguna;
        if ($pelamar) {
            // 1. Send Laravel notification (handles mail and database)
            $pelamar->notify(new LamaranStatusUpdatedNotification($event->lamaran, $event->statusBaru, $event->namaKafe));

            // 2. Broadcast the real-time event to the frontend
            try {
                $posisi = $event->lamaran->lowongan->posisi ?? '';
                
                event(new StatusLamaranDiperbarui(
                    idPengguna:     $pelamar->id_pengguna,
                    statusBaru:     $event->statusBaru,
                    idLowongan:     $event->lamaran->id_lowongan,
                    posisi:         $posisi,
                    namaPerusahaan: $event->namaKafe
                ));
            } catch (\Exception $e) {
                Log::error('Gagal broadcast event status lamaran diperbarui: ' . $e->getMessage());
            }
        }
    }
}
