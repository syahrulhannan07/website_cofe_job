<?php

namespace App\Http\Controllers\Api\V1\Pelamar;

use App\Http\Controllers\Controller;
use App\Models\Lamaran;
use App\Services\V1\Pelamar\VerifikasiWajahService;
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

        $query = Lamaran::with(['lowongan.perusahaan', 'logStatus'])
            ->where('id_profil', $profil->id_profil)
            ->has('logStatus');

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
                // Status pill selalu dari DB (Diproses/Wawancara/Diterima/Ditolak)
                'status' => $item->status,
                'dibuat_pada' => $item->created_at?->toIso8601String(),
                'diperbarui_pada' => $item->updated_at?->toIso8601String(),
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
        abort_unless($profil, 404);

        $lamaran = Lamaran::with(['lowongan.perusahaan', 'logStatus', 'wawancara.presensi', 'profil.pengguna'])
            ->where('id_lamaran', $id_lamaran)
            ->where('id_profil', $profil->id_profil)
            ->firstOrFail();

        return response()->json([
            'status' => 'success',
            'data' => [
                'id_lamaran' => $lamaran->id_lamaran,
                'posisi' => $lamaran->lowongan->posisi ?? null,
                'nama_kafe' => $lamaran->lowongan->perusahaan->nama_perusahaan ?? null,
                'logo_kafe' => $lamaran->lowongan->perusahaan->logo_perusahaan ?? null,
                'nama_pelamar' => $lamaran->profil->nama_lengkap ?? $lamaran->profil->pengguna->nama_pengguna ?? null,
                // Status pill selalu dari DB (Diproses/Wawancara/Diterima/Ditolak), BUKAN dari log
                'status_saat_ini' => $lamaran->status,
                'timeline' => $lamaran->logStatus()
                    ->orderBy('dibuat_pada', 'desc')
                    ->get()
                    ->map(function ($log) {
                        return [
                            'status' => $log->status_baru,
                            'waktu' => $log->dibuat_pada?->toIso8601String(),
                            'keterangan' => $log->keterangan
                        ];
                    }),
                'wawancara' => $lamaran->wawancara ? [
                    'tanggal' => $lamaran->wawancara->tanggal_wawancara,
                    'lokasi' => $lamaran->wawancara->lokasi,
                    'catatan' => $lamaran->wawancara->catatan,
                    'status_jadwal' => $lamaran->wawancara->status,
                    ...$lamaran->wawancara->attendanceData($lamaran),
                ] : null
            ]
        ]);
    }

    public function detailWawancara($id_lamaran)
    {
        $profil = auth('api')->user()->profilPelamar;
        abort_unless($profil, 404);

        $lamaran = Lamaran::with(['wawancara.presensi', 'profil'])
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
        $isExpired = $wawancara->tanggal_wawancara->lt(now(config('app.timezone'))->startOfDay());

        return response()->json([
            'status' => 'success',
            'data' => [
                ...$wawancara->attendanceData($lamaran),
                'tanggal_wawancara' => $wawancara->tanggal_wawancara,
                'lokasi' => $wawancara->lokasi,
                'catatan' => $wawancara->catatan,
                'status' => $wawancara->status,
                'is_expired' => $isExpired,
                'label_expired' => $isExpired ? 'Kedaluwarsa' : 'Mendatang'
            ]
        ]);
    }

    public function konfirmasiWawancara(Request $request, $id_lamaran)
    {
        $request->validate([
            'image_base64' => 'required|string|max:8000000',
            'id_wawancara' => 'required|integer|min:1',
        ]);
        $profil = auth('api')->user()->profilPelamar;
        abort_unless($profil, 404);

        $lamaran = Lamaran::with(['lowongan.perusahaan.pengguna', 'profil'])
            ->where('id_lamaran', $id_lamaran)
            ->where('id_profil', $profil->id_profil)
            ->firstOrFail();

        $outcome = app(VerifikasiWajahService::class)->verify(
            $lamaran, $request->image_base64, (int) $request->id_wawancara
        );
        if (!empty($outcome['presensi'])) {
            return response()->json([
                'status' => 'success',
                'message' => 'Identitas terverifikasi. Anda hadir dan siap diwawancarai.',
                'data' => [
                                    'presensi' => $outcome['presensi']->responseData(),
                                    'status_jadwal' => $outcome['presensi']->wawancara->status,
                                ],
            ]);
        }

        $result = $outcome['result'];
        return response()->json([
            'status' => 'error',
            'message' => $result['message'],
            'confidence' => $result['confidence'] ?? null,
            'threshold' => $result['threshold'] ?? null,
            'face_detected' => $result['face_detected'] ?? false,
        ], !empty($outcome['conflict']) ? 409 : 422);
    }
}
