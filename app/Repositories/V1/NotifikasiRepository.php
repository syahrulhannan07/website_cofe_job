<?php

namespace App\Repositories\V1;

use App\Models\Notifikasi;
use Illuminate\Pagination\LengthAwarePaginator;

class NotifikasiRepository
{
    public function getByUser(int $idPengguna, array $filters = []): LengthAwarePaginator
    {
        $query = Notifikasi::where('id_pengguna', $idPengguna);

        if (!empty($filters['belum_dibaca'])) {
            $query->where('dibaca', false);
        }

        $perPage = $filters['per_page'] ?? 20;
        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    public function findByIdAndUser(int $id, int $idPengguna): ?Notifikasi
    {
        return Notifikasi::where('id_pengguna', $idPengguna)
            ->where('id_notifikasi', $id)
            ->first();
    }

    public function markAsRead(Notifikasi $notifikasi): bool
    {
        return $notifikasi->update([
            'dibaca'      => true,
            'dibaca_pada' => now(),
        ]);
    }

    public function markAllAsRead(int $idPengguna): int
    {
        return Notifikasi::where('id_pengguna', $idPengguna)
            ->where('dibaca', false)
            ->update([
                'dibaca'      => true,
                'dibaca_pada' => now(),
            ]);
    }

    public function delete(Notifikasi $notifikasi): bool
    {
        return $notifikasi->delete();
    }

    public function getUnreadCount(int $idPengguna): int
    {
        return Notifikasi::where('id_pengguna', $idPengguna)
            ->where('dibaca', false)
            ->count();
    }
}
