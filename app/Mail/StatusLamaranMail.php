<?php

namespace App\Mail;

use App\Models\Lamaran;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

// [UPDATE LOGIC] - Mailable baru untuk notifikasi perubahan status lamaran via email
class StatusLamaranMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $namaPerusahaan;
    public string $posisi;
    public string $statusBaru;
    public string $namaLengkap;

    public function __construct(Lamaran $lamaran, string $namaPerusahaan)
    {
        // [UPDATE LOGIC] - Ambil data dari relasi lamaran
        $this->namaPerusahaan = $namaPerusahaan;
        $this->posisi         = $lamaran->lowongan?->posisi ?? 'Posisi yang dilamar';
        $this->statusBaru     = $lamaran->status;
        $this->namaLengkap    = $lamaran->profil?->nama_lengkap ?? 'Pelamar';
    }

    public function envelope(): Envelope
    {
        // [UPDATE LOGIC]
        $subjectMap = [
            'Wawancara' => 'Panggilan Wawancara – ' . $this->posisi,
            'Diterima'  => 'Selamat! Lamaran Anda Diterima – ' . $this->posisi,
            'Ditolak'   => 'Update Status Lamaran – ' . $this->posisi,
            'Diproses'  => 'Lamaran Anda Sedang Diproses – ' . $this->posisi,
        ];

        return new Envelope(
            subject: $subjectMap[$this->statusBaru] ?? 'Update Status Lamaran – ' . config('app.name'),
        );
    }

    public function content(): Content
    {
        // [UPDATE LOGIC] - Gunakan view blade untuk body email
        return new Content(
            view: 'emails.status-lamaran',
        );
    }
}
