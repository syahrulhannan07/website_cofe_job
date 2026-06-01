<?php

namespace App\Notifications;

use App\Models\Lamaran;
use App\Notifications\Channels\CustomDbChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class LamaranSubmittedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public Lamaran $lamaran;

    public function __construct(Lamaran $lamaran)
    {
        $this->lamaran = $lamaran;
    }

    public function via($notifiable): array
    {
        return [CustomDbChannel::class, 'mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        $namaKafe = $this->lamaran->lowongan->perusahaan->nama_perusahaan ?? 'Kafe';
        $posisi = $this->lamaran->lowongan->posisi ?? 'posisi';
        return (new MailMessage)
            ->subject("Lamaran Terkirim Sukses! 📂")
            ->line("Halo " . $notifiable->nama_pengguna . ",")
            ->line("Lamaran Anda untuk posisi {$posisi} di {$namaKafe} telah berhasil terkirim.")
            ->line("Kami akan meninjau lamaran Anda dan memberikan informasi lebih lanjut secepatnya.")
            ->line("Terima kasih telah mempercayai Cafe Job!");
    }

    public function toDatabase($notifiable): array
    {
        $namaKafe = $this->lamaran->lowongan->perusahaan->nama_perusahaan ?? 'Kafe';
        $posisi = $this->lamaran->lowongan->posisi ?? 'posisi';
        return [
            'judul' => 'Lamaran Berhasil Terkirim 📂',
            'pesan' => "Lamaran Anda untuk posisi {$posisi} di {$namaKafe} telah berhasil dikirim. Menunggu proses selanjutnya.",
            // Deep-link: Menampilkan status lamaran dan membuka tracking timeline
            'url'   => "/status-lamaran/{$this->lamaran->id_lamaran}?action=open_timeline",
        ];
    }
}
