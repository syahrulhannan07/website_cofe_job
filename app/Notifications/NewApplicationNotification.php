<?php

namespace App\Notifications;

use App\Models\Lamaran;
use App\Notifications\Channels\CustomDbChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewApplicationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public Lamaran $lamaran;

    public function __construct(Lamaran $lamaran)
    {
        $this->lamaran = $lamaran;
    }

    public function via($notifiable): array
    {
        return [CustomDbChannel::class, 'mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        $posisi = $this->lamaran->lowongan->posisi ?? 'posisi';
        $namaPelamar = $this->lamaran->profil->nama_lengkap ?? 'Kandidat';
        return (new MailMessage)
            ->subject("Lamaran Baru Masuk! 📂")
            ->line("Halo " . $notifiable->nama_pengguna . ",")
            ->line("Kandidat baru bernama {$namaPelamar} baru saja mengirimkan lamaran untuk posisi {$posisi} di kafe Anda.")
            ->line("Detail profil dan dokumen kandidat dapat Anda periksa melalui dashboard admin kafe Anda.");
    }

    public function toDatabase($notifiable): array
    {
        $posisi = $this->lamaran->lowongan->posisi ?? 'posisi';
        $namaPelamar = $this->lamaran->profil->nama_lengkap ?? 'Kandidat';
        return [
            'judul' => "Lamaran Masuk Baru: {$posisi}",
            'pesan' => "Kandidat {$namaPelamar} telah mengajukan lamaran pekerjaan untuk posisi {$posisi}. Peninjauan berkas lamaran kini dapat dilakukan melalui dashboard Anda.",
            // Deep-link: Menambah tab baru (handled by frontend) dan membuka detail lamaran pelamar tertentu
            'url'   => "/admin/pelamar?id_pelamar={$this->lamaran->id_profil}&id_lamaran={$this->lamaran->id_lamaran}",
        ];
    }
}
