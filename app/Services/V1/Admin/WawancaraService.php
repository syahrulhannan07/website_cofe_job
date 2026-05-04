<?php

namespace App\Services\V1\Admin;

use App\Models\Wawancara;
use App\Repositories\V1\Admin\WawancaraRepository;
use App\Services\NotifikasiService;
use Illuminate\Support\Facades\DB;

class WawancaraService
{
    protected $repository;
    protected $notifikasiService;

    public function __construct(WawancaraRepository $repository, NotifikasiService $notifikasiService)
    {
        $this->repository = $repository;
        $this->notifikasiService = $notifikasiService;
    }

    public function scheduleWawancara(array $data, string $namaKafe, string $posisi, int $idPengguna): Wawancara
    {
        return DB::transaction(function () use ($data, $namaKafe, $posisi, $idPengguna) {
            $data['status'] = $data['status'] ?? 'Terjadwal';
            $wawancara = $this->repository->create($data);

            $this->notifikasiService->kirim(
                $idPengguna,
                'Jadwal Wawancara 🗓️',
                "Anda dijadwalkan wawancara untuk {$posisi} di {$namaKafe}. Tanggal: {$data['tanggal_wawancara']}. Lokasi: {$data['lokasi']}."
            );

            return $wawancara;
        });
    }

    public function rescheduleWawancara(Wawancara $wawancara, array $data, string $namaKafe): bool
    {
        return DB::transaction(function () use ($wawancara, $data, $namaKafe) {
            $this->repository->update($wawancara, $data);

            $this->notifikasiService->kirim(
                $wawancara->lamaran->profil->id_pengguna,
                'Perubahan Jadwal Wawancara 🔄',
                "Jadwal wawancara Anda di {$namaKafe} telah diperbarui. Tanggal: {$wawancara->tanggal_wawancara}. Lokasi: {$wawancara->lokasi}."
            );

            return true;
        });
    }

    public function cancelWawancara(Wawancara $wawancara, string $namaKafe): bool
    {
        return DB::transaction(function () use ($wawancara, $namaKafe) {
            $this->repository->update($wawancara, ['status' => 'Dibatalkan']);

            $this->notifikasiService->kirim(
                $wawancara->lamaran->profil->id_pengguna,
                'Wawancara Dibatalkan ❌',
                "Mohon maaf, jadwal wawancara Anda di {$namaKafe} telah dibatalkan."
            );

            return true;
        });
    }

    public function deleteWawancara(Wawancara $wawancara, string $namaKafe): bool
    {
        return DB::transaction(function () use ($wawancara, $namaKafe) {
            $idPengguna = $wawancara->lamaran->profil->id_pengguna;
            
            $wawancara->delete();

            $this->notifikasiService->kirim(
                $idPengguna,
                'Jadwal Dihapus 🗑️',
                "Jadwal wawancara Anda di {$namaKafe} telah dihapus dari sistem."
            );

            return true;
        });
    }

    public function autoCancelOverdueInterviews(int $idPerusahaan): void
    {
        $overdue = Wawancara::whereHas('lamaran.lowongan', fn($q) => $q->where('id_perusahaan', $idPerusahaan))
            ->where('status', 'Terjadwal')
            ->where('tanggal_wawancara', '<', now())
            ->get();

        foreach ($overdue as $item) {
            $this->repository->update($item, ['status' => 'Dibatalkan']);
            
            // Optional: Notifikasi pembatalan otomatis
            $this->notifikasiService->kirim(
                $item->lamaran->profil->id_pengguna,
                'Wawancara Kadaluarsa ⏰',
                "Jadwal wawancara Anda telah melewati waktu yang ditentukan dan otomatis dibatalkan."
            );
        }
    }
}
