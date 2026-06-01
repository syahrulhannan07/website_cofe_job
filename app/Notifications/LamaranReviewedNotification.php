<?php

namespace App\Notifications;

use App\Models\Lamaran;
use App\Notifications\Channels\CustomDbChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use NotificationChannels\Fcm\FcmChannel;
use NotificationChannels\Fcm\FcmMessage; // 
use NotificationChannels\Fcm\Resources\Notification as FcmNotification;

class LamaranReviewedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public Lamaran $lamaran;

    public function __construct(Lamaran $lamaran)
    {
        $this->lamaran = $lamaran;
    }

    public function via($notifiable): array
    {
        return [CustomDbChannel::class, 'mail', FcmChannel::class];
    }

    public function toMail($notifiable): MailMessage
    {
        $namaKafe = $this->lamaran->lowongan->perusahaan->nama_perusahaan ?? 'Kafe';
        $posisi = $this->lamaran->lowongan->posisi ?? 'posisi';
        return (new MailMessage)
            ->subject("Lamaran Sedang Ditinjau 🔍")
            ->line("Halo " . $notifiable->nama_pengguna . ",")
            ->line("Lamaran Anda untuk posisi {$posisi} di {$namaKafe} saat ini sedang dibaca dan direview oleh HRD.")
            ->line("Pantau terus status lamaran Anda secara berkala di aplikasi Cafe Job.");
    }

    public function toDatabase($notifiable): array
    {
        $namaKafe = $this->lamaran->lowongan->perusahaan->nama_perusahaan ?? 'Kafe';
        $posisi = $this->lamaran->lowongan->posisi ?? 'posisi';
        return [
            'judul' => "Lamaran Ditinjau: {$posisi}",
            'pesan' => "Lamaran Anda untuk posisi {$posisi} di {$namaKafe} saat ini sedang ditinjau oleh pihak HRD.",
            // Deep-link: Menampilkan status lamaran dan membuka tracking timeline
            'url'   => "/status-lamaran/{$this->lamaran->id_lamaran}?action=open_timeline",
        ];
    }

    public function toFcm($notifiable): FcmMessage
    {
        $namaKafe = $this->lamaran->lowongan->perusahaan->nama_perusahaan ?? 'Kafe';
        $posisi = $this->lamaran->lowongan->posisi ?? 'posisi';

        return (new FcmMessage())
            ->setNotification(FcmNotification::create()
                ->title("Lamaran Ditinjau: {$posisi} 🔍")
                ->body("Lamaran Anda di {$namaKafe} sedang ditinjau oleh HRD."))
            ->setData([
                'click_action' => 'FLUTTER_NOTIFICATION_CLICK',
                'id_lamaran' => (string) $this->lamaran->id,
                'tipe' => 'lamaran_ditinjau'
            ]);
    }
}