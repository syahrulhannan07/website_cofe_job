<?php

namespace App\Services\V1\Pelamar;

use App\Events\WawancaraConfirmedByPelamar;
use App\Models\DataWajah;
use App\Models\Lamaran;
use App\Models\PresensiWawancara;
use App\Models\ProfilPelamar;
use App\Models\VerifikasiWajah;
use App\Models\Wawancara;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class VerifikasiWajahService
{
    public function __construct(private FaceRecognitionService $faceService) {}

    /** Persist an attempt before calling the provider so a retry invalidates older application successes. */
    public function verify(Lamaran $application, string $image, ?int $interviewId = null): array
    {
        $attempt = DB::transaction(function () use ($application, $interviewId) {
            [$profile, $application, $interview] = $this->lockContext($application, $interviewId);
            if ($interview?->presensi) {
                return $interview->presensi;
            }
            $this->validateContext($profile, $application, $interview);
            DataWajah::updateOrCreate(['id_profil' => $profile->id_profil], ['referensi_wajah' => $profile->foto_profil]);

            return VerifikasiWajah::create([
                'id_pengguna' => $profile->id_pengguna,
                'id_lamaran' => $application->id_lamaran,
                'id_wawancara' => $interview?->id_wawancara,
                'jenis_verifikasi' => $interview ? 'Presensi Wawancara' : 'Lamaran',
                'status_verifikasi' => 'Diproses',
                'referensi_wajah' => $profile->foto_profil,
                'jadwal_wawancara' => $interview?->tanggal_wawancara,
            ]);
        });

        if ($attempt instanceof PresensiWawancara) {
            return ['presensi' => $attempt, 'result' => ['success' => true]];
        }

        // No database locks are held during the external request. Never persist the submitted image.
        try {
            $result = $this->faceService->compareFaces($attempt->referensi_wajah, $image);
        } catch (\Throwable $e) {
            $result = [
                'success' => false, 'confidence' => null, 'threshold' => null, 'face_detected' => false,
                'message' => 'Layanan verifikasi wajah sedang tidak tersedia. Silakan coba lagi.',
            ];
        }

        return DB::transaction(function () use ($application, $interviewId, $attempt, $result) {
            $attempt->update([
                'skor_kemiripan' => $result['confidence'] ?? null,
                'ambang_batas' => $result['threshold'] ?? null,
                'status_verifikasi' => !empty($result['success']) ? 'Berhasil' : 'Gagal',
            ]);
            // Retain provider scores for auditing, but never leave a conflicted attempt usable.
            $profile = ProfilPelamar::whereKey($application->id_profil)->lockForUpdate()->first();
            $current = Lamaran::whereKey($application->id_lamaran)->lockForUpdate()->first();
            $interview = $interviewId ? Wawancara::whereKey($interviewId)->lockForUpdate()->first() : null;
            $latestInterviewId = $interviewId && $current ? $current->wawancara?->id_wawancara : null;
            $stale = !$profile || !$current || $profile->foto_profil !== $attempt->referensi_wajah
                || ($interviewId && (!$interview || $latestInterviewId !== $interviewId
                    || !$interview->tanggal_wawancara->equalTo($attempt->jadwal_wawancara)));

            if (!$stale) {
                // An overlapping successful attendance wins, without emitting another event.
                if ($interview?->presensi) {
                    return ['result' => ['success' => true], 'presensi' => $interview->presensi];
                }
                try {
                    $this->validateContext($profile, $current, $interview);
                } catch (ValidationException $e) {
                    $stale = true;
                }
            }
            if ($stale) {
                $attempt->update(['status_verifikasi' => 'Kedaluwarsa']);
                return ['result' => array_merge($result, [
                    'success' => false,
                    'message' => 'Profil atau jadwal wawancara telah berubah. Muat ulang dan lakukan verifikasi kembali.',
                ]), 'conflict' => true];
            }

            $attendance = null;
            if ($interview && !empty($result['success'])) {
                $attendance = PresensiWawancara::create([
                    'id_wawancara' => $interview->id_wawancara,
                    'id_pengguna' => $profile->id_pengguna,
                    'id_verifikasi_wajah' => $attempt->id_verifikasi,
                    'waktu_presensi' => now(),
                    'status_kehadiran' => 'Hadir',
                ]);
                $interview->update(['status' => 'Selesai']);
                DB::afterCommit(fn () => event(new WawancaraConfirmedByPelamar(
                    $current->load(['lowongan.perusahaan.pengguna', 'profil'])
                )));
            }

            return ['result' => $result, 'verification' => $attempt, 'presensi' => $attendance];
        });
    }

    private function lockContext(Lamaran $application, ?int $interviewId): array
    {
        $profile = ProfilPelamar::whereKey($application->id_profil)->lockForUpdate()->firstOrFail();
        $application = Lamaran::whereKey($application->id_lamaran)->lockForUpdate()->firstOrFail();
        $interview = null;
        if ($interviewId !== null) {
            $interview = Wawancara::where('id_lamaran', $application->id_lamaran)
                ->whereKey($interviewId)->lockForUpdate()->first();
            if (!$interview || $application->wawancara?->id_wawancara !== $interviewId) {
                throw ValidationException::withMessages(['id_wawancara' => 'Jadwal wawancara telah berubah. Muat ulang jadwal terbaru.']);
            }
        }

        return [$profile, $application, $interview];
    }

    private function validateContext(ProfilPelamar $profile, Lamaran $application, ?Wawancara $interview): void
    {
        if ($interview) {
            $reason = $interview->alasanPresensi($application);
            if ($reason !== null) {
                throw ValidationException::withMessages(['id_wawancara' => $reason]);
            }
        } elseif ($application->status !== 'Diproses' || !empty($application->snapshot_profil)) {
            throw ValidationException::withMessages(['id_lamaran' => 'Lamaran ini sudah dikirim.']);
        }
        if (empty($profile->foto_profil)) {
            throw ValidationException::withMessages(['image_base64' => 'Foto profil tidak ditemukan. Silakan upload foto profil terlebih dahulu.']);
        }
    }
}
