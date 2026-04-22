<?php

namespace App\Repositories\V1;

use App\Models\Pengguna;
use Illuminate\Pagination\LengthAwarePaginator;

class PenggunaRepository
{
    public function getByRole(string $role, array $filters = []): LengthAwarePaginator
    {
        $query = Pengguna::with('profilPerusahaan')->where('peran', $role);

        if (!empty($filters['status'])) {
            $query->where('status_akun', $filters['status']);
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('nama_pengguna', 'LIKE', "%{$search}%")
                  ->orWhere('email', 'LIKE', "%{$search}%");
            });
        }

        return $query->orderBy('created_at', 'desc')->paginate($filters['per_page'] ?? 10);
    }

    public function findById(int $id, array $with = []): ?Pengguna
    {
        return Pengguna::with($with)->find($id);
    }

    public function updateStatus(Pengguna $user, string $status): bool
    {
        return $user->update(['status_akun' => $status]);
    }
}
