<?php

namespace App\Notifications;

use App\Models\Pengguna;
use App\Notifications\Channels\CustomDbChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewApplicantRegisteredSuperAdminNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public Pengguna $pelamar;

    public function __construct(Pengguna $pelamar)
    {
        $this->pelamar = $pelamar;
    }

    public function via($notifiable): array
    {
        return [CustomDbChannel::class, 'mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Pendaftaran Pelamar Baru: {$this->pelamar->nama_pengguna} 👤")
            ->line("Halo Super Admin,")
            ->line("Seorang pelamar baru telah berhasil mendaftar di platform Cafe Job:")
            ->line("Nama Pengguna: {$this->pelamar->nama_pengguna}")
            ->line("Email: {$this->pelamar->email}")
            ->line("Anda dapat memantau aktivitas pendaftar ini melalui Dashboard Super Admin.");
    }

    public function toDatabase($notifiable): array
    {
        return [
            'judul' => 'Pendaftaran Pelamar Baru 👤',
            'pesan' => "Pelamar {$this->pelamar->nama_pengguna} ({$this->pelamar->email}) baru saja mendaftar di sistem.",
            'url'   => '/super-admin/dashboard',
        ];
    }
}
