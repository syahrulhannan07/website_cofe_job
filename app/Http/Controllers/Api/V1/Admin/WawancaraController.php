<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\Admin\WawancaraResource;
use App\Models\Lamaran;
use App\Repositories\V1\Admin\WawancaraRepository;
use App\Services\V1\Admin\WawancaraService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class WawancaraController extends Controller
{
    use ApiResponse;

    protected $service;
    protected $repository;

    public function __construct(WawancaraService $service, WawancaraRepository $repository)
    {
        $this->service = $service;
        $this->repository = $repository;
    }

    public function index(Request $request)
    {
        $profil = auth('api')->user()->profilPerusahaan;
        if (!$profil) return $this->errorResponse('Profil perusahaan tidak ditemukan', 404);

        $wawancara = $this->repository->getByPerusahaan($profil->id_perusahaan, $request->all());

        return WawancaraResource::collection($wawancara);
    }

    public function store(Request $request, $id_lamaran)
    {
        $profil = auth('api')->user()->profilPerusahaan;
        if (!$profil) return $this->errorResponse('Profil perusahaan tidak ditemukan', 404);

        $validator = Validator::make($request->all(), [
            'tanggal_wawancara' => 'required|date_format:Y-m-d H:i|after:now',
            'lokasi'            => 'required|string|max:500',
            'catatan'           => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) return $this->errorResponse('Validasi gagal', 422, $validator->errors());

        $lamaran = Lamaran::with(['profil', 'lowongan'])
            ->whereHas('lowongan', fn($q) => $q->where('id_perusahaan', $profil->id_perusahaan))
            ->where('id_lamaran', $id_lamaran)
            ->first();

        if (!$lamaran) return $this->errorResponse('Lamaran tidak ditemukan', 404);
        if ($lamaran->status !== 'Wawancara') return $this->errorResponse('Status lamaran harus Wawancara', 422);

        try {
            $wawancara = $this->service->scheduleWawancara(
                $request->all(), 
                $profil->nama_perusahaan, 
                $lamaran->lowongan->posisi, 
                $lamaran->profil->id_pengguna
            );
            return $this->successResponse(new WawancaraResource($wawancara), 'Jadwal wawancara berhasil dibuat', 201);
        } catch (\Exception $e) {
            return $this->errorResponse('Terjadi kesalahan saat menyimpan jadwal', 500, $e->getMessage());
        }
    }

    public function update(Request $request, $id_wawancara)
    {
        $profil = auth('api')->user()->profilPerusahaan;
        if (!$profil) return $this->errorResponse('Profil perusahaan tidak ditemukan', 404);

        $wawancara = $this->repository->findByIdAndPerusahaan($id_wawancara, $profil->id_perusahaan, ['lamaran.profil']);
        if (!$wawancara) return $this->errorResponse('Jadwal tidak ditemukan', 404);
        if ($wawancara->status !== 'Terjadwal') return $this->errorResponse('Hanya jadwal Terjadwal yang bisa diubah', 422);

        try {
            $this->service->rescheduleWawancara($wawancara, $request->all(), $profil->nama_perusahaan);
            return $this->successResponse(new WawancaraResource($wawancara->refresh()), 'Jadwal berhasil diperbarui');
        } catch (\Exception $e) {
            return $this->errorResponse('Terjadi kesalahan saat memperbarui jadwal', 500, $e->getMessage());
        }
    }

    public function destroy($id_wawancara)
    {
        $profil = auth('api')->user()->profilPerusahaan;
        if (!$profil) return $this->errorResponse('Profil perusahaan tidak ditemukan', 404);

        $wawancara = $this->repository->findByIdAndPerusahaan($id_wawancara, $profil->id_perusahaan, ['lamaran.profil']);
        if (!$wawancara) return $this->errorResponse('Jadwal tidak ditemukan', 404);

        try {
            $this->service->cancelWawancara($wawancara, $profil->nama_perusahaan);
            return $this->successResponse(null, 'Jadwal wawancara berhasil dibatalkan');
        } catch (\Exception $e) {
            return $this->errorResponse('Terjadi kesalahan saat membatalkan jadwal', 500, $e->getMessage());
        }
    }

    public function selesai($id_wawancara)
    {
        $profil = auth('api')->user()->profilPerusahaan;
        if (!$profil) return $this->errorResponse('Profil perusahaan tidak ditemukan', 404);

        $wawancara = $this->repository->findByIdAndPerusahaan($id_wawancara, $profil->id_perusahaan);
        if (!$wawancara) return $this->errorResponse('Jadwal tidak ditemukan', 404);

        $this->repository->update($wawancara, ['status' => 'Selesai']);

        return $this->successResponse(['id' => $id_wawancara, 'status' => 'Selesai'], 'Wawancara selesai');
    }
}
