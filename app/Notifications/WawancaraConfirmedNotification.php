<?php

namespace App\Notifications;

use App\Models\Lamaran;
use App\Notifications\Channels\CustomDbChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class WawancaraConfirmedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public Lamaran $lamaran;

    public function __construct(Lamaran $lamaran)
    {
        $this->lamaran = $lamaran;
    }

    public function via($notifiable): array
    {
        // Kirim ke database (web/mobile) dan mail
        return [CustomDbChannel::class, 'mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        $namaPelamar = $this->lamaran->profil->nama_lengkap ?? 'Pelamar';
        $posisi = $this->lamaran->lowongan->posisi ?? 'Posisi';

        return (new MailMessage)
            ->subject("Jadwal Wawancara Dikonfirmasi: {$namaPelamar} ✅")
            ->line("Halo " . $notifiable->nama_pengguna . ",")
            ->line("Kandidat bernama {$namaPelamar} telah melihat dan mengonfirmasi jadwal wawancara untuk posisi {$posisi}.")
            ->line("Silakan periksa dashboard admin Anda untuk informasi lebih lanjut.")
            ->line("Terima kasih telah menggunakan Cafe Job!");
    }

    public function toDatabase($notifiable): array
    {
        $namaPelamar = $this->lamaran->profil->nama_lengkap ?? 'Pelamar';
        $posisi = $this->lamaran->lowongan->posisi ?? 'Posisi';

        return [
            'judul' => "Jadwal Wawancara Dikonfirmasi ✅",
            'pesan' => "Kandidat {$namaPelamar} telah melihat dan mengonfirmasi jadwal wawancara untuk posisi {$posisi}.",
            // Deep-link ke halaman pelamar di admin
            'url'   => "/admin/pelamar?id_pelamar={$this->lamaran->id_profil}&id_lamaran={$this->lamaran->id_lamaran}",
        ];
    }
}
