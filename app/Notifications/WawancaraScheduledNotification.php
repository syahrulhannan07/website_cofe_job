<?php

namespace App\Notifications;

use App\Models\Wawancara;
use App\Notifications\Channels\CustomDbChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class WawancaraScheduledNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public Wawancara $wawancara;
    public string $namaKafe;
    public string $posisi;

    public function __construct(Wawancara $wawancara, string $namaKafe, string $posisi)
    {
        $this->wawancara = $wawancara;
        $this->namaKafe = $namaKafe;
        $this->posisi = $posisi;
    }

    public function via($notifiable): array
    {
        return [CustomDbChannel::class, 'mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Undangan Wawancara: {$this->posisi} di {$this->namaKafe} 📞")
            ->line("Halo " . $notifiable->nama_pengguna . ",")
            ->line("Selamat! Anda mendapatkan undangan wawancara untuk posisi {$this->posisi} di {$this->namaKafe}.")
            ->line("Detail Jadwal:")
            ->line("Tanggal & Waktu: " . $this->wawancara->tanggal_wawancara)
            ->line("Tempat / Link: " . $this->wawancara->tempat_link)
            ->line("Lokasi: " . $this->wawancara->lokasi)
            ->line("Catatan: " . ($this->wawancara->catatan ?? '-'))
            ->line("Harap hadir 10 menit sebelum jadwal dimulai. Terima kasih!");
    }

    public function toDatabase($notifiable): array
    {
        return [
            'judul' => "Undangan Wawancara: {$this->posisi}",
            'pesan' => "Anda diundang untuk menghadiri sesi wawancara posisi {$this->posisi} di {$this->namaKafe}. Detail jadwal wawancara dapat Anda lihat melalui menu Status Lamaran.",
        ];
    }
}
