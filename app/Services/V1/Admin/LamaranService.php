<?php

namespace App\Services\V1\Admin;

use App\Events\StatusLamaranDiperbarui;  // [UPDATE LOGIC]
use App\Mail\StatusLamaranMail;           // [UPDATE LOGIC]
use App\Models\Lamaran;
use App\Repositories\V1\Admin\LamaranRepository;
use App\Services\NotifikasiService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail; // [UPDATE LOGIC]

class LamaranService
{
    protected $repository;
    protected $notifikasiService;

    public function __construct(LamaranRepository $repository, NotifikasiService $notifikasiService)
    {
        $this->repository = $repository;
        $this->notifikasiService = $notifikasiService;
    }

    public function updateStatus(Lamaran $lamaran, string $statusBaru, string $namaKafe): bool
    {
        return DB::transaction(function () use ($lamaran, $statusBaru, $namaKafe) {
            $this->repository->updateStatus($lamaran, $statusBaru);

            event(new \App\Events\LamaranStatusUpdated(
                $lamaran->load(['profil.pengguna', 'lowongan.perusahaan']),
                $statusBaru,
                $namaKafe
            ));

            return true;
        });
    }

    protected function buildNotifikasi(string $status, ?string $posisi, string $namaKafe): array
    {
        $posisi = $posisi ?? 'posisi yang dilamar';
        
        return match ($status) {
            'Diproses'  => ['Lamaran Sedang Diproses 📂', "Lamaran Anda untuk posisi {$posisi} di {$namaKafe} sedang ditinjau oleh tim kami."],
            'Wawancara' => ['Lamaran Anda Lolos Seleksi 🎯', "Selamat! Lamaran Anda untuk posisi {$posisi} di {$namaKafe} sudah ditinjau. Harap menunggu jadwal wawancara dari kami."],
            'Diterima'  => ['Selamat! Anda Diterima 🎉', "Hore! Anda dinyatakan DITERIMA untuk posisi {$posisi} di {$namaKafe}. Selamat bergabung!"],
            'Ditolak'   => ['Update Status Lamaran ✉️', "Terima kasih telah melamar posisi {$posisi} di {$namaKafe}. Mohon maaf, lamaran Anda belum dapat kami proses ke tahap selanjutnya."],
            default     => ['Update Lamaran', "Status lamaran Anda di {$namaKafe} telah diperbarui menjadi {$status}."],
        };
    }
}
