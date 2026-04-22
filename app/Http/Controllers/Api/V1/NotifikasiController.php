<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Repositories\V1\NotifikasiRepository;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class NotifikasiController extends Controller
{
    use ApiResponse;

    protected $repository;

    public function __construct(NotifikasiRepository $repository)
    {
        $this->repository = $repository;
    }

    public function index(Request $request)
    {
        $user = auth('api')->user();
        $notifikasi = $this->repository->getByUser($user->id_pengguna, $request->all());

        $items = $notifikasi->getCollection()->map(fn ($n) => [
            'id'          => $n->id_notifikasi,
            'judul'       => $n->judul,
            'pesan'       => $n->pesan,
            'dibaca'      => $n->dibaca,
            'dibuat_pada' => $n->created_at?->toDateTimeString(),
        ]);

        return $this->successResponse($items, null, 200, [
            'unread_count' => $this->repository->getUnreadCount($user->id_pengguna),
            'pagination'   => [
                'current_page' => $notifikasi->currentPage(),
                'last_page'    => $notifikasi->lastPage(),
                'total'        => $notifikasi->total(),
            ],
        ]);
    }

    public function baca($id)
    {
        $user = auth('api')->user();
        $notifikasi = $this->repository->findByIdAndUser($id, $user->id_pengguna);

        if (!$notifikasi) return $this->errorResponse('Notifikasi tidak ditemukan', 404);

        $this->repository->markAsRead($notifikasi);

        return $this->successResponse(null, 'Notifikasi ditandai sebagai dibaca');
    }

    public function bacaSemua()
    {
        $user = auth('api')->user();
        $this->repository->markAllAsRead($user->id_pengguna);

        return $this->successResponse(null, 'Semua notifikasi ditandai sebagai dibaca');
    }

    public function destroy($id)
    {
        $user = auth('api')->user();
        $notifikasi = $this->repository->findByIdAndUser($id, $user->id_pengguna);

        if (!$notifikasi) return $this->errorResponse('Notifikasi tidak ditemukan', 404);

        $this->repository->delete($notifikasi);

        return $this->successResponse(null, 'Notifikasi berhasil dihapus');
    }
}
