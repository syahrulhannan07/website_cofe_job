<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Notifikasi;
use Illuminate\Http\Request;

class NotifikasiController extends Controller
{
    /**
     * Ambil semua notifikasi milik user yang login.
     *
     * GET /api/v1/notifikasi
     */
    public function index(Request $request)
    {
        $user = auth('api')->user();

        $query = Notifikasi::where('id_pengguna', $user->id_pengguna);

        // Filter belum dibaca
        if ($request->boolean('belum_dibaca')) {
            $query->where('dibaca', false);
        }

        $perPage = (int) $request->get('per_page', 20);
        $notifikasi = $query->orderBy('created_at', 'desc')->paginate($perPage);

        $unreadCount = Notifikasi::where('id_pengguna', $user->id_pengguna)
            ->where('dibaca', false)
            ->count();

        $items = $notifikasi->getCollection()->map(fn ($n) => [
            'id'          => $n->id_notifikasi,
            'judul'       => $n->judul,
            'pesan'       => $n->pesan,
            'dibaca'      => $n->dibaca,
            'dibuat_pada' => $n->created_at?->toDateTimeString(),
        ]);

        return response()->json([
            'status'       => 'success',
            'data'         => $items,
            'unread_count' => $unreadCount,
            'pagination'   => [
                'current_page' => $notifikasi->currentPage(),
                'last_page'    => $notifikasi->lastPage(),
                'per_page'     => $notifikasi->perPage(),
                'total'        => $notifikasi->total(),
            ],
        ]);
    }

    /**
     * Tandai satu notifikasi sebagai sudah dibaca.
     *
     * PUT /api/v1/notifikasi/{id}/baca
     */
    public function baca($id)
    {
        $user = auth('api')->user();
        $notifikasi = Notifikasi::where('id_pengguna', $user->id_pengguna)
            ->where('id_notifikasi', $id)
            ->first();

        if (!$notifikasi) {
            return response()->json(['status' => 'error', 'message' => 'Notifikasi tidak ditemukan'], 404);
        }

        $notifikasi->update([
            'dibaca'      => true,
            'dibaca_pada' => now(),
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Notifikasi ditandai sebagai dibaca',
        ]);
    }

    /**
     * Tandai semua notifikasi user sebagai sudah dibaca.
     *
     * PUT /api/v1/notifikasi/baca-semua
     */
    public function bacaSemua()
    {
        $user = auth('api')->user();

        Notifikasi::where('id_pengguna', $user->id_pengguna)
            ->where('dibaca', false)
            ->update([
                'dibaca'      => true,
                'dibaca_pada' => now(),
            ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Semua notifikasi ditandai sebagai dibaca',
        ]);
    }

    /**
     * Hapus satu notifikasi.
     *
     * DELETE /api/v1/notifikasi/{id}
     */
    public function destroy($id)
    {
        $user = auth('api')->user();
        $notifikasi = Notifikasi::where('id_pengguna', $user->id_pengguna)
            ->where('id_notifikasi', $id)
            ->first();

        if (!$notifikasi) {
            return response()->json(['status' => 'error', 'message' => 'Notifikasi tidak ditemukan'], 404);
        }

        $notifikasi->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Notifikasi berhasil dihapus',
        ]);
    }
}
