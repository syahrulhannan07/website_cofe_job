<?php

namespace App\Notifications;

use App\Notifications\Channels\CustomDbChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use NotificationChannels\Fcm\FcmChannel;
use NotificationChannels\Fcm\FcmMessage;
use NotificationChannels\Fcm\Resources\Notification as FcmNotification;
use Illuminate\Notifications\Messages\MailMessage;

class NewApplicantRegisteredNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct()
    {
        //
    }

    public function via($notifiable): array
    {
        return [CustomDbChannel::class, 'mail', FcmChannel::class,];
    }

    public function toDatabase($notifiable): array
    {
        return [
            'judul' => 'Registrasi Berhasil! 🎉',
            'pesan' => 'Selamat datang di Cafe Job! Lengkapi profil Anda untuk mulai melamar pekerjaan.',
            'url'   => '/profil',
        ];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Registrasi Berhasil! 🎉')
            ->line('Halo ' . $notifiable->nama_pengguna . ',')
            ->line('Selamat datang di Cafe Job!')
            ->line('Akun Anda telah berhasil dibuat.')
            ->line('Lengkapi profil Anda agar dapat mulai melamar pekerjaan yang tersedia.')
            ->line('Semoga Anda segera menemukan pekerjaan yang sesuai.');
    }

    public function toFcm($notifiable): FcmMessage
    {
        return new FcmMessage(
            notification: new FcmNotification(
                title: 'Registrasi Berhasil! 🎉',
                body: 'Selamat datang di Cafe Job! Lengkapi profil Anda untuk mulai melamar pekerjaan.'
            ),
            data: [
                'click_action' => 'FLUTTER_NOTIFICATION_CLICK',
                'tipe' => 'registrasi_berhasil',
                'route' => '/profil',
            ]
        );
    }
}
