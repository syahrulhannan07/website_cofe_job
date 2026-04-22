<?php

namespace App\Http\Controllers\Api\V1\Pelamar;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\Pelamar\LowonganDetailResource;
use App\Http\Resources\Api\V1\Pelamar\LowonganResource;
use App\Models\Lowongan;
use Illuminate\Http\Request;

class LowonganController extends Controller
{
    public function index(Request $request)
    {
        $query = Lowongan::query()
            ->with(['perusahaan'])
            ->where('status', 'Aktif')
            ->where('batas_akhir', '>=', now()->toDateString());

        // Pencarian berdasarkan posisi atau deskripsi
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('posisi', 'like', "%{$search}%")
                  ->orWhere('deskripsi', 'like', "%{$search}%");
            });
        }

        $perPage = $request->get('per_page', 10);
        $lowongan = $query->latest()->paginate($perPage);

        return LowonganResource::collection($lowongan);
    }

    public function show($id)
    {
        $lowongan = Lowongan::with(['perusahaan', 'dokumenDibutuhkan.jenisDokumen', 'pertanyaanSeleksi'])
            ->where('id_lowongan', $id)
            ->firstOrFail();

        return new LowonganDetailResource($lowongan);
    }
}
