<?php

namespace App\Mail;

use App\Models\Wawancara;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

// [UPDATE LOGIC] - Mailable baru untuk mengirim detail undangan wawancara
class UndanganWawancaraMail extends Mailable
{
    use Queueable, SerializesModels;

    public Wawancara $wawancara;
    public string $namaPerusahaan;
    public string $posisi;
    public string $namaLengkap;

    public function __construct(Wawancara $wawancara, string $namaPerusahaan)
    {
        // [UPDATE LOGIC]
        $this->wawancara = $wawancara;
        $this->namaPerusahaan = $namaPerusahaan;
        $this->posisi = $wawancara->lamaran->lowongan?->posisi ?? 'Posisi yang dilamar';
        $this->namaLengkap = $wawancara->lamaran->profil?->nama_lengkap ?? 'Pelamar';
    }

    public function envelope(): Envelope
    {
        // [UPDATE LOGIC]
        return new Envelope(
            subject: 'Undangan Wawancara – ' . $this->posisi . ' di ' . $this->namaPerusahaan,
        );
    }

    public function content(): Content
    {
        // [UPDATE LOGIC]
        return new Content(
            view: 'emails.undangan-wawancara',
        );
    }
}
