<?php

namespace App\Notifications;

use App\Models\Lowongan;
use App\Notifications\Channels\CustomDbChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewVacancyNotification extends Notification implements ShouldQueue, ShouldBroadcast
{
    use Queueable;

    public Lowongan $lowongan;

    public function __construct(Lowongan $lowongan)
    {
        $this->lowongan = $lowongan;
    }

    public function via($notifiable): array
    {
        return [CustomDbChannel::class, 'mail', 'broadcast'];
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

    public function toBroadcast($notifiable): BroadcastMessage
    {
        $namaKafe = $this->lowongan->perusahaan?->nama_perusahaan ?? 'Kafe Baru';
        return new BroadcastMessage([
            'judul' => "Lowongan Baru: {$this->lowongan->posisi}",
            'pesan' => "Kafe {$namaKafe} sedang membuka lowongan pekerjaan baru untuk posisi {$this->lowongan->posisi}.",
            'created_at' => now()->toIso8601String(),
        ]);
    }
}