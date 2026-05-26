<?php

namespace App\Notifications;

use App\Notifications\Channels\CustomDbChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CompanyAccountStatusNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public string $status;

    public function __construct(string $status)
    {
        $this->status = $status;
    }

    public function via($notifiable): array
    {
        return [CustomDbChannel::class, 'mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        $namaPengguna = $notifiable->nama_pengguna ?? 'Admin';
        
        if ($this->status === 'Aktif') {
            return (new MailMessage)
                ->subject("Akun Diaktifkan Kembali 🎉")
                ->line("Halo {$namaPengguna},")
                ->line("Akun admin kafe Anda telah diaktifkan kembali. Anda sekarang dapat mengakses dashboard dan melakukan semua aktivitas seperti biasa.")
                ->line("Terima kasih atas kesabaran Anda.");
        } elseif ($this->status === 'Nonaktif') {
            return (new MailMessage)
                ->subject("Akun Dinonaktifkan ⚠️")
                ->line("Halo {$namaPengguna},")
                ->line("Akun admin kafe Anda saat ini dinonaktifkan.")
                ->line("Anda masih dapat masuk ke dalam dashboard, namun dengan akses terbatas (hanya dapat membaca/melihat data tanpa bisa membuat atau merubah data apa pun).")
                ->line("Pihak Super Admin dapat dihubungi apabila Anda mendapati adanya kesalahan.");
        } else {
            // Diblokir
            return (new MailMessage)
                ->subject("Akun Diblokir ❌")
                ->line("Halo {$namaPengguna},")
                ->line("Akun admin kafe Anda telah ditangguhkan/diblokir oleh Super Admin.")
                ->line("Anda tidak akan dapat melakukan login ke dashboard selama status akun Anda diblokir.")
                ->line("Hubungi layanan bantuan kami jika Anda ingin mengajukan keberatan.");
        }
    }

    public function toDatabase($notifiable): array
    {
        if ($this->status === 'Aktif') {
            return [
                'judul' => 'Akun Diaktifkan Kembali 🎉',
                'pesan' => 'Akun admin kafe Anda telah diaktifkan kembali oleh Super Admin.',
            ];
        } elseif ($this->status === 'Nonaktif') {
            return [
                'judul' => 'Akun Dinonaktifkan ⚠️',
                'pesan' => 'Akun admin kafe Anda telah dinonaktifkan. Hak akses Anda kini diubah menjadi Read-Only.',
            ];
        } else {
            return [
                'judul' => 'Akun Diblokir ❌',
                'pesan' => 'Akun admin kafe Anda telah diblokir. Anda kehilangan akses untuk masuk ke dashboard.',
            ];
        }
    }
}
