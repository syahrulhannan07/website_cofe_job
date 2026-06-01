<?php

namespace App\Notifications;

use App\Models\ProfilPerusahaan;
use App\Notifications\Channels\CustomDbChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Poin 4 — Verifikasi Perusahaan oleh Super Admin
 *
 * Penerima: Admin Perusahaan (In-App & Email)
 * Deep-link:
 *   - Diterima  → /admin?action=go_profil          (buka tab profil perusahaan)
 *   - Ditolak   → /admin?action=show_rejection_notice  (tampilkan pesan "cek email")
 */
class CompanyVerificationStatusNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public ProfilPerusahaan $perusahaan;
    public string $status;
    public ?string $alasan;

    public function __construct(ProfilPerusahaan $perusahaan, string $status, ?string $alasan = null)
    {
        $this->perusahaan = $perusahaan;
        $this->status     = $status;
        $this->alasan     = $alasan;
    }

    public function via($notifiable): array
    {
        return [CustomDbChannel::class, 'mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        $namaKafe = $this->perusahaan->nama_perusahaan ?? 'Kafe Anda';

        if ($this->status === 'Diterima') {
            // Email sederhana untuk persetujuan
            return (new MailMessage)
                ->subject("Akun Terverifikasi ✅ — {$namaKafe}")
                ->greeting("Halo {$notifiable->nama_pengguna},")
                ->line("Selamat! Akun kafe **{$namaKafe}** telah berhasil diverifikasi oleh Super Admin.")
                ->line("Kini Anda dapat menggunakan seluruh fitur dashboard, termasuk memposting lowongan pekerjaan baru.")
                ->action('Buka Dashboard', url('/admin'))
                ->line("Terima kasih telah bergabung dengan platform Cafe Job!");
        }

        // Ditolak → gunakan Markdown template profesional dengan alasan penolakan
        return (new MailMessage)
            ->subject("Pendaftaran Ditolak ❌ — {$namaKafe}")
            ->markdown('emails.verifikasi-ditolak', [
                'namaPengguna' => $notifiable->nama_pengguna,
                'namaKafe'     => $namaKafe,
                'alasan'       => $this->alasan ?? 'Dokumen atau informasi yang disubmit tidak memenuhi syarat.',
            ]);
    }

    public function toDatabase($notifiable): array
    {
        $namaKafe = $this->perusahaan->nama_perusahaan ?? 'Kafe Anda';

        if ($this->status === 'Diterima') {
            return [
                'judul' => 'Akun Terverifikasi ✅',
                'pesan' => "Selamat! Akun kafe {$namaKafe} telah diverifikasi. Anda kini dapat memposting lowongan.",
                // Deep-link: buka tab baru langsung ke halaman profil perusahaan
                'url'   => '/admin/profil',
            ];
        }

        return [
            'judul' => 'Pendaftaran Ditolak ❌',
            'pesan' => "Pendaftaran kafe {$namaKafe} ditolak. Silakan cek email Anda untuk detail alasan penolakan.",
            // Deep-link: buka tab baru, frontend tampilkan pesan "cek email untuk detail"
            'url'   => '/admin?action=show_rejection_notice',
        ];
    }
}
