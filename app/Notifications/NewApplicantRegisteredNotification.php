<?php

namespace App\Notifications;

use App\Notifications\Channels\CustomDbChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class NewApplicantRegisteredNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct()
    {
        //
    }

    public function via($notifiable): array
    {
        return [CustomDbChannel::class];
    }

    public function toDatabase($notifiable): array
    {
        return [
            'judul' => 'Registrasi Berhasil! 🎉',
            'pesan' => 'Selamat datang di Cafe Job! Lengkapi profil Anda untuk mulai melamar pekerjaan.',
            'url'   => '/profil',
        ];
    }
}
