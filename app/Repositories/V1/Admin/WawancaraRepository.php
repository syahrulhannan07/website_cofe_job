<?php

namespace App\Repositories\V1\Admin;

use App\Models\Wawancara;
use Illuminate\Pagination\LengthAwarePaginator;

class WawancaraRepository
{
    public function getByPerusahaan(int $idPerusahaan, array $filters = []): LengthAwarePaginator
    {
        $query = Wawancara::with(['lamaran.profil', 'lamaran.lowongan'])
            ->whereHas('lamaran.lowongan', fn($q) => $q->where('id_perusahaan', $idPerusahaan));

        if (!empty($filters['tanggal'])) {
            $query->whereDate('tanggal_wawancara', $filters['tanggal']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        $perPage = $filters['per_page'] ?? 10;
        return $query->orderBy('tanggal_wawancara', 'asc')->paginate($perPage);
    }

    public function findByIdAndPerusahaan(int $id, int $idPerusahaan, array $with = []): ?Wawancara
    {
        return Wawancara::with($with)
            ->whereHas('lamaran.lowongan', fn($q) => $q->where('id_perusahaan', $idPerusahaan))
            ->where('id_wawancara', $id)
            ->first();
    }

    public function create(array $data): Wawancara
    {
        return Wawancara::create($data);
    }

    public function update(Wawancara $wawancara, array $data): bool
    {
        return $wawancara->update($data);
    }
}
