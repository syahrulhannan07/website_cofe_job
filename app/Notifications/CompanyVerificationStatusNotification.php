<?php

namespace App\Notifications;

use App\Models\ProfilPerusahaan;
use App\Notifications\Channels\CustomDbChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CompanyVerificationStatusNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public ProfilPerusahaan $perusahaan;
    public string $status;
    public ?string $alasan;

    public function __construct(ProfilPerusahaan $perusahaan, string $status, ?string $alasan = null)
    {
        $this->perusahaan = $perusahaan;
        $this->status = $status;
        $this->alasan = $alasan;
    }

    public function via($notifiable): array
    {
        return [CustomDbChannel::class, 'mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        $namaKafe = $this->perusahaan->nama_perusahaan ?? 'Kafe Anda';
        $email = $notifiable->email;

        if ($this->status === 'Diterima') {
            return (new MailMessage)
                ->subject("Akun Terverifikasi ✅ - {$namaKafe}")
                ->line("Selamat! Akun kafe Anda ({$namaKafe}) telah berhasil diverifikasi oleh Super Admin.")
                ->line("Kini Anda dapat menggunakan seluruh fitur di dashboard, termasuk memposting lowongan pekerjaan baru.")
                ->line("Terima kasih telah bergabung dengan platform Cafe Job!");
        } else {
            return (new MailMessage)
                ->subject("Pendaftaran Ditolak ❌ - {$namaKafe}")
                ->line("Mohon maaf, pendaftaran kafe Anda ({$namaKafe}) ditolak oleh Super Admin.")
                ->line("Alasan Penolakan: " . ($this->alasan ?? 'Dokumen atau informasi tidak valid.'))
                ->line("Peninjauan kembali profil Anda atau hubungi dukungan untuk informasi lebih lanjut jika diperlukan.");
        }
    }

    public function toDatabase($notifiable): array
    {
        $namaKafe = $this->perusahaan->nama_perusahaan ?? 'Kafe Anda';
        if ($this->status === 'Diterima') {
            return [
                'judul' => 'Akun Terverifikasi ✅',
                'pesan' => "Selamat! Akun kafe {$namaKafe} telah diverifikasi. Anda kini dapat memposting lowongan.",
            ];
        } else {
            return [
                'judul' => 'Pendaftaran Ditolak ❌',
                'pesan' => "Pendaftaran kafe {$namaKafe} ditolak dengan alasan: " . ($this->alasan ?? 'Dokumen tidak valid.'),
            ];
        }
    }
}
