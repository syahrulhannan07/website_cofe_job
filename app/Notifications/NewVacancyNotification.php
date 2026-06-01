<?php

namespace App\Notifications;

use App\Models\Lowongan;
use App\Notifications\Channels\CustomDbChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use NotificationChannels\Fcm\FcmChannel;
use NotificationChannels\Fcm\FcmMessage;
use NotificationChannels\Fcm\Resources\Notification as FcmNotification;

class NewVacancyNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public Lowongan $lowongan;

    public function __construct(Lowongan $lowongan)
    {
        $this->lowongan = $lowongan;
    }

    public function via($notifiable): array
    {
        return [CustomDbChannel::class, 'mail', FcmChannel::class];
    }

    public function toMail($notifiable): MailMessage
    {
        $namaKafe = $this->lowongan->perusahaan?->nama_perusahaan ?? 'Kafe Baru';
        return (new MailMessage)
            ->subject("Lowongan Baru di {$namaKafe} ☕")
            ->line("Kabar gembira! {$namaKafe} baru saja membuka lowongan baru untuk posisi {$this->lowongan->posisi}.")
            ->line("Lokasi: " . ($this->lowongan->lokasi ?? '-'))
            ->line("Gaji: " . ($this->lowongan->gaji ?? '-'))
            ->line("Batas Akhir Pendaftaran: " . ($this->lowongan->batas_akhir ?? '-'))
            ->line("Segera kirimkan lamaran Anda sebelum terlambat!");
    }

    public function toDatabase($notifiable): array
    {
        $namaKafe = $this->lowongan->perusahaan?->nama_perusahaan ?? 'Kafe Baru';
        return [
            'judul' => "Lowongan Baru: {$this->lowongan->posisi}",
            'pesan' => "Kafe {$namaKafe} sedang membuka lowongan pekerjaan baru untuk posisi {$this->lowongan->posisi}.",
        ];
    }

    public function toFcm($notifiable): FcmMessage
    {
        $namaKafe = $this->lowongan->perusahaan?->nama_perusahaan ?? 'Kafe Baru';
        
        return (new FcmMessage())
            ->setNotification(FcmNotification::create()
                ->title("Lowongan Baru: {$this->lowongan->posisi} ☕")
                ->body("Kafe {$namaKafe} sedang membuka lowongan pekerjaan baru."))
            ->setData([
                'click_action' => 'FLUTTER_NOTIFICATION_CLICK',
                'id_lowongan' => (string) $this->lowongan->id,
                'tipe' => 'lowongan_baru'
            ]);
    }
}