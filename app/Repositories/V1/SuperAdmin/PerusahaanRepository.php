<?php

namespace App\Repositories\V1\SuperAdmin;

use App\Models\ProfilPerusahaan;
use Illuminate\Pagination\LengthAwarePaginator;

class PerusahaanRepository
{
    public function getPending(array $filters = []): LengthAwarePaginator
    {
        $query = ProfilPerusahaan::with('pengguna')->where('status_verifikasi', 'Pending');

        if (!empty($filters['search'])) {
            $query->where('nama_perusahaan', 'LIKE', "%{$filters['search']}%");
        }

        return $query->orderBy('created_at', 'desc')->paginate($filters['per_page'] ?? 10);
    }

    public function findById(int $id, array $with = []): ?ProfilPerusahaan
    {
        return ProfilPerusahaan::with($with)->find($id);
    }

    public function updateStatus(ProfilPerusahaan $profil, string $status, ?string $alasan = null): bool
    {
        return $profil->update([
            'status_verifikasi' => $status,
            'alasan_penolakan'  => $alasan,
        ]);
    }
}
