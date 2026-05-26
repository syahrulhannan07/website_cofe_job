<?php

namespace App\Notifications;

use App\Models\ProfilPerusahaan;
use App\Notifications\Channels\CustomDbChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewCompanyRegisteredNotification extends Notification implements ShouldQueue
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
        $namaKafe = $this->perusahaan->nama_perusahaan ?? 'Kafe Baru';
        $emailKafe = $this->perusahaan->pengguna->email ?? '-';
        return (new MailMessage)
            ->subject("Pendaftaran Kafe Baru: {$namaKafe} 🏢")
            ->line("Halo Super Admin,")
            ->line("Ada pendaftaran kafe baru yang memerlukan tinjauan dan verifikasi Anda:")
            ->line("Nama Kafe: {$namaKafe}")
            ->line("Email Pengelola: {$emailKafe}")
            ->line("Alamat: " . ($this->perusahaan->alamat_perusahaan ?? '-'))
            ->line("Tinjauan dokumen legalitas serta proses verifikasi ini dapat dilakukan melalui Dashboard Super Admin.");
    }

    public function toDatabase($notifiable): array
    {
        $namaKafe = $this->perusahaan->nama_perusahaan ?? 'Kafe Baru';
        return [
            'judul' => 'Pendaftaran Kafe Baru 🏢',
            'pesan' => "Kafe {$namaKafe} telah mendaftar dan menunggu verifikasi dokumen oleh Super Admin.",
        ];
    }
}
