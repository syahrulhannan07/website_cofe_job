<?php

namespace App\Mail;

use App\Models\ProfilPerusahaan;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

// [UPDATE LOGIC] - Mailable baru untuk mengirim email penolakan perusahaan beserta alasan
class PenolakanPerusahaanMail extends Mailable
{
    use Queueable, SerializesModels;

    public ProfilPerusahaan $profilPerusahaan;
    public string $alasanPenolakan;

    /**
     * Create a new message instance.
     */
    public function __construct(ProfilPerusahaan $profilPerusahaan, string $alasanPenolakan)
    {
        // [UPDATE LOGIC]
        $this->profilPerusahaan = $profilPerusahaan;
        $this->alasanPenolakan = $alasanPenolakan;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        // [UPDATE LOGIC]
        return new Envelope(
            subject: 'Pendaftaran Kafe Ditolak – C.A.F.E. E-Recruitment',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        // [UPDATE LOGIC]
        return new Content(
            view: 'emails.penolakan-perusahaan',
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
