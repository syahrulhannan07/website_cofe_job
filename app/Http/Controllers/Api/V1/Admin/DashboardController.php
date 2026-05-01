<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Lamaran;
use App\Models\Lowongan;
use App\Models\Wawancara;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $admin = auth('api')->user();
        // Gunakan query langsung untuk memastikan data terbaru dari database
        $perusahaan = \App\Models\ProfilPerusahaan::where('id_pengguna', $admin->id_pengguna)->first();

        if (!$perusahaan) {
            return response()->json([
                'status' => 'error',
                'message' => 'Profil perusahaan tidak ditemukan'
            ], 404);
        }

        $idPerusahaan = $perusahaan->id_perusahaan;

        // 1. Statistik Utama
        $totalPelamar = Lamaran::whereHas('lowongan', function ($query) use ($idPerusahaan) {
            $query->where('id_perusahaan', $idPerusahaan);
        })->count();

        $lowonganAktif = Lowongan::where('id_perusahaan', $idPerusahaan)
            ->where('status', 'Aktif')
            ->count();

        $wawancaraTerjadwal = Wawancara::whereHas('lamaran.lowongan', function ($query) use ($idPerusahaan) {
            $query->where('id_perusahaan', $idPerusahaan);
        })->where('status', 'Terjadwal')->count();

        $lamaranDiterima = Lamaran::whereHas('lowongan', function ($query) use ($idPerusahaan) {
            $query->where('id_perusahaan', $idPerusahaan);
        })->where('status', 'Diterima')->count();

        // 2. Tren Pelamar (30 hari terakhir) - Timezone Asia/Jakarta
        $tglMulai = Carbon::now('Asia/Jakarta')->subDays(29)->startOfDay();
        $tglSelesai = Carbon::now('Asia/Jakarta')->endOfDay();

        $trenPelamar = Lamaran::whereHas('lowongan', function ($query) use ($idPerusahaan) {
            $query->where('id_perusahaan', $idPerusahaan);
        })
        ->whereBetween('created_at', [$tglMulai, $tglSelesai])
        ->select(DB::raw('DATE(created_at) as tanggal'), DB::raw('count(*) as jumlah'))
        ->groupBy('tanggal')
        ->orderBy('tanggal', 'ASC')
        ->get();

        // Mengisi tanggal kosong dengan 0
        $dataTren = [];
        $currentDate = clone $tglMulai;
        while ($currentDate <= $tglSelesai) {
            $dateStr = $currentDate->format('Y-m-d');
            $match = $trenPelamar->firstWhere('tanggal', $dateStr);
            $dataTren[] = [
                'tanggal' => $currentDate->format('d M'),
                'jumlah' => $match ? $match->jumlah : 0
            ];
            $currentDate->addDay();
        }

        // 3. Pelamar Terbaru (10 data)
        $pelamarTerbaru = Lamaran::with(['profil', 'lowongan'])
            ->whereHas('lowongan', function ($query) use ($idPerusahaan) {
                $query->where('id_perusahaan', $idPerusahaan);
            })
            ->orderBy('created_at', 'DESC')
            ->limit(10)
            ->get()
            ->map(function ($l) {
                return [
                    'id' => $l->id_lamaran,
                    'nama' => ($l->profil?->nama_lengkap) ?: 'Tanpa Nama',
                    'posisi' => $l->lowongan->posisi,
                    'tanggal' => Carbon::parse($l->created_at)->translatedFormat('d F Y'),
                    'status' => $l->status
                ];
            });

        // 4. Distribusi Status Lamaran
        $distribusiStatus = Lamaran::whereHas('lowongan', function ($query) use ($idPerusahaan) {
            $query->where('id_perusahaan', $idPerusahaan);
        })
        ->select('status', DB::raw('count(*) as jumlah'))
        ->groupBy('status')
        ->get()
        ->pluck('jumlah', 'status');

        return response()->json([
            'status' => 'success',
            'data' => [
                'identitas' => [
                    'nama_pengguna' => $admin->nama_pengguna,
                    'nama_perusahaan' => $perusahaan->nama_perusahaan,
                    'logo_perusahaan' => $perusahaan->logo_perusahaan ? asset('storage/' . $perusahaan->logo_perusahaan) : null,
                    'status_verifikasi' => $perusahaan->status_verifikasi
                ],
                'statistik' => [
                    'total_pelamar' => $totalPelamar,
                    'lowongan_aktif' => $lowonganAktif,
                    'wawancara_terjadwal' => $wawancaraTerjadwal,
                    'lamaran_diterima' => $lamaranDiterima
                ],
                'tren_pelamar' => $dataTren,
                'pelamar_terbaru' => $pelamarTerbaru,
                'distribusi_status' => [
                    'Diproses' => $distribusiStatus['Diproses'] ?? 0,
                    'Wawancara' => $distribusiStatus['Wawancara'] ?? 0,
                    'Ditolak' => $distribusiStatus['Ditolak'] ?? 0,
                    'Diterima' => $distribusiStatus['Diterima'] ?? 0,
                ]
            ]
        ]);
    }
}
