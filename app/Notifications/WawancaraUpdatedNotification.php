<?php

namespace App\Notifications;

use App\Models\Wawancara;
use App\Notifications\Channels\CustomDbChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use NotificationChannels\Fcm\FcmChannel;
use NotificationChannels\Fcm\FcmMessage;
use NotificationChannels\Fcm\Resources\Notification as FcmNotification;

class WawancaraUpdatedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public Wawancara $wawancara;
    public string $namaKafe;

    public function __construct(Wawancara $wawancara, string $namaKafe)
    {
        $this->wawancara = $wawancara;
        $this->namaKafe = $namaKafe;
    }

    public function via($notifiable): array
    {
        return [CustomDbChannel::class, 'mail', FcmChannel::class];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Perubahan Jadwal Wawancara: {$this->namaKafe} 🔄")
            ->line("Halo " . $notifiable->nama_pengguna . ",")
            ->line("Jadwal wawancara Anda di {$this->namaKafe} telah diperbarui.")
            ->line("Detail Jadwal Baru:")
            ->line("Tanggal & Waktu: " . $this->wawancara->tanggal_wawancara)
            ->line("Tempat / Link: " . $this->wawancara->tempat_link)
            ->line("Lokasi: " . $this->wawancara->lokasi)
            ->line("Catatan: " . ($this->wawancara->catatan ?? '-'))
            ->line("Harap tinjau jadwal baru Anda di aplikasi. Terima kasih!");
    }

    public function toDatabase($notifiable): array
    {
        return [
            'judul' => "Perubahan Jadwal Wawancara: {$this->namaKafe} 🔄",
            'pesan' => "Jadwal wawancara Anda di {$this->namaKafe} diubah menjadi {$this->wawancara->tanggal_wawancara}.",
        ];
    }

    public function toFcm($notifiable): FcmMessage
    {
        return (new FcmMessage())
            ->setNotification(FcmNotification::create()
                ->title("Perubahan Jadwal Wawancara: {$this->namaKafe} 🔄")
                ->body("Jadwal wawancara Anda diubah menjadi {$this->wawancara->tanggal_wawancara}."))
            ->setData([
                'click_action' => 'FLUTTER_NOTIFICATION_CLICK',
                'id_wawancara' => (string) $this->wawancara->id,
                'tipe' => 'wawancara_diperbarui'
            ]);
    }
}