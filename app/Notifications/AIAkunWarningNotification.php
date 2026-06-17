<?php

namespace App\Notifications;

use App\Models\Lowongan;
use App\Notifications\Channels\CustomDbChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AIAkunWarningNotification extends Notification implements ShouldQueue
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
            ->subject("Peringatan: Lowongan Anda Memerlukan Perbaikan ⚠️")
            ->greeting("Halo {$namaPerusahaan},")
            ->line("Sistem keamanan kami mendeteksi bahwa lowongan berikut memerlukan perhatian Anda:")
            ->line("")
            ->line("📌 Posisi: " . ($this->lowongan?->posisi ?? '-'))
            ->line("📊 Skor Deteksi: {$this->skor}")
            ->line("")
            ->line("Akun Anda saat ini dinonaktifkan sementara. Anda masih dapat login dengan akses terbatas (read-only).")
            ->line("Silakan perbaiki lowongan Anda dan hubungi Super Admin untuk mengaktifkan kembali akun Anda.")
            ->line("")
            ->line("Jika Anda merasa ini adalah kesalahan, silakan hubungi tim dukungan kami.");
    }

    public function toDatabase($notifiable): array
    {
        return [
            'judul' => 'Peringatan: Perbaiki Lowongan Anda ⚠️',
            'pesan' => 'Lowongan Anda terdeteksi tidak sesuai standar. Akun Anda dinonaktifkan sementara. Silakan perbaiki dan hubungi Super Admin untuk mengaktifkan kembali.',
            'url'   => '/admin/lowongan',
        ];
    }
}
