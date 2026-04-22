<?php

namespace App\Repositories\V1\Admin;

use App\Models\Lamaran;
use Illuminate\Pagination\LengthAwarePaginator;

class LamaranRepository
{
    public function getByLowongan(int $idLowongan, array $filters = []): LengthAwarePaginator
    {
        $query = Lamaran::with('profil')
            ->where('id_lowongan', $idLowongan);

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->whereHas('profil', function ($q) use ($search) {
                $q->where('nama_lengkap', 'LIKE', "%{$search}%");
            });
        }

        $perPage = $filters['per_page'] ?? 10;
        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    public function findByIdAndPerusahaan(int $id, int $idPerusahaan, array $with = []): ?Lamaran
    {
        return Lamaran::with($with)
            ->whereHas('lowongan', fn($q) => $q->where('id_perusahaan', $idPerusahaan))
            ->where('id_lamaran', $id)
            ->first();
    }

    public function updateStatus(Lamaran $lamaran, string $status): bool
    {
        return $lamaran->update(['status' => $status]);
    }
}
