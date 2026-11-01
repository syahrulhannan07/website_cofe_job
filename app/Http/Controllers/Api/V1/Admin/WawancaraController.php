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
use Illuminate\Validation\ValidationException;

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

        // Auto cleanup overdue interviews
        $this->service->autoCancelOverdueInterviews($profil->id_perusahaan);

        $wawancara = $this->repository->getByPerusahaan($profil->id_perusahaan, $request->all());

        return WawancaraResource::collection($wawancara);
    }

    public function store(Request $request, $id_lamaran)
    {
        $profil = auth('api')->user()->profilPerusahaan;
        if (!$profil) return $this->errorResponse('Profil perusahaan tidak ditemukan', 404);

        $validator = $this->scheduleValidator($request, true);

        if ($validator->fails()) return $this->errorResponse($validator->errors()->first(), 422, $validator->errors());

        // [UPDATE LOGIC] - Eager load profil.pengguna untuk keperluan pengiriman email
        $lamaran = Lamaran::with(['profil.pengguna', 'lowongan'])
            ->whereHas('lowongan', fn($q) => $q->where('id_perusahaan', $profil->id_perusahaan))
            ->where('id_lamaran', $id_lamaran)
            ->first();

        if (!$lamaran) return $this->errorResponse('Lamaran tidak ditemukan', 404);


        try {
            $data = $validator->validated();
            $data['id_lamaran'] = $id_lamaran;
            
            $wawancara = $this->service->scheduleWawancara(
                $data, 
                $profil->nama_perusahaan, 
                $lamaran->lowongan->posisi, 
                $lamaran->profil->id_pengguna
            );

            event(new \App\Events\WawancaraScheduled(
                $wawancara->load('lamaran'),
                $profil->nama_perusahaan,
                $lamaran->lowongan->posisi,
                $lamaran->profil->id_pengguna
            ));

            // [UPDATE LOGIC] - Buat log manual untuk jadwal wawancara
            \App\Models\LogStatusLamaran::create([
                'id_lamaran' => $id_lamaran,
                'status_lama' => 'Wawancara',
                'status_baru' => 'Wawancara',
                'keterangan' => 'Jadwal wawancara telah dibuat.',
            ]);

            return $this->successResponse(new WawancaraResource($wawancara), 'Jadwal wawancara berhasil dibuat', 201);
        } catch (ValidationException $e) {
            return $this->errorResponse($e->validator->errors()->first(), 422, $e->errors());
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

        $validator = $this->scheduleValidator($request, false);

        if ($validator->fails()) return $this->errorResponse($validator->errors()->first(), 422, $validator->errors());

        try {
            $this->service->rescheduleWawancara($wawancara, $validator->validated(), $profil->nama_perusahaan);

            event(new \App\Events\WawancaraUpdated(
                $wawancara->refresh(),
                $profil->nama_perusahaan,
                (int) $wawancara->id_lamaran
            ));

            return $this->successResponse(new WawancaraResource($wawancara->refresh()), 'Jadwal berhasil diperbarui');
        } catch (ValidationException $e) {
            return $this->errorResponse($e->validator->errors()->first(), 422, $e->errors());
        } catch (\Exception $e) {
            return $this->errorResponse('Terjadi kesalahan saat memperbarui jadwal', 500, $e->getMessage());
        }
    }

    private function scheduleValidator(Request $request, bool $creating): \Illuminate\Contracts\Validation\Validator
    {
        $data = $request->all();

        // Canonical fields take precedence; aliases are only used when they are absent.
        if (!array_key_exists('tanggal_wawancara', $data)
            && (array_key_exists('tanggal', $data) || array_key_exists('waktu', $data))) {
            $date = $data['tanggal'] ?? null;
            $time = $data['waktu'] ?? null;
            $data['tanggal_wawancara'] = is_string($date) && is_string($time)
                ? $date . ' ' . $time
                : [$date, $time];
        }

        if (!array_key_exists('lokasi', $data) && array_key_exists('tempat_link', $data)) {
            $data['lokasi'] = $data['tempat_link'];
        }

        $datetime = $data['tanggal_wawancara'] ?? null;
        if (is_string($datetime)
            && preg_match('/\A\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(?::\d{2})?\z/', $datetime)) {
            // Normalize HTML datetime-local without parsing away invalid dates or supplied seconds.
            $data['tanggal_wawancara'] = str_replace('T', ' ', $datetime)
                . (strlen($datetime) === 16 ? ':00' : '');
        }

        return Validator::make($data, [
            'tanggal_wawancara' => $creating
                ? 'bail|required|date_format:Y-m-d H:i:s|after:now'
                : 'bail|nullable|date_format:Y-m-d H:i:s',
            'lokasi' => $creating ? 'bail|required|string|max:500' : 'bail|nullable|string|max:500',
            'status' => 'bail|nullable|in:Terjadwal,Selesai,Dibatalkan',
            'catatan' => 'bail|nullable|string|max:500',
        ], [
            'tanggal_wawancara.required' => 'Tanggal dan waktu wawancara wajib diisi.',
            'tanggal_wawancara.date_format' => 'Tanggal dan waktu wawancara tidak valid. Gunakan format YYYY-MM-DD HH:mm atau YYYY-MM-DD HH:mm:ss.',
            'tanggal_wawancara.after' => 'Tanggal dan waktu wawancara harus setelah waktu sekarang. Pilih tanggal atau jam yang akan datang.',
            'lokasi.required' => 'Lokasi atau tautan wawancara wajib diisi.',
            'lokasi.string' => 'Lokasi atau tautan wawancara harus berupa teks.',
            'lokasi.max' => 'Lokasi atau tautan wawancara maksimal 500 karakter.',
            'status.in' => 'Status wawancara harus Terjadwal, Selesai, atau Dibatalkan.',
            'catatan.string' => 'Catatan wawancara harus berupa teks.',
            'catatan.max' => 'Catatan wawancara maksimal 500 karakter.',
        ]);
    }

    public function destroy($id_wawancara)
    {
        $profil = auth('api')->user()->profilPerusahaan;
        if (!$profil) return $this->errorResponse('Profil perusahaan tidak ditemukan', 404);

        $wawancara = $this->repository->findByIdAndPerusahaan($id_wawancara, $profil->id_perusahaan, ['lamaran.profil']);
        if (!$wawancara) return $this->errorResponse('Jadwal tidak ditemukan', 404);

        try {
            $this->service->deleteWawancara($wawancara, $profil->nama_perusahaan);
            return $this->successResponse(null, 'Jadwal wawancara berhasil dihapus');
        } catch (ValidationException $e) {
            return $this->errorResponse($e->validator->errors()->first(), 422, $e->errors());
        } catch (\Exception $e) {
            return $this->errorResponse('Terjadi kesalahan saat menghapus jadwal', 500, $e->getMessage());
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
