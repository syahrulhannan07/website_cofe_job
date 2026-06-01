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
        return [CustomDbChannel::class, 'mail', FcmChannel::class];
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
        return (new FcmMessage())
            ->setNotification(FcmNotification::create()
                ->title("Perubahan Jadwal Wawancara: {$this->namaKafe} 🔄")
                ->body("Jadwal wawancara Anda diubah menjadi {$this->wawancara->tanggal_wawancara}."))
            ->setData([
                'click_action' => 'FLUTTER_NOTIFICATION_CLICK',
                'id_wawancara' => (string) $this->wawancara->id,
                'tipe' => 'wawancara_diperbarui'
            ]);
    }
}