<?php

namespace App\Jobs;

use App\Models\Nib;
use App\Services\Nib\NibScreeningResultService;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Carbon;

/**
 * Proses screening NIB secara asynchronous melalui Laravel Queue.
 *
 * Job ini menerima id_nib, menjalankan NibScreeningResultService::generate(),
 * dan menyimpan hasilnya ke kolom hasil_screening pada tabel NIB.
 *
 * Mengelola status_proses_screening untuk melacak alur screening:
 * Belum_Dimulai → Menunggu → Sedang_Diproses → Selesai/Gagal.
 *
 * Tidak mengubah status_verifikasi perusahaan.
 * Ditolak hanya boleh ditetapkan melalui keputusan manual Super Admin.
 */
class ProcessNibScreeningJob implements ShouldQueue, ShouldBeUnique
{
    use Dispatchable, InteractsWithQueue, SerializesModels;

    public string $id_nib;

    /**
     * @param  string  $id_nib  Primary key record NIB
     */
    public function __construct(string $id_nib)
    {
        $this->id_nib = $id_nib;
    }

    /**
     * ID unik untuk pencegahan job duplikat pada NIB yang sama.
     */
    public function uniqueId(): string
    {
        return 'nib-screening:' . $this->id_nib;
    }

    /**
     * Jalankan proses screening NIB.
     */
    public function handle(NibScreeningResultService $screeningService): void
    {
        $nib = Nib::where('id_nib', $this->id_nib)->first();

        if (!$nib) {
            Log::warning('NIB tidak ditemukan untuk screening.', [
                'id_nib' => $this->id_nib,
            ]);

            return;
        }

        // 7. Ketika job mulai dijalankan, ubah status menjadi Sedang_Diproses
        $nib->update([
            'status_proses_screening' => 'Sedang_Diproses',
        ]);

        $profilPerusahaan = $nib->profilPerusahaan;

        $result = $screeningService->generate($this->id_nib, $profilPerusahaan);

        if ($result['status_proses'] === NibScreeningResultService::STATUS_PROSES_GAGAL) {
            $this->handleFailedResult($nib, $result);

            return;
        }

        $this->saveSuccessfulResult($nib, $result);
    }

    /**
     * Simpan hasil screening yang berhasil.
     *
     * 8. Ketika screening berhasil, simpan hasil dan ubah status menjadi Selesai.
     * Sinkronkan status_screening berdasarkan aturan:
     * - BERHASIL tanpa review manual → Lulus
     * - BERHASIL_DENGAN_PERINGATAN → Perlu_Review
     * - Perlu review manual → Perlu_Review
     */
    private function saveSuccessfulResult(Nib $nib, array $result): void
    {
        $statusScreening = $this->mapHasilKeStatusScreening($result);

        $nib->update([
            'hasil_screening' => json_encode($result, JSON_UNESCAPED_UNICODE),
            'status_proses_screening' => 'Selesai',
            'status_screening' => $statusScreening,
            'diperiksa_pada' => Carbon::now(),
        ]);

        Log::info('Screening NIB berhasil disimpan.', [
            'id_nib' => $this->id_nib,
            'status_proses' => $result['status_proses'],
            'status_screening' => $statusScreening,
            'perlu_review_manual' => $result['perlu_review_manual'],
        ]);
    }

    /**
     * Map hasil proses screening ke enum status_screening.
     *
     * ATURAN WAJIB: Ditolak hanya boleh ditetapkan melalui keputusan manual Super Admin.
     * Jangan mengubah status_screening menjadi Ditolak berdasarkan hasil otomatis.
     */
    private function mapHasilKeStatusScreening(array $result): string
    {
        $statusProses = $result['status_proses'] ?? '';
        $perluReviewManual = $result['perlu_review_manual'] ?? false;

        // GAGAL teknis → jangan ubah status_screening (pertahankan yang lama)
        if ($statusProses === NibScreeningResultService::STATUS_PROSES_GAGAL) {
            return $this->getExistingStatusScreening();
        }

        // BERHASIL_DENGAN_PERINGATAN → Perlu_Review
        if ($statusProses === NibScreeningResultService::STATUS_PROSES_BERHASIL_DENGAN_PERINGATAN) {
            return 'Perlu_Review';
        }

        // Perlu review manual → Perlu_Review
        if ($perluReviewManual === true) {
            return 'Perlu_Review';
        }

        // BERHASIL tanpa review manual → Lulus
        if ($statusProses === NibScreeningResultService::STATUS_PROSES_BERHASIL) {
            return 'Lulus';
        }

        // Default: pertahankan status yang ada
        return $this->getExistingStatusScreening($nib);
    }

    /**
     * Ambil status_screening yang ada dari database.
     */
    private function getExistingStatusScreening(Nib $nib): string
    {
        $existing = Nib::where('id_nib', $this->id_nib)->value('status_screening');

        return $existing ?: 'Belum_Diperiksa';
    }

    /**
     * Tangani hasil screening yang gagal.
     *
     * 9. Ketika job gagal permanen, ubah status menjadi Gagal.
     * Pertahankan hasil berhasil sebelumnya jika ada.
     * Jangan menganggap dokumen tidak valid hanya karena kegagalan teknis.
     */
    private function handleFailedResult(Nib $nib, array $result): void
    {
        $existingRaw = $nib->fresh()->hasil_screening;
        $existing = $existingRaw ? json_decode($existingRaw, true) : null;

        // Ubah status proses menjadi Gagal
        $nib->update([
            'status_proses_screening' => 'Gagal',
        ]);

        if ($existing && is_array($existing)
            && isset($existing['status_proses'])
            && $existing['status_proses'] !== NibScreeningResultService::STATUS_PROSES_GAGAL
        ) {
            // Pertahankan hasil berhasil sebelumnya
            Log::warning('Screening NIB gagal, pertahankan hasil berhasil sebelumnya.', [
                'id_nib' => $this->id_nib,
                'status_proses_baru' => $result['status_proses'],
                'alasan_baru' => $result['alasan_review'] ?? null,
            ]);

            return;
        }

        // Belum ada hasil sebelumnya, catat kegagalan melalui logging
        Log::error('Screening NIB gagal sepenuhnya, belum ada hasil sebelumnya.', [
            'id_nib' => $this->id_nib,
            'alasan' => $result['alasan_review'] ?? 'Tidak diketahui',
        ]);
    }

    /**
     * Tangani kegagalan job (exception).
     *
     * Pastikan status proses tidak tertinggal sebagai Sedang_Diproses
     * ketika job sudah gagal permanen.
     */
    public function failed(\Throwable $exception): void
    {
        $nib = Nib::where('id_nib', $this->id_nib)->first();

        if ($nib) {
            $nib->update([
                'status_proses_screening' => 'Gagal',
            ]);
        }

        Log::error('Job ProcessNibScreeningJob gagal.', [
            'id_nib' => $this->id_nib,
            'exception' => $exception->getMessage(),
        ]);
    }
}
