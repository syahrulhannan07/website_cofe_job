<?php

namespace App\Repositories\V1\Admin;

use App\Models\Lamaran;
use Illuminate\Pagination\LengthAwarePaginator;

class LamaranRepository
{
    public function getByLowongan(int $idLowongan, array $filters = []): \Illuminate\Database\Eloquent\Collection
    {
        $query = Lamaran::with(['profil.pengguna', 'profil.pendidikan'])
            ->where('id_lowongan', $idLowongan);

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('status', 'LIKE', "%{$search}%")
                  ->orWhereHas('profil', function ($sq) use ($search) {
                      $sq->where('nama_lengkap', 'LIKE', "%{$search}%");
                  });
            });
        }

        return $query->orderBy('created_at', 'desc')->get();
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
