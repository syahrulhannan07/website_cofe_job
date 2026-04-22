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
            $wawancara = $this->repository->create(array_merge($data, ['status' => 'Terjadwal']));

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
}
