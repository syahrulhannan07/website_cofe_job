<?php

namespace App\Notifications;

use App\Models\Wawancara;
use App\Notifications\Channels\CustomDbChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use NotificationChannels\Fcm\FcmChannel;
use NotificationChannels\Fcm\FcmMessage;
use NotificationChannels\Fcm\Resources\Notification as FcmNotification;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Poin 9 — Penjadwalan Wawancara
 *
 * Penerima: Pelamar (In-App & Email)
 * Deep-link: /status-lamaran/{idLamaran}?action=open_modal_wawancara
 *   → Frontend membuka halaman Tracking Timeline, lalu auto-trigger modal "Detail Jadwal Wawancara"
 */
class WawancaraScheduledNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public Wawancara $wawancara;
    public string $namaKafe;
    public string $posisi;
    public int $idLamaran;

    public function __construct(Wawancara $wawancara, string $namaKafe, string $posisi, int $idLamaran)
    {
        $this->wawancara = $wawancara;
        $this->namaKafe  = $namaKafe;
        $this->posisi    = $posisi;
        $this->idLamaran = $idLamaran;
    }

    public function via($notifiable): array
    {
        return [CustomDbChannel::class, 'mail', FcmChannel::class];
    }

    public function toMail($notifiable): MailMessage
    {
        // Format tanggal & waktu wawancara yang mudah dibaca
        $tanggalFormatted = $this->wawancara->tanggal_wawancara
            ? $this->wawancara->tanggal_wawancara->translatedFormat('l, d F Y — H:i') . ' WIB'
            : 'Segera dikonfirmasi';

        // URL timeline untuk tombol di email
        $urlTimeline = url("/status-lamaran/{$this->idLamaran}?action=open_modal_wawancara");

        return (new MailMessage)
            ->subject("Undangan Wawancara: {$this->posisi} di {$this->namaKafe} 📞")
            ->markdown('emails.wawancara-dijadwalkan', [
                'namaPengguna' => $notifiable->nama_pengguna,
                'namaKafe'     => $this->namaKafe,
                'posisi'       => $this->posisi,
                'tanggal'      => $tanggalFormatted,
                'lokasi'       => $this->wawancara->lokasi ?? '-',
                'tempatLink'   => $this->wawancara->tempat_link ?? '-',
                'catatan'      => $this->wawancara->catatan,
                'urlTimeline'  => $urlTimeline,
            ]);
    }

    public function toDatabase($notifiable): array
    {
        return [
            'judul' => "Undangan Wawancara: {$this->posisi}",
            'pesan' => "Anda diundang untuk menghadiri sesi wawancara posisi {$this->posisi} di {$this->namaKafe}. Klik untuk melihat detail jadwal lengkap.",
            // Deep-link SANGAT PENTING: membuka modal detail jadwal wawancara secara otomatis
            'url'   => "/status-lamaran/{$this->idLamaran}?action=open_modal_wawancara",
        ];
    }

    public function toFcm($notifiable): FcmMessage
{
    return (new FcmMessage())
        ->setNotification(
            FcmNotification::create()
                ->title("Undangan Wawancara: {$this->namaKafe} 📞")
                ->body("Anda mendapatkan undangan wawancara untuk posisi {$this->posisi}.")
        )
        ->setData([
            'click_action' => 'FLUTTER_NOTIFICATION_CLICK',
            'id_wawancara' => (string) $this->wawancara->id_wawancara,
            'id_lamaran'   => (string) $this->idLamaran,
            'route'        => "/status-lamaran/{$this->idLamaran}?action=open_modal_wawancara",
            'tipe'         => 'wawancara_dijadwalkan',
        ]);
    }
}