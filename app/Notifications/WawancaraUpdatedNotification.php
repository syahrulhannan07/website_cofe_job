<?php

namespace App\Notifications;

use App\Models\Wawancara;
use App\Notifications\Channels\CustomDbChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use NotificationChannels\Fcm\FcmChannel;
use NotificationChannels\Fcm\FcmMessage;
use NotificationChannels\Fcm\Resources\Notification as FcmNotification;
use App\Notifications\Channels\WhatsAppChannel;

/**
 * Poin 10 — Pembaruan Jadwal Wawancara
 *
 * Penerima: Pelamar (In-App & Email)
 * Deep-link: /status-lamaran/{idLamaran}?action=open_modal_wawancara
 */
class WawancaraUpdatedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public Wawancara $wawancara;
    public string $namaKafe;
    public int $idLamaran;

    public function __construct(Wawancara $wawancara, string $namaKafe, int $idLamaran)
    {
        $this->wawancara  = $wawancara;
        $this->namaKafe   = $namaKafe;
        $this->idLamaran  = $idLamaran;
    }

    public function via($notifiable): array
    {
        return [CustomDbChannel::class, 'mail', FcmChannel::class, WhatsAppChannel::class,];
    }

    public function toMail($notifiable): MailMessage
    {
        $tanggalFormatted = $this->wawancara->tanggal_wawancara
            ? $this->wawancara->tanggal_wawancara->translatedFormat('l, d F Y — H:i') . ' WIB'
            : 'Segera dikonfirmasi';

        $urlTimeline = url("/status-lamaran/{$this->idLamaran}?action=open_modal_wawancara");

        return (new MailMessage)
            ->subject("Perubahan Jadwal Wawancara: {$this->namaKafe} 🔄")
            ->markdown('emails.wawancara-dijadwalkan', [
                'namaPengguna' => $notifiable->nama_pengguna,
                'namaKafe'     => $this->namaKafe,
                'posisi'       => $this->wawancara->lamaran?->lowongan?->posisi ?? 'Posisi',
                'tanggal'      => $tanggalFormatted,
                'lokasi'       => $this->wawancara->lokasi ?? '-',
                'tempatLink'   => $this->wawancara->tempat_link ?? '-',
                'catatan'      => $this->wawancara->catatan,
                'urlTimeline'  => $urlTimeline,
            ]);
    }

    public function toDatabase($notifiable): array
    {
        $tanggalStr = $this->wawancara->tanggal_wawancara 
            ? $this->wawancara->tanggal_wawancara->translatedFormat('d F Y, H:i') . ' WIB'
            : '-';

        return [
            'judul' => "Pembaruan Jadwal Wawancara: {$this->namaKafe}",
            'pesan' => "Ada perubahan pada jadwal wawancara Anda di {$this->namaKafe} menjadi {$tanggalStr}. Silakan cek detail jadwal terbaru Anda.",
            // Deep-link: otomatis buka modal wawancara di halaman timeline
            'url'   => "/status-lamaran/{$this->idLamaran}?action=open_modal_wawancara",
        ];
    }

    public function toFcm($notifiable): FcmMessage
    {
        $tanggalFormatted = $this->wawancara->tanggal_wawancara
            ? $this->wawancara->tanggal_wawancara->translatedFormat('d F Y, H:i') . ' WIB'
            : 'jadwal terbaru';

        return new FcmMessage(
            notification: new FcmNotification(
                title: "Perubahan Jadwal Wawancara: {$this->namaKafe} 🔄",
                body: "Jadwal wawancara Anda diperbarui menjadi {$tanggalFormatted}."
            ),
            data: [
                'click_action' => 'FLUTTER_NOTIFICATION_CLICK',
                'id_wawancara' => (string) $this->wawancara->id_wawancara,
                'id_lamaran'   => (string) $this->idLamaran,
                'route'        => "/status-lamaran/{$this->idLamaran}?action=open_modal_wawancara",
                'tipe'         => 'wawancara_diperbarui',
            ]
        );
    }

    public function toWhatsApp($notifiable): string
    {
        $tanggalStr = $this->wawancara->tanggal_wawancara
            ? $this->wawancara->tanggal_wawancara
                ->translatedFormat('l, d F Y - H:i') . ' WIB'
            : 'Segera dikonfirmasi';

        $lokasi = $this->wawancara->lokasi
            ?? $this->wawancara->tempat_link
            ?? '-';

        $catatan = $this->wawancara->catatan
            ?? 'Tidak ada catatan tambahan.';

        $posisi = $this->wawancara->lamaran?->lowongan?->posisi ?? 'Posisi';

        return "*[🔄 PEMBARUAN JADWAL WAWANCARA - CAFE JOB]*\n\n" .

            "Halo *{$notifiable->nama_pengguna}*,\n\n" .

            "Terdapat perubahan pada jadwal wawancara Anda untuk posisi *{$posisi}* di *{$this->namaKafe}*.\n\n" .

            "*Jadwal Terbaru*\n" .
            "📅 Tanggal : {$tanggalStr}\n" .
            "📍 Lokasi/Link : {$lokasi}\n" .
            "📝 Catatan : {$catatan}\n\n" .

            "Mohon perhatikan jadwal terbaru tersebut dan lakukan konfirmasi kehadiran melalui aplikasi *Cafe Job*.\n\n" .

            "Terima kasih dan semoga sukses! ☕";
    }
}