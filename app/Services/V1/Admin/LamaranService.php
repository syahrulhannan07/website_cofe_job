<?php

namespace App\Services\V1\Admin;

use App\Models\Lamaran;
use App\Repositories\V1\Admin\LamaranRepository;
use App\Services\NotifikasiService;
use Illuminate\Support\Facades\DB;

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

            // Send notification
            $idPengguna = $lamaran->profil?->id_pengguna;
            if ($idPengguna) {
                [$judul, $pesan] = $this->buildNotifikasi($statusBaru, $lamaran->lowongan?->posisi, $namaKafe);
                $this->notifikasiService->kirim($idPengguna, $judul, $pesan);
            }

            return true;
        });
    }

    protected function buildNotifikasi(string $status, ?string $posisi, string $namaKafe): array
    {
        $posisi = $posisi ?? 'posisi yang dilamar';
        
        return match ($status) {
            'Diproses'  => ['Lamaran Diproses 📂', "Lamaran Anda untuk posisi {$posisi} di {$namaKafe} sedang ditinjau oleh tim kami."],
            'Wawancara' => ['Panggilan Wawancara! 📞', "Selamat! Anda terpilih untuk tahap wawancara posisi {$posisi} di {$namaKafe}. Cek jadwal segera."],
            'Diterima'  => ['Selamat! Anda Diterima 🎉', "Hore! Anda dinyatakan DITERIMA untuk posisi {$posisi} di {$namaKafe}. Selamat bergabung!"],
            'Ditolak'   => ['Update Status Lamaran ✉️', "Terima kasih telah melamar posisi {$posisi} di {$namaKafe}. Mohon maaf, lamaran Anda belum dapat kami proses ke tahap selanjutnya."],
            default     => ['Update Lamaran', "Status lamaran Anda di {$namaKafe} telah diperbarui menjadi {$status}."],
        };
    }
}
