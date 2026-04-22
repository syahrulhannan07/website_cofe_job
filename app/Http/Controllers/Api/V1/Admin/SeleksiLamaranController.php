<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\Admin\LamaranResource;
use App\Repositories\V1\Admin\LamaranRepository;
use App\Services\V1\Admin\LamaranService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SeleksiLamaranController extends Controller
{
    use ApiResponse;

    protected $service;
    protected $repository;

    public function __construct(LamaranService $service, LamaranRepository $repository)
    {
        $this->service = $service;
        $this->repository = $repository;
    }

    /**
     * Daftar semua kandidat per lowongan.
     */
    public function daftarPelamar(Request $request, $id_lowongan)
    {
        $profil = auth('api')->user()->profilPerusahaan;
        if (!$profil) return $this->errorResponse('Profil perusahaan tidak ditemukan', 404);

        $lamaran = $this->repository->getByLowongan($id_lowongan, $request->all());

        if ($lamaran->isEmpty()) {
            return $this->successResponse([], 'Belum ada lamaran masuk untuk posisi ini');
        }

        return LamaranResource::collection($lamaran);
    }

    /**
     * Detail lengkap satu kandidat.
     */
    public function detailLamaran($id_lamaran)
    {
        $profil = auth('api')->user()->profilPerusahaan;
        if (!$profil) return $this->errorResponse('Profil perusahaan tidak ditemukan', 404);

        $lamaran = $this->repository->findByIdAndPerusahaan($id_lamaran, $profil->id_perusahaan, [
            'profil.pendidikan',
            'profil.skills',
            'profil.pengalamanKerja',
            'lamaranDokumen.jenisDokumen',
            'jawabanPertanyaan.pertanyaanLowongan',
            'lowongan'
        ]);

        if (!$lamaran) return $this->errorResponse('Lamaran tidak ditemukan', 404);

        return $this->successResponse(new LamaranResource($lamaran));
    }

    /**
     * Update status lamaran.
     */
    public function updateStatus(Request $request, $id_lamaran)
    {
        $profil = auth('api')->user()->profilPerusahaan;
        if (!$profil) return $this->errorResponse('Profil perusahaan tidak ditemukan', 404);

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:Diproses,Wawancara,Diterima,Ditolak',
        ]);

        if ($validator->fails()) return $this->errorResponse('Validasi gagal', 422, $validator->errors());

        $lamaran = $this->repository->findByIdAndPerusahaan($id_lamaran, $profil->id_perusahaan, ['lowongan', 'profil']);
        if (!$lamaran) return $this->errorResponse('Lamaran tidak ditemukan', 404);

        try {
            $this->service->updateStatus($lamaran, $request->status, $profil->nama_perusahaan);
            return $this->successResponse(null, 'Status lamaran berhasil diperbarui');
        } catch (\Exception $e) {
            return $this->errorResponse('Terjadi kesalahan saat memperbarui status', 500, $e->getMessage());
        }
    }
}
