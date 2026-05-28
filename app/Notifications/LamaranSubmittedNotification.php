<?php

namespace App\Notifications;

use App\Models\Lamaran;
use App\Notifications\Channels\CustomDbChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class LamaranSubmittedNotification extends Notification implements ShouldQueue, ShouldBroadcast
{
    use Queueable;

    public Lamaran $lamaran;

    public function __construct(Lamaran $lamaran)
    {
        $this->lamaran = $lamaran;
    }

    public function via($notifiable): array
    {
        return [CustomDbChannel::class, 'mail', 'broadcast'];
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
            'pesan' => "Lamaran Anda untuk posisi {$posisi} di {$namaKafe} telah sukses terkirim.",
        ];
    }

    public function toBroadcast($notifiable): BroadcastMessage
    {
        $namaKafe = $this->lamaran->lowongan->perusahaan->nama_perusahaan ?? 'Kafe';
        $posisi = $this->lamaran->lowongan->posisi ?? 'posisi';
        return new BroadcastMessage([
            'judul' => 'Lamaran Berhasil Terkirim 📂',
            'pesan' => "Lamaran Anda untuk posisi {$posisi} di {$namaKafe} telah sukses terkirim.",
            'created_at' => now()->toIso8601String(),
        ]);
    }
}