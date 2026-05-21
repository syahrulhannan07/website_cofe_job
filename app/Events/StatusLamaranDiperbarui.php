<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

// [UPDATE LOGIC] - Event real-time untuk notifikasi perubahan status lamaran via WebSocket
class StatusLamaranDiperbarui implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public int $idPengguna;
    public string $statusBaru;
    public int $idLowongan;
    public string $posisi;
    public string $namaPerusahaan;

    public function __construct(
        int $idPengguna,
        string $statusBaru,
        int $idLowongan,
        string $posisi,
        string $namaPerusahaan
    ) {
        // [UPDATE LOGIC]
        $this->idPengguna     = $idPengguna;
        $this->statusBaru     = $statusBaru;
        $this->idLowongan     = $idLowongan;
        $this->posisi         = $posisi;
        $this->namaPerusahaan = $namaPerusahaan;
    }

    /**
     * Channel private per pengguna (pelamar) agar hanya penerima yang relevan yang mendapat notifikasi.
     */
    public function broadcastOn(): array
    {
        // [UPDATE LOGIC] - Channel private per id_pengguna pelamar
        return [
            new PrivateChannel("pelamar.{$this->idPengguna}"),
        ];
    }

    /**
     * Nama event yang dikirim ke frontend.
     */
    public function broadcastAs(): string
    {
        // [UPDATE LOGIC]
        return 'status.lamaran.diperbarui';
    }

    /**
     * Payload yang dikirimkan bersama event.
     */
    public function broadcastWith(): array
    {
        // [UPDATE LOGIC]
        return [
            'status_baru'     => $this->statusBaru,
            'id_lowongan'     => $this->idLowongan,
            'posisi'          => $this->posisi,
            'nama_perusahaan' => $this->namaPerusahaan,
        ];
    }
}
