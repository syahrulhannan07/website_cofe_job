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
            // 1. Kirim notifikasi (In-App via CustomDbChannel + Email Markdown)
            //    Pass idLamaran agar URL deep-link dapat dibangun dengan benar
            $pelamar->notify(new WawancaraScheduledNotification(
                $event->wawancara,
                $event->namaKafe,
                $event->posisi,
                (int) $event->wawancara->id_lamaran
            ));

            // 2. Broadcast real-time event ke frontend via WebSocket
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
