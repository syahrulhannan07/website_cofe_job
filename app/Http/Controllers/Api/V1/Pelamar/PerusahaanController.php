<?php

namespace App\Http\Controllers\Api\V1\Pelamar;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\Pelamar\PerusahaanResource;
use App\Models\ProfilPerusahaan;
use Illuminate\Http\Request;

class PerusahaanController extends Controller
{
    public function index(Request $request)
    {
        $query = ProfilPerusahaan::aktifTerverifikasi()
            ->withCount(['lowongan' => function ($query) {
                $query->where('status', 'Active');
            }]);

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('nama_perusahaan', 'like', "%{$search}%");
        }

        $perPage = $request->get('per_page', 12);
        $perusahaan = $query->latest()->paginate($perPage);

        return PerusahaanResource::collection($perusahaan);
    }

    public function show($id)
    {
        $perusahaan = ProfilPerusahaan::aktifTerverifikasi()
            ->with(['pengguna', 'lowongan' => function ($query) {
                $query->where('status', 'Active')
                      ->where('batas_akhir', '>=', now()->toDateString());
            }])
            ->withCount(['lowongan' => function ($query) {
                $query->where('status', 'Active')
                      ->where('batas_akhir', '>=', now()->toDateString());
            }])
            ->where('id_perusahaan', $id)
            ->firstOrFail();

        return new PerusahaanResource($perusahaan);
    }
}
