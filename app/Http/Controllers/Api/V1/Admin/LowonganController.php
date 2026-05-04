<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\V1\Admin\CreateLowonganRequest;
use App\Http\Resources\V1\Admin\LowonganResource;
use App\Models\Lowongan;
use App\Repositories\V1\Admin\LowonganRepository;
use App\Services\V1\Admin\LowonganService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class LowonganController extends Controller
{
    use ApiResponse;

    protected $service;
    protected $repository;

    public function __construct(LowonganService $service, LowonganRepository $repository)
    {
        $this->service = $service;
        $this->repository = $repository;
    }

    /**
     * Display a listing of vacancies.
     */
    public function index(Request $request)
    {
        $profil = auth('api')->user()->profilPerusahaan;
        if (!$profil) return $this->errorResponse('Profil perusahaan tidak ditemukan', 404);

        $idPerusahaan = $profil->id_perusahaan;
        $lowongan = $this->service->listVacancies($idPerusahaan, $request->all());

        // Calculate total applicants across all company vacancies
        $totalPelamar = \App\Models\Lamaran::whereHas('lowongan', function($query) use ($idPerusahaan) {
            $query->where('id_perusahaan', $idPerusahaan);
        })->count();

        // Detailed Statistics for the company
        $stats = [
            'total'         => Lowongan::where('id_perusahaan', $idPerusahaan)->count(),
            'active'        => Lowongan::where('id_perusahaan', $idPerusahaan)->where('status', 'Active')->count(),
            'draft'         => Lowongan::where('id_perusahaan', $idPerusahaan)->where('status', 'Draft')->count(),
            'closed'        => Lowongan::where('id_perusahaan', $idPerusahaan)->where('status', 'Closed')->count(),
            'total_pelamar' => $totalPelamar
        ];

        return LowonganResource::collection($lowongan)->additional([
            'meta' => [
                'statistik' => $stats
            ]
        ]);
    }

    /**
     * Store a newly created vacancy.
     */
    public function store(CreateLowonganRequest $request)
    {
        $profil = auth('api')->user()->profilPerusahaan;
        if (!$profil) return $this->errorResponse('Lengkapi profil kafe Anda terlebih dahulu', 403);

        if ($request->status === 'Active' && !$this->isProfileComplete($profil)) {
            return $this->errorResponse('Lengkapi profil kafe Anda terlebih dahulu sebelum memposting', 422);
        }

        try {
            $lowongan = $this->service->createLowongan($profil->id_perusahaan, $request->validated());
            return $this->successResponse(new LowonganResource($lowongan), 'Lowongan berhasil dibuat', 201);
        } catch (\Exception $e) {
            return $this->errorResponse('Terjadi kesalahan saat menyimpan lowongan', 500, $e->getMessage());
        }
    }

    /**
     * Display the specified vacancy.
     */
    public function show($id)
    {
        $profil = auth('api')->user()->profilPerusahaan;
        if (!$profil) return $this->errorResponse('Profil perusahaan tidak ditemukan', 404);

        $lowongan = $this->repository->findByIdAndPerusahaan($id, $profil->id_perusahaan, [
            'dokumenDibutuhkan.jenisDokumen', 
            'pertanyaanSeleksi'
        ]);

        if (!$lowongan) return $this->errorResponse('Lowongan tidak ditemukan', 404);

        // Applicant statistics
        $statistik = $lowongan->lamaran()
            ->selectRaw('status, COUNT(*) as jumlah')
            ->groupBy('status')
            ->pluck('jumlah', 'status');

        return $this->successResponse([
            'lowongan' => new LowonganResource($lowongan),
            'statistik_pelamar' => [
                'total'      => $statistik->sum(),
                'per_status' => $statistik,
            ],
        ]);
    }

    /**
     * Update the specified vacancy.
     */
    public function update(Request $request, $id)
    {
        $profil = auth('api')->user()->profilPerusahaan;
        if (!$profil) return $this->errorResponse('Profil perusahaan tidak ditemukan', 404);

        $lowongan = $this->repository->findByIdAndPerusahaan($id, $profil->id_perusahaan);
        if (!$lowongan) return $this->errorResponse('Lowongan tidak ditemukan', 404);

        // Simple validation for update (could also use a dedicated Request)
        $validator = Validator::make($request->all(), [
            'posisi'                               => 'nullable|string|max:255',
            'status'                               => 'nullable|in:Draft,Active,Closed',
            'batas_awal'                           => 'nullable|date|date_format:Y-m-d',
            'batas_akhir'                          => 'nullable|date|date_format:Y-m-d|after:batas_awal',
            'dokumen_dibutuhkan'                   => 'nullable|array',
            'dokumen_dibutuhkan.*.id_jenis_dokumen'=> 'required|exists:jenis_dokumen,id_jenis_dokumen',
            'dokumen_dibutuhkan.*.wajib'           => 'required|boolean',
            'pertanyaan'                           => 'nullable|array',
            'pertanyaan.*.pertanyaan'              => 'required|string',
            'pertanyaan.*.tipe_jawaban'            => 'required|string',
        ]);

        if ($validator->fails()) return $this->errorResponse('Validasi gagal', 422, $validator->errors());

        if ($request->status === 'Active' && $lowongan->status !== 'Active' && !$this->isProfileComplete($profil)) {
            return $this->errorResponse('Lengkapi profil kafe Anda terlebih dahulu sebelum memposting', 422);
        }

        try {
            $updated = $this->service->updateLowongan($lowongan, $request->all());
            return $this->successResponse(new LowonganResource($updated), 'Lowongan berhasil diperbarui');
        } catch (\Exception $e) {
            return $this->errorResponse('Terjadi kesalahan saat memperbarui lowongan', 500, $e->getMessage());
        }
    }

    /**
     * Delete the specified vacancy.
     */
    public function destroy($id)
    {
        $profil = auth('api')->user()->profilPerusahaan;
        if (!$profil) return $this->errorResponse('Profil perusahaan tidak ditemukan', 404);

        $lowongan = $this->repository->findByIdAndPerusahaan($id, $profil->id_perusahaan);
        if (!$lowongan) return $this->errorResponse('Lowongan tidak ditemukan', 404);

        if ($lowongan->lamaran()->count() > 0) {
            return $this->errorResponse('Tidak bisa menghapus lowongan yang sudah memiliki pelamar', 422);
        }

        $this->repository->delete($lowongan);

        return $this->successResponse(null, 'Lowongan berhasil dihapus');
    }

    /**
     * Publish a vacancy.
     */
    public function publish($id)
    {
        $profil = auth('api')->user()->profilPerusahaan;
        if (!$profil) return $this->errorResponse('Profil perusahaan tidak ditemukan', 404);

        $lowongan = $this->repository->findByIdAndPerusahaan($id, $profil->id_perusahaan);
        if (!$lowongan) return $this->errorResponse('Lowongan tidak ditemukan', 404);

        if ($lowongan->status === 'Active') return $this->errorResponse('Lowongan sudah dalam status Active', 422);
        if (!$this->isProfileComplete($profil)) return $this->errorResponse('Lengkapi profil kafe Anda terlebih dahulu', 422);

        $this->repository->update($lowongan, ['status' => 'Active']);

        return $this->successResponse(['id' => $lowongan->id_lowongan, 'status' => 'Active'], 'Lowongan berhasil dipublikasikan');
    }

    /**
     * Close a vacancy.
     */
    public function tutup($id)
    {
        $profil = auth('api')->user()->profilPerusahaan;
        if (!$profil) return $this->errorResponse('Profil perusahaan tidak ditemukan', 404);

        $lowongan = $this->repository->findByIdAndPerusahaan($id, $profil->id_perusahaan);
        if (!$lowongan) return $this->errorResponse('Lowongan tidak ditemukan', 404);

        if ($lowongan->status === 'Closed') return $this->errorResponse('Lowongan sudah ditutup', 422);

        $this->repository->update($lowongan, ['status' => 'Closed']);

        return $this->successResponse(['id' => $lowongan->id_lowongan, 'status' => 'Closed'], 'Lowongan berhasil ditutup');
    }

    private function isProfileComplete($profil): bool
    {
        return !empty($profil->nama_perusahaan) && !empty($profil->alamat_perusahaan) && !empty($profil->logo_perusahaan);
    }
}
