<?php

namespace App\Notifications\Channels;

use Illuminate\Notifications\Notification;
use App\Models\Notifikasi;

class CustomDbChannel
{
    /**
     * Send the given notification.
     * Menyimpan notifikasi ke tabel `notifikasi` custom beserta URL deep-link.
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
            'url'         => $data['url'] ?? null,   // deep-link untuk navigasi frontend
            'dibaca'      => false,
        ]);
    }
}
