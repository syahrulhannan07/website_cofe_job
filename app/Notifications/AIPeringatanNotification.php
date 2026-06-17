<?php

namespace App\Notifications;

use App\Models\Pengguna;
use App\Models\Lowongan;
use App\Notifications\Channels\CustomDbChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use NotificationChannels\Fcm\FcmChannel;
use NotificationChannels\Fcm\FcmMessage;
use NotificationChannels\Fcm\Resources\Notification as FcmNotification;

class AIPeringatanNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Pengguna $perusahaan,
        public ?Lowongan $lowongan,
        public int $skor,
        public string $tindakan
    ) {}

    public function via($notifiable): array
    {
        return [CustomDbChannel::class, FcmChannel::class, 'mail'];
    }

    public function toDatabase($notifiable): array
    {
        $tindakanLabel = match ($this->tindakan) {
            'suspended' => 'Diblokir Otomatis',
            'warning'   => 'Peringatan',
            'flagged'   => 'Terflag',
            default     => $this->tindakan,
        };

        $namaPerusahaan = $this->perusahaan->profilPerusahaan?->nama_perusahaan ?? $this->perusahaan->nama_pengguna;
        $posisi = $this->lowongan?->posisi ?? '-';

        $pesan = match ($this->tindakan) {
            'suspended' => "[AI] Akun {$namaPerusahaan} telah diblokir otomatis (skor: {$this->skor}). Lowongan '{$posisi}' ditutup.",
            'warning'   => "[AI] Akun {$namaPerusahaan} mendapat peringatan (skor: {$this->skor}). Lowongan '{$posisi}' terdeteksi mencurigakan.",
            'flagged'   => "[AI] Lowongan '{$posisi}' oleh {$namaPerusahaan} terflag untuk review (skor: {$this->skor}).",
            default     => "[AI] Deteksi pada {$namaPerusahaan} (skor: {$this->skor})",
        };

        $url = $this->lowongan
            ? "/super-admin/kelola-akun/lowongan/{$this->lowongan->id_lowongan}"
            : "/super-admin/kelola-akun";

        return [
            'judul' => "AI Detection: {$tindakanLabel}",
            'pesan' => $pesan,
            'url'   => $url,
        ];
    }

    public function toMail($notifiable): MailMessage
    {
        $tindakanLabel = match ($this->tindakan) {
            'suspended' => 'Diblokir Otomatis',
            'warning'   => 'Peringatan',
            'flagged'   => 'Terflag',
            default     => $this->tindakan,
        };

        $namaPerusahaan = $this->perusahaan->profilPerusahaan?->nama_perusahaan ?? $this->perusahaan->nama_pengguna;
        $posisi = $this->lowongan?->posisi ?? '-';

        $pesan = match ($this->tindakan) {
            'suspended' => "Akun {$namaPerusahaan} telah diblokir otomatis oleh sistem AI (skor: {$this->skor}). Semua lowongan aktif telah ditutup.",
            'warning'   => "Akun {$namaPerusahaan} mendapat peringatan AI (skor: {$this->skor}). Status akun diubah menjadi Nonaktif. Lowongan '{$posisi}' terdeteksi mencurigakan.",
            'flagged'   => "Lowongan '{$posisi}' oleh {$namaPerusahaan} terflag untuk review (skor: {$this->skor}).",
            default     => "Deteksi AI pada {$namaPerusahaan} (skor: {$this->skor})",
        };

        return (new MailMessage)
            ->subject("AI Detection: {$tindakanLabel} - {$namaPerusahaan}")
            ->greeting("Halo Super Admin,")
            ->line("Sistem AI mendeteksi aktivitas mencurigakan pada platform:")
            ->line("")
            ->line("🏢 Perusahaan: {$namaPerusahaan}")
            ->line("📊 Skor Deteksi: {$this->skor}")
            ->line("⚠️ Tindakan: {$tindakanLabel}")
            ->line("📌 Lowongan: {$posisi}")
            ->line("")
            ->line($pesan)
            ->line("")
            ->line("Silakan login ke dashboard Super Admin untuk meninjau lebih lanjut.")
            ->action('Buka Dashboard', url('/super-admin/ai-deteksi'));
    }

    public function toFcm($notifiable): FcmMessage
    {
        $tindakanLabel = match ($this->tindakan) {
            'suspended' => 'Diblokir Otomatis',
            'warning'   => 'Peringatan',
            'flagged'   => 'Terflag',
            default     => $this->tindakan,
        };

        return new FcmMessage(
            notification: new FcmNotification(
                title: "AI Detection: {$tindakanLabel}",
                body: $this->toDatabase($notifiable)['pesan']
            ),
            data: [
                'tipe' => 'ai_detection',
                'tindakan' => $this->tindakan,
                'skor' => (string) $this->skor,
            ]
        );
    }
}
