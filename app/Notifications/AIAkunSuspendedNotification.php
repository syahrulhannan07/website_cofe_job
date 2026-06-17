<?php

namespace App\Notifications;

use App\Models\Lowongan;
use App\Notifications\Channels\CustomDbChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AIAkunSuspendedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public ?Lowongan $lowongan,
        public int $skor
    ) {}

    public function via($notifiable): array
    {
        return [CustomDbChannel::class, 'mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        $namaPerusahaan = $notifiable->profilPerusahaan?->nama_perusahaan ?? $notifiable->nama_pengguna ?? 'Admin';

        return (new MailMessage)
            ->subject("Akun Diblokir Otomatis ❌")
            ->greeting("Halo {$namaPerusahaan},")
            ->line("Akun Anda telah diblokir otomatis oleh sistem keamanan kami karena melanggar ketentuan platform.")
            ->line("")
            ->line("📊 Skor Deteksi: {$this->skor}")
            ->line("")
            ->line("Semua lowongan aktif Anda telah ditutup.")
            ->line("Anda tidak akan dapat login ke dashboard selama status akun Anda diblokir.")
            ->line("")
            ->line("Jika Anda merasa ini adalah kesalahan, silakan hubungi Super Admin untuk mengajukan banding.");
    }

    public function toDatabase($notifiable): array
    {
        return [
            'judul' => 'Akun Diblokir Otomatis ❌',
            'pesan' => 'Akun Anda telah diblokir oleh sistem keamanan. Semua lowongan ditutup. Hubungi Super Admin untuk banding.',
            'url'   => null,
        ];
    }
}
