<?php

namespace App\Http\Controllers\Api\V1\Pelamar;

use App\Http\Controllers\Controller;
use App\Models\Lamaran;
use Illuminate\Http\Request;

class StatusLamaranController extends Controller
{
    public function index(Request $request)
    {
        $profil = auth('api')->user()->profilPelamar;

        if (!$profil) {
            return response()->json([
                'status' => 'success',
                'message' => 'Anda belum melamar pekerjaan apapun',
                'data' => []
            ]);
        }

        $query = Lamaran::with(['lowongan.perusahaan'])
            ->where('id_profil', $profil->id_profil);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $lamaran = $query->latest('updated_at')->paginate($request->get('per_page', 10));

        if ($lamaran->isEmpty()) {
            return response()->json([
                'status' => 'success',
                'message' => 'Anda belum melamar pekerjaan apapun',
                'data' => []
            ]);
        }

        $data = $lamaran->map(function ($item) {
            return [
                'id_lamaran' => $item->id_lamaran,
                'nama_kafe' => $item->lowongan->perusahaan->nama_perusahaan ?? null,
                'logo_kafe' => $item->lowongan->perusahaan->logo_perusahaan ?? null,
                'posisi' => $item->lowongan->posisi ?? null,
                'status' => $item->status,
                'dibuat_pada' => $item->created_at,
                'diperbarui_pada' => $item->updated_at,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $data,
            'meta' => [
                'current_page' => $lamaran->currentPage(),
                'last_page' => $lamaran->lastPage(),
                'total' => $lamaran->total(),
            ]
        ]);
    }

    public function show($id_lamaran)
    {
        $profil = auth('api')->user()->profilPelamar;
        
        $lamaran = Lamaran::with(['lowongan.perusahaan', 'logStatus', 'wawancara'])
            ->where('id_lamaran', $id_lamaran)
            ->where('id_profil', $profil->id_profil)
            ->firstOrFail();

        return response()->json([
            'status' => 'success',
            'data' => [
                'id_lamaran' => $lamaran->id_lamaran,
                'posisi' => $lamaran->lowongan->posisi ?? null,
                'nama_kafe' => $lamaran->lowongan->perusahaan->nama_perusahaan ?? null,
                'status_saat_ini' => $lamaran->status,
                'timeline' => $lamaran->logStatus()
                    ->orderBy('dibuat_pada', 'desc')
                    ->get()
                    ->map(function ($log) {
                        return [
                            'status' => $log->status_baru,
                            'waktu' => $log->dibuat_pada,
                            'keterangan' => $log->keterangan
                        ];
                    }),
                'wawancara' => $lamaran->wawancara ? [
                    'tanggal' => $lamaran->wawancara->tanggal_wawancara,
                    'lokasi' => $lamaran->wawancara->lokasi,
                    'catatan' => $lamaran->wawancara->catatan,
                    'status_jadwal' => $lamaran->wawancara->status,
                ] : null
            ]
        ]);
    }

    public function detailWawancara($id_lamaran)
    {
        $profil = auth('api')->user()->profilPelamar;

        $lamaran = Lamaran::with(['wawancara'])
            ->where('id_lamaran', $id_lamaran)
            ->where('id_profil', $profil->id_profil)
            ->firstOrFail();

        if ($lamaran->status !== 'Wawancara' || !$lamaran->wawancara) {
            return response()->json([
                'status' => 'error',
                'message' => 'Jadwal wawancara tidak ditemukan atau lamaran tidak dalam tahap wawancara.'
            ], 404);
        }

        $wawancara = $lamaran->wawancara;
        $isExpired = \Carbon\Carbon::parse($wawancara->tanggal_wawancara)->isPast();

        return response()->json([
            'status' => 'success',
            'data' => [
                'tanggal_wawancara' => $wawancara->tanggal_wawancara,
                'lokasi' => $wawancara->lokasi,
                'catatan' => $wawancara->catatan,
                'status' => $wawancara->status,
                'is_expired' => $isExpired,
                'label_expired' => $isExpired ? 'Kedaluwarsa' : 'Mendatang'
            ]
        ]);
    }
}
