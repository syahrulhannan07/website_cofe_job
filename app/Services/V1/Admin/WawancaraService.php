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
                'Panggilan Wawancara! 📞',
                "Selamat! Anda mendapat panggilan wawancara untuk posisi {$posisi} di {$namaKafe}. Jadwal wawancara sudah tersedia, silakan cek menu Status Lamaran."
            );

            // Dispatch event real-time ke channel private pelamar
            try {
                event(new \App\Events\StatusLamaranDiperbarui(
                    idPengguna:     $idPengguna,
                    statusBaru:     'Wawancara',
                    idLowongan:     $wawancara->lamaran?->id_lowongan ?? $data['id_lowongan'] ?? 0,
                    posisi:         $posisi,
                    namaPerusahaan: $namaKafe,
                ));
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Gagal broadcast event status lamaran: ' . $e->getMessage());
            }

            // [UPDATE LOGIC] - Kirim email detail jadwal wawancara ke kandidat secara synchronous
            try {
                $wawancara->load(['lamaran.profil.pengguna', 'lamaran.lowongan']);
                $emailKandidat = $wawancara->lamaran->profil->pengguna->email;
                if ($emailKandidat) {
                    \Illuminate\Support\Facades\Mail::to($emailKandidat)->send(
                        new \App\Mail\UndanganWawancaraMail($wawancara, $namaKafe)
                    );
                }
            } catch (\Exception $e) {
                // Log pesan error ke system log tetapi JANGAN me-rollback transaksi database
                \Illuminate\Support\Facades\Log::error('Gagal mengirim email undangan wawancara: ' . $e->getMessage());
            }

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
