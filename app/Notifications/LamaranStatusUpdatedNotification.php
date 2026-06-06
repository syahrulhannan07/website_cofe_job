<?php

namespace App\Notifications;

use App\Models\Lamaran;
use App\Notifications\Channels\CustomDbChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use NotificationChannels\Fcm\FcmChannel;
use NotificationChannels\Fcm\FcmMessage;
use NotificationChannels\Fcm\Resources\Notification as FcmNotification;

class LamaranStatusUpdatedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public Lamaran $lamaran;
    public string $status;
    public string $namaKafe;

    public function __construct(Lamaran $lamaran, string $status, string $namaKafe)
    {
        $this->lamaran = $lamaran;
        $this->status = $status;
        $this->namaKafe = $namaKafe;
    }

    public function via($notifiable): array
    {
        return [CustomDbChannel::class, 'mail', FcmChannel::class];
    }

    public function toMail($notifiable): MailMessage
    {
        $posisi = $this->lamaran->lowongan->posisi ?? 'posisi';
        [$judul, $pesan] = $this->buildNotifikasi($this->status, $posisi, $this->namaKafe);

        return (new MailMessage)
            ->subject($judul)
            ->line("Halo " . $notifiable->nama_pengguna . ",")
            ->line($pesan)
            ->line("Teria kasih atas partisipasi Anda dalam proses rekrutmen kami.");
    }

    public function toDatabase($notifiable): array
    {
        $posisi = $this->lamaran->lowongan->posisi ?? 'posisi';
        [$judul, $pesan] = $this->buildNotifikasi($this->status, $posisi, $this->namaKafe);

        return [
            'judul' => $judul,
            'pesan' => $pesan,
            'url'   => "/status-lamaran/{$this->lamaran->id_lamaran}",
        ];
    }

    public function toFcm($notifiable): FcmMessage
    {
        $posisi = $this->lamaran->lowongan->posisi ?? 'posisi';

        [$judul, $pesan] = $this->buildNotifikasi(
            $this->status,
            $posisi,
            $this->namaKafe
        );

        return (new FcmMessage())
            ->setNotification(
                FcmNotification::create()
                    ->title($judul)
                    ->body($pesan)
            )
            ->setData([
                'click_action' => 'FLUTTER_NOTIFICATION_CLICK',
                'id_lamaran' => (string) $this->lamaran->id_lamaran,
                'status_baru' => $this->status,
                'tipe' => 'status_lamaran_berubah',
                'route' => "/status-lamaran/{$this->lamaran->id_lamaran}",
            ]);
    }

    protected function buildNotifikasi(string $status, ?string $posisi, string $namaKafe): array
    {
        $posisi = $posisi ?? 'posisi yang dilamar';
        
        return match ($status) {
            'Diproses'  => ["Proses Seleksi: {$posisi}", "Lamaran Anda untuk posisi {$posisi} di {$namaKafe} sedang dalam proses peninjauan oleh tim rekrutmen."],
            'Wawancara' => ["Lolos Seleksi Administrasi: {$posisi}", "Selamat, Anda dinyatakan lolos seleksi administrasi untuk posisi {$posisi} di {$namaKafe}. Informasi detail mengenai jadwal wawancara Anda akan segera kami kirimkan."],
            'Diterima'  => ["Penerimaan Kerja: {$posisi} 🎉", "Selamat, Anda dinyatakan DITERIMA untuk bergabung pada posisi {$posisi} di {$namaKafe}. Selamat bergabung!"],
            'Ditolak'   => ["Status Lamaran: {$posisi}", "Terima kasih atas partisipasi Anda dalam melamar posisi {$posisi} di {$namaKafe}. Kami memohon maaf karena lamaran Anda saat ini belum dapat kami proses ke tahap selanjutnya."],
            default     => ["Pembaruan Lamaran: {$posisi}", "Lamaran Anda di {$namaKafe} telah diperbarui ke status: {$status}."],
        };
    }
}