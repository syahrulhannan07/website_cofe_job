<?php

namespace App\Repositories\V1\Admin;

use App\Models\Lowongan;
use Illuminate\Pagination\LengthAwarePaginator;

class LowonganRepository
{
    /**
     * Get paginated vacancies for a specific cafe.
     */
    public function getByPerusahaan(int $idPerusahaan, array $filters = []): LengthAwarePaginator
    {
        $query = Lowongan::where('id_perusahaan', $idPerusahaan)
            ->withCount('lamaran');

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('posisi', 'LIKE', "%{$search}%")
                  ->orWhere('deskripsi', 'LIKE', "%{$search}%");
            });
        }

        $perPage = $filters['per_page'] ?? 10;
        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    /**
     * Find a vacancy by ID and owner.
     */
    public function findByIdAndPerusahaan(int $id, int $idPerusahaan, array $with = []): ?Lowongan
    {
        return Lowongan::with($with)
            ->where('id_perusahaan', $idPerusahaan)
            ->where('id_lowongan', $id)
            ->first();
    }

    /**
     * Create a new vacancy.
     */
    public function create(array $data): Lowongan
    {
        return Lowongan::create($data);
    }

    /**
     * Update an existing vacancy.
     */
    public function update(Lowongan $lowongan, array $data): bool
    {
        return $lowongan->update($data);
    }

    /**
     * Delete a vacancy.
     */
    public function delete(Lowongan $lowongan): bool
    {
        return $lowongan->delete();
    }
}
