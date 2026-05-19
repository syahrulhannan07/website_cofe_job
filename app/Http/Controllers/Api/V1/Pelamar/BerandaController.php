<?php

namespace App\Http\Controllers\Api\V1\Pelamar;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\Pelamar\LowonganResource;
use App\Http\Resources\Api\V1\Pelamar\PerusahaanResource;
use App\Models\Lowongan;
use App\Models\ProfilPerusahaan;
use Illuminate\Http\Request;

class BerandaController extends Controller
{
    /**
     * Mengambil data untuk halaman beranda.
     * Termasuk perusahaan populer dan lowongan terbaru.
     */
    public function index()
    {
        // 1. Ambil 4 perusahaan yang memiliki akumulasi jumlah lowongan terbanyak dan jumlah pelamar terbanyak.
        $perusahaanPopuler = ProfilPerusahaan::query()
            ->where('status_verifikasi', 'Diterima')
            ->selectRaw('profil_perusahaan.*, 
                (SELECT COUNT(*) FROM lowongan WHERE lowongan.id_perusahaan = profil_perusahaan.id_perusahaan AND lowongan.status = "Active" AND lowongan.deleted_at IS NULL) as lowongan_aktif_count,
                (SELECT COUNT(*) FROM lamaran JOIN lowongan ON lamaran.id_lowongan = lowongan.id_lowongan WHERE lowongan.id_perusahaan = profil_perusahaan.id_perusahaan) as pelamar_count')
            ->orderByRaw('(lowongan_aktif_count + pelamar_count) DESC')
            ->limit(4)
            ->get();

        // 2. Ambil lowongan terbaru dari perusahaan terverifikasi dan status lowongan sedang "Active".
        $lowonganTerbaru = Lowongan::query()
            ->with(['perusahaan'])
            ->where('status', 'Active')
            ->whereHas('perusahaan', function($query) {
                $query->where('status_verifikasi', 'Diterima');
            })
            ->where('batas_akhir', '>=', now()->toDateString())
            ->latest()
            ->limit(6)
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'perusahaan_populer' => PerusahaanResource::collection($perusahaanPopuler),
                'lowongan_terbaru' => LowonganResource::collection($lowonganTerbaru),
            ]
        ]);
    }
}
