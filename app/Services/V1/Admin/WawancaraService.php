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
            return $this->repository->create($data);
        });
    }

    public function rescheduleWawancara(Wawancara $wawancara, array $data, string $namaKafe): bool
    {
        return DB::transaction(function () use ($wawancara, $data, $namaKafe) {
            $this->repository->update($wawancara, $data);
            return true;
        });
    }

    public function cancelWawancara(Wawancara $wawancara, string $namaKafe): bool
    {
        return DB::transaction(function () use ($wawancara, $namaKafe) {
            $this->repository->update($wawancara, ['status' => 'Dibatalkan']);
            return true;
        });
    }

    public function deleteWawancara(Wawancara $wawancara, string $namaKafe): bool
    {
        return DB::transaction(function () use ($wawancara, $namaKafe) {
            $wawancara->delete();
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
        }
    }
}
