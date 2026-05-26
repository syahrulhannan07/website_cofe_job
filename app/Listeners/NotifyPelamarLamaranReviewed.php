<?php

namespace App\Listeners;

use App\Events\LamaranReviewed;
use App\Events\StatusLamaranDiperbarui;
use App\Notifications\LamaranReviewedNotification;
use Illuminate\Support\Facades\Log;

class NotifyPelamarLamaranReviewed
{
    public function handle(LamaranReviewed $event): void
    {
        $pelamar = $event->lamaran->profil->pengguna;
        if ($pelamar) {
            // 1. Send Laravel notification (handles mail and database)
            $pelamar->notify(new LamaranReviewedNotification($event->lamaran));

            // 2. Broadcast the real-time event to the frontend
            try {
                $namaKafe = $event->lamaran->lowongan->perusahaan->nama_perusahaan ?? 'Kafe';
                $posisi = $event->lamaran->lowongan->posisi ?? '';
                
                event(new StatusLamaranDiperbarui(
                    idPengguna:     $pelamar->id_pengguna,
                    statusBaru:     'Dalam Review',
                    idLowongan:     $event->lamaran->id_lowongan,
                    posisi:         $posisi,
                    namaPerusahaan: $namaKafe
                ));
            } catch (\Exception $e) {
                Log::error('Gagal broadcast event status lamaran dalam review: ' . $e->getMessage());
            }
        }
    }
}
