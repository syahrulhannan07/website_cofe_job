<?php

namespace App\Notifications;

use App\Models\ProfilPerusahaan;
use App\Notifications\Channels\CustomDbChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CompanyRegistrationReceivedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public ProfilPerusahaan $perusahaan;

    public function __construct(ProfilPerusahaan $perusahaan)
    {
        $this->perusahaan = $perusahaan;
    }

    public function via($notifiable): array
    {
        return [CustomDbChannel::class, 'mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        $namaKafe = $this->perusahaan->nama_perusahaan ?? 'Kafe Anda';
        return (new MailMessage)
            ->subject("Registrasi Berhasil! 🎉 — {$namaKafe}")
            ->greeting("Halo {$notifiable->nama_pengguna},")
            ->line("Selamat! Pendaftaran akun kafe **{$namaKafe}** telah berhasil kami terima.")
            ->line("Saat ini berkas pendaftaran Anda sedang dalam proses peninjauan dan verifikasi oleh Super Admin.")
            ->line("Kami akan mengabari Anda setelah akun disetujui atau memerlukan tindakan lebih lanjut.")
            ->line("Terima kasih telah bergabung dengan platform Cafe Job!");
    }

    public function toDatabase($notifiable): array
    {
        $namaKafe = $this->perusahaan->nama_perusahaan ?? 'Kafe Anda';
        return [
            'judul' => 'Registrasi Berhasil! 🎉',
            'pesan' => "Pendaftaran akun kafe {$namaKafe} berhasil. Akun Anda sedang ditinjau oleh Super Admin.",
            'url'   => '/admin/profil',
        ];
    }
}
