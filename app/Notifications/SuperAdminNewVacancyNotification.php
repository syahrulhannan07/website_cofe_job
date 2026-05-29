<?php

namespace App\Notifications;

use App\Models\Lowongan;
use App\Notifications\Channels\CustomDbChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SuperAdminNewVacancyNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public Lowongan $lowongan;

    public function __construct(Lowongan $lowongan)
    {
        $this->lowongan = $lowongan;
    }

    public function via($notifiable): array
    {
        return [CustomDbChannel::class, 'mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        $namaKafe = $this->lowongan->perusahaan?->nama_perusahaan ?? 'Kafe Baru';
        return (new MailMessage)
            ->subject("Audit Lowongan Baru: {$this->lowongan->posisi} di {$namaKafe} 🔍")
            ->line("Sebuah lowongan baru telah diterbitkan dalam sistem:")
            ->line("Perusahaan/Kafe: {$namaKafe}")
            ->line("Posisi: {$this->lowongan->posisi}")
            ->line("Alamat/Lokasi: " . ($this->lowongan->lokasi ?? '-'))
            ->line("Batas Akhir Pendaftaran: " . ($this->lowongan->batas_akhir ?? '-'))
            ->line("Peninjauan lowongan ini dapat dilakukan di panel moderasi super admin jika diperlukan.");
    }

    public function toDatabase($notifiable): array
    {
        $namaKafe = $this->lowongan->perusahaan?->nama_perusahaan ?? 'Kafe Baru';
        return [
            'judul' => "Audit Lowongan Baru: {$this->lowongan->posisi}",
            'pesan' => "Kafe {$namaKafe} baru saja menerbitkan lowongan baru untuk posisi {$this->lowongan->posisi}. Peninjauan dan audit lowongan kini dapat dilakukan pada panel moderasi jika diperlukan.",
            'url'   => "/super-admin/kelola-akun/lowongan/{$this->lowongan->id_lowongan}",
        ];
    }
}
