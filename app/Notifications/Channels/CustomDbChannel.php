<?php

namespace App\Notifications\Channels;

use Illuminate\Notifications\Notification;
use App\Models\Notifikasi;

class CustomDbChannel
{
    /**
     * Send the given notification.
     *
     * @param  mixed  $notifiable
     * @param  \Illuminate\Notifications\Notification  $notification
     * @return void
     */
    public function send($notifiable, Notification $notification): void
    {
        $data = $notification->toDatabase($notifiable);

        Notifikasi::create([
            'id_pengguna' => $notifiable->id_pengguna,
            'judul'       => $data['judul'] ?? 'Notifikasi Baru',
            'pesan'       => $data['pesan'] ?? '',
            'dibaca'      => false,
        ]);
    }
}
