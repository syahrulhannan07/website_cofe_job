<?php

namespace App\Http\Controllers\Api\V1\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Nib;
use App\Models\ProfilPerusahaan;
use App\Jobs\ProcessNibScreeningJob;
use App\Services\Nib\NibScreeningResultService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

/**
 * Controller untuk integrasi hasil screening NIB dengan REST API.
 *
 * Hanya Super Admin yang dapat mengakses endpoint ini.
 */
class NibScreeningController extends Controller
{
    /**
     * Mulai proses screening NIB.
     *
     * Mengirimkan job ke antrian untuk diproses secara asynchronous.
     * Tidak menjalankan proses OCR/PDF secara langsung di request HTTP.
     *
     * @return Response
     */
    public function start(Request $request, string $id_nib): Response
    {
        $nib = Nib::where('id_nib', $id_nib)->first();

        if (!$nib) {
            return response()->json([
                'status' => 'error',
                'message' => 'NIB tidak ditemukan.',
            ], 404);
        }

        $profilPerusahaan = $nib->profilPerusahaan;

        if (!$profilPerusahaan) {
            return response()->json([
                'status' => 'error',
                'message' => 'Profil perusahaan tidak terkait dengan NIB ini.',
            ], 404);
        }

        // Periksa apakah screening sedang berjalan
        if (in_array($nib->status_proses_screening, ['Menunggu', 'Sedang_Diproses'])) {
            return response()->json([
                'status' => 'error',
                'message' => 'Screening sedang berjalan. Tunggu hingga selesai.',
                'data' => [
                    'id_nib' => $id_nib,
                    'status_proses_screening' => $nib->status_proses_screening,
                ],
            ], 409);
        }

        DB::beginTransaction();
        try {
            // Ubah status proses menjadi Menunggu
            $nib->update([
                'status_proses_screening' => 'Menunggu',
            ]);

            // Dispatch job ke antrian database
            dispatch(new ProcessNibScreeningJob($id_nib));

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Permintaan screening NIB telah diterima dan diproses melalui antrian.',
                'data' => [
                    'id_nib' => $id_nib,
                    'status_proses_screening' => 'Menunggu',
                    'catatan' => 'Hasil screening akan tersedia setelah job antrian selesai diproses.',
                ],
            ], 202);
        } catch (\Throwable $e) {
            DB::rollBack();

            Log::error('Gagal memulai screening NIB', [
                'id_nib' => $id_nib,
                'exception' => $e->getMessage(),
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memulai screening. Silakan coba lagi.',
            ], 500);
        }
    }

    /**
     * Ambil hasil screening NIB.
     *
     * Mengembalikan hasil dari kolom hasil_screening beserta metadata.
     *
     * @return Response
     */
    public function show(Request $request, string $id_nib): Response
    {
        $nib = Nib::where('id_nib', $id_nib)->first();

        if (!$nib) {
            return response()->json([
                'status' => 'error',
                'message' => 'NIB tidak ditemukan.',
            ], 404);
        }

        $hasilScreeningRaw = $nib->hasil_screening;
        $hasilScreening = $hasilScreeningRaw ? json_decode($hasilScreeningRaw, true) : null;

        if (!$hasilScreening) {
            return response()->json([
                'status' => 'success',
                'message' => 'Hasil screening belum tersedia.',
                'data' => [
                    'id_nib' => $id_nib,
                    'hasil_screening' => null,
                    'status_screening' => $nib->status_screening?->value,
                    'status_proses_screening' => $nib->status_proses_screening,
                    'diperiksa_pada' => $nib->diperiksa_pada?->toIso8601String(),
                    'catatan' => 'Belum ada proses screening yang berhasil disimpan.',
                ],
            ], 200);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Hasil screening berhasil diambil.',
            'data' => [
                'id_nib' => $id_nib,
                'hasil_screening' => $hasilScreening,
                'status_screening' => $nib->status_screening?->value,
                'status_proses_screening' => $nib->status_proses_screening,
                'diperiksa_pada' => $nib->diperiksa_pada?->toIso8601String(),
            ],
        ], 200);
    }

    /**
     * Mulai ulang screening NIB.
     *
     * Mengirimkan job baru ke antrian untuk screening ulang.
     * Hasil lama tetap tersedia sampai job baru berhasil.
     *
     * @return Response
     */
    public function resend(Request $request, string $id_nib): Response
    {
        $nib = Nib::where('id_nib', $id_nib)->first();

        if (!$nib) {
            return response()->json([
                'status' => 'error',
                'message' => 'NIB tidak ditemukan.',
            ], 404);
        }

        $profilPerusahaan = $nib->profilPerusahaan;

        if (!$profilPerusahaan) {
            return response()->json([
                'status' => 'error',
                'message' => 'Profil perusahaan tidak terkait dengan NIB ini.',
            ], 404);
        }

        // Periksa apakah screening sedang berjalan
        if (in_array($nib->status_proses_screening, ['Menunggu', 'Sedang_Diproses'])) {
            return response()->json([
                'status' => 'error',
                'message' => 'Screening sedang berjalan. Tunggu hingga selesai.',
                'data' => [
                    'id_nib' => $id_nib,
                    'status_proses_screening' => $nib->status_proses_screening,
                ],
            ], 409);
        }

        DB::beginTransaction();
        try {
            // Ubah status proses menjadi Menunggu (hasil lama tetap ada)
            $nib->update([
                'status_proses_screening' => 'Menunggu',
            ]);

            // Dispatch job baru ke antrian
            dispatch(new ProcessNibScreeningJob($id_nib));

            DB::commit();

            Log::info('Permintaan screening ulang NIB diterima.', [
                'id_nib' => $id_nib,
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Permintaan screening ulang NIB telah diterima dan diproses melalui antrian.',
                'data' => [
                    'id_nib' => $id_nib,
                    'status_proses_screening' => 'Menunggu',
                    'catatan' => 'Hasil screening lama tetap tersedia sampai job baru berhasil.',
                ],
            ], 202);
        } catch (\Throwable $e) {
            DB::rollBack();

            Log::error('Gagal memulai screening ulang NIB', [
                'id_nib' => $id_nib,
                'exception' => $e->getMessage(),
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memulai screening ulang. Silakan coba lagi.',
            ], 500);
        }
    }
}
