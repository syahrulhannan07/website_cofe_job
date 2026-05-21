<?php

namespace App\Mail;

use App\Models\ProfilPerusahaan;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

// [UPDATE LOGIC] - Mailable baru untuk mengirim email persetujuan perusahaan
class PersetujuanPerusahaanMail extends Mailable
{
    use Queueable, SerializesModels;

    public ProfilPerusahaan $profilPerusahaan;

    /**
     * Create a new message instance.
     */
    public function __construct(ProfilPerusahaan $profilPerusahaan)
    {
        // [UPDATE LOGIC]
        $this->profilPerusahaan = $profilPerusahaan;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        // [UPDATE LOGIC]
        return new Envelope(
            subject: 'Pendaftaran Kafe Disetujui – C.A.F.E. E-Recruitment',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        // [UPDATE LOGIC]
        return new Content(
            view: 'emails.persetujuan-perusahaan',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
