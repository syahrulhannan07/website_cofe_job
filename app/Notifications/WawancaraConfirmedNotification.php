<?php

namespace App\Notifications;

use App\Models\Lamaran;
use App\Notifications\Channels\CustomDbChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use NotificationChannels\Fcm\FcmChannel;
use NotificationChannels\Fcm\FcmMessage;
use NotificationChannels\Fcm\Resources\Notification as FcmNotification;

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
        return [CustomDbChannel::class, 'mail', FcmChannel::class,];
    }

    public function viaConnections(): array
    {
        // In-app attendance must be visible immediately, even when remote channels use a worker.
        return [CustomDbChannel::class => 'sync'];
    }

    public function toMail($notifiable): MailMessage
    {
        $namaPelamar = $this->lamaran->profil->nama_lengkap ?? 'Pelamar';
        $posisi = $this->lamaran->lowongan->posisi ?? 'Posisi';

        return (new MailMessage)
            ->subject("Pelamar Hadir dan Siap Diwawancarai: {$namaPelamar} ✅")
            ->line("Halo " . $notifiable->nama_pengguna . ",")
            ->line("Identitas {$namaPelamar} telah terverifikasi melalui verifikasi wajah. Kandidat hadir dan siap diwawancarai untuk posisi {$posisi}.")
            ->line("Silakan periksa dashboard admin Anda untuk informasi lebih lanjut.")
            ->line("Terima kasih telah menggunakan Cafe Job!");
    }

    public function toDatabase($notifiable): array
    {
        $namaPelamar = $this->lamaran->profil->nama_lengkap ?? 'Pelamar';
        $posisi = $this->lamaran->lowongan->posisi ?? 'Posisi';

        return [
            'judul' => "Pelamar Hadir dan Siap Diwawancarai ✅",
            'pesan' => "Identitas {$namaPelamar} telah terverifikasi melalui verifikasi wajah. Kandidat hadir dan siap diwawancarai untuk posisi {$posisi}.",
            // Deep-link ke halaman pelamar di admin
            'url'   => "/admin/pelamar?id_pelamar={$this->lamaran->id_profil}&id_lamaran={$this->lamaran->id_lamaran}",
        ];
    }

    public function toFcm($notifiable): FcmMessage
    {
        $namaPelamar = $this->lamaran->profil->nama_lengkap ?? 'Pelamar';
        $posisi = $this->lamaran->lowongan->posisi ?? 'Posisi';

        return new FcmMessage(
            notification: new FcmNotification(
                title: "Pelamar Hadir dan Siap Diwawancarai ✅",
                body: "Identitas {$namaPelamar} terverifikasi. Kandidat hadir dan siap diwawancarai untuk posisi {$posisi}."
            ),
            data: [
                'click_action' => 'FLUTTER_NOTIFICATION_CLICK',
                'id_lamaran' => (string) $this->lamaran->id_lamaran,
                'id_profil' => (string) $this->lamaran->id_profil,
                'tipe' => 'wawancara_dikonfirmasi',
                'route' => "/admin/pelamar?id_pelamar={$this->lamaran->id_profil}&id_lamaran={$this->lamaran->id_lamaran}",
            ]
        );
    }
}
