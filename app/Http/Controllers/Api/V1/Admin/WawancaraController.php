<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Lamaran;
use App\Models\Notifikasi;
use App\Models\Wawancara;
use App\Services\NotifikasiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class WawancaraController extends Controller
{
    protected $notifikasiService;

    public function __construct(NotifikasiService $notifikasiService)
    {
        $this->notifikasiService = $notifikasiService;
    }

    /**
     * Buat jadwal wawancara untuk kandidat.
     * Prasyarat: status lamaran harus 'Wawancara'.
     *
     * POST /api/v1/admin/lamaran/{id_lamaran}/wawancara
     */
    public function store(Request $request, $id_lamaran)
    {
        $admin  = auth('api')->user();
        $profil = $admin->profilPerusahaan;

        if (!$profil) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Profil perusahaan tidak ditemukan',
            ], 404);
        }

        // Validasi input
        $validator = Validator::make($request->all(), [
            'tanggal_wawancara' => 'required|date_format:Y-m-d H:i|after:now',
            'lokasi'            => 'required|string|max:500',
            'catatan'           => 'nullable|string|max:500',
        ], [
            'tanggal_wawancara.required'    => 'Harap isi bidang ini.',
            'tanggal_wawancara.date_format' => 'Format tanggal harus Y-m-d H:i (contoh: 2026-05-10 09:00).',
            'tanggal_wawancara.after'       => 'Tanggal wawancara tidak valid. Harus di masa depan.',
            'lokasi.required'               => 'Harap isi bidang ini.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Validasi gagal',
                'errors'  => $validator->errors(),
            ], 422);
        }

        // Validasi ownership + status lamaran
        $lamaran = Lamaran::with(['profil.pengguna', 'lowongan'])
            ->whereHas('lowongan', fn ($q) =>
                $q->where('id_perusahaan', $profil->id_perusahaan)
            )
            ->where('id_lamaran', $id_lamaran)
            ->first();

        if (!$lamaran) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Lamaran tidak ditemukan',
            ], 404);
        }

        // Prasyarat: lamaran harus berstatus 'Wawancara'
        if ($lamaran->status !== 'Wawancara') {
            return response()->json([
                'status'  => 'error',
                'message' => "Jadwal wawancara hanya bisa dibuat untuk lamaran berstatus 'Wawancara'. Status saat ini: '{$lamaran->status}'.",
            ], 422);
        }

        // Cek apakah sudah ada jadwal aktif (Terjadwal) untuk lamaran ini
        $jadwalAktif = Wawancara::where('id_lamaran', $id_lamaran)
            ->where('status', 'Terjadwal')
            ->first();

        if ($jadwalAktif) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Sudah ada jadwal wawancara aktif untuk lamaran ini. Lakukan reschedule via PUT /admin/wawancara/{id}.',
            ], 422);
        }

        try {
            DB::beginTransaction();

            // 1. Simpan ke tabel wawancara
            $wawancara = Wawancara::create([
                'id_lamaran'        => $id_lamaran,
                'tanggal_wawancara' => $request->tanggal_wawancara,
                'lokasi'            => $request->lokasi,
                'catatan'           => $request->catatan,
                'status'            => 'Terjadwal',
            ]);

            // 2. Kirim notifikasi ke pelamar
            $this->kirimNotifikasi(
                idPengguna : $lamaran->profil?->pengguna?->id_pengguna,
                judul      : 'Jadwal Wawancara 🗓️',
                pesan      : $this->pesanJadwal(
                    'Anda dijadwalkan untuk wawancara',
                    $lamaran->lowongan?->posisi,
                    $profil->nama_perusahaan,
                    $request->tanggal_wawancara,
                    $request->lokasi
                )
            );

            DB::commit();

            return response()->json([
                'status'  => 'success',
                'message' => 'Jadwal wawancara berhasil dibuat',
                'data'    => $wawancara->load('lamaran'),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status'  => 'error',
                'message' => 'Terjadi kesalahan saat menyimpan jadwal',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update jadwal wawancara (reschedule).
     * Hanya bisa jika status = 'Terjadwal'.
     *
     * PUT /api/v1/admin/wawancara/{id_wawancara}
     */
    public function update(Request $request, $id_wawancara)
    {
        $admin  = auth('api')->user();
        $profil = $admin->profilPerusahaan;

        if (!$profil) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Profil perusahaan tidak ditemukan',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'tanggal_wawancara' => 'nullable|date_format:Y-m-d H:i|after:now',
            'lokasi'            => 'nullable|string|max:500',
            'catatan'           => 'nullable|string|max:500',
        ], [
            'tanggal_wawancara.date_format' => 'Format tanggal harus Y-m-d H:i (contoh: 2026-05-10 09:00).',
            'tanggal_wawancara.after'       => 'Tanggal wawancara tidak valid. Harus di masa depan.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Validasi gagal',
                'errors'  => $validator->errors(),
            ], 422);
        }

        // Validasi ownership via chain: wawancara → lamaran → lowongan → perusahaan
        $wawancara = Wawancara::with(['lamaran.profil.pengguna', 'lamaran.lowongan'])
            ->whereHas('lamaran.lowongan', fn ($q) =>
                $q->where('id_perusahaan', $profil->id_perusahaan)
            )
            ->where('id_wawancara', $id_wawancara)
            ->first();

        if (!$wawancara) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Jadwal wawancara tidak ditemukan',
            ], 404);
        }

        if ($wawancara->status !== 'Terjadwal') {
            return response()->json([
                'status'  => 'error',
                'message' => "Hanya jadwal berstatus 'Terjadwal' yang bisa diubah. Status saat ini: '{$wawancara->status}'.",
            ], 422);
        }

        try {
            DB::beginTransaction();

            $wawancara->update($request->only(['tanggal_wawancara', 'lokasi', 'catatan']));

            // Kirim notifikasi perubahan jadwal
            $lamaran = $wawancara->lamaran;
            $this->kirimNotifikasi(
                idPengguna : $lamaran->profil?->pengguna?->id_pengguna,
                judul      : 'Perubahan Jadwal Wawancara 🔄',
                pesan      : $this->pesanJadwal(
                    'Jadwal wawancara Anda telah diperbarui',
                    $lamaran->lowongan?->posisi,
                    $profil->nama_perusahaan,
                    $wawancara->tanggal_wawancara,
                    $wawancara->lokasi
                )
            );

            DB::commit();

            return response()->json([
                'status'  => 'success',
                'message' => 'Jadwal wawancara berhasil diperbarui',
                'data'    => $wawancara->refresh()->load('lamaran'),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status'  => 'error',
                'message' => 'Terjadi kesalahan saat memperbarui jadwal',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Batalkan wawancara → status = 'Dibatalkan'.
     * Kirim notifikasi pembatalan ke pelamar.
     *
     * DELETE /api/v1/admin/wawancara/{id_wawancara}
     */
    public function destroy($id_wawancara)
    {
        $admin  = auth('api')->user();
        $profil = $admin->profilPerusahaan;

        if (!$profil) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Profil perusahaan tidak ditemukan',
            ], 404);
        }

        $wawancara = Wawancara::with(['lamaran.profil.pengguna', 'lamaran.lowongan'])
            ->whereHas('lamaran.lowongan', fn ($q) =>
                $q->where('id_perusahaan', $profil->id_perusahaan)
            )
            ->where('id_wawancara', $id_wawancara)
            ->first();

        if (!$wawancara) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Jadwal wawancara tidak ditemukan',
            ], 404);
        }

        if ($wawancara->status === 'Dibatalkan') {
            return response()->json([
                'status'  => 'error',
                'message' => 'Jadwal wawancara sudah dibatalkan sebelumnya',
            ], 422);
        }

        try {
            DB::beginTransaction();

            $wawancara->status = 'Dibatalkan';
            $wawancara->save();

            // Kirim notifikasi pembatalan
            $lamaran = $wawancara->lamaran;
            $posisi   = $lamaran->lowongan?->posisi ?? 'posisi yang dilamar';
            $namaKafe = $profil->nama_perusahaan ?? 'kafe';

            $this->kirimNotifikasi(
                idPengguna : $lamaran->profil?->pengguna?->id_pengguna,
                judul      : 'Wawancara Dibatalkan ❌',
                pesan      : "Mohon maaf, jadwal wawancara Anda untuk posisi {$posisi} di {$namaKafe} telah dibatalkan. Kami akan menghubungi Anda kembali untuk informasi lebih lanjut."
            );

            DB::commit();

            return response()->json([
                'status'  => 'success',
                'message' => 'Jadwal wawancara berhasil dibatalkan',
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status'  => 'error',
                'message' => 'Terjadi kesalahan saat membatalkan jadwal',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Daftar semua jadwal wawancara milik kafe.
     * Query: tanggal, status, page, per_page
     *
     * GET /api/v1/admin/wawancara
     */
    public function index(Request $request)
    {
        $admin  = auth('api')->user();
        $profil = $admin->profilPerusahaan;

        if (!$profil) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Profil perusahaan tidak ditemukan',
            ], 404);
        }

        $query = Wawancara::with([
            'lamaran.profil',
            'lamaran.lowongan',
        ])
        ->whereHas('lamaran.lowongan', fn ($q) =>
            $q->where('id_perusahaan', $profil->id_perusahaan)
        );

        // Filter by tanggal (date)
        if ($request->filled('tanggal')) {
            $query->whereDate('tanggal_wawancara', $request->tanggal);
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $perPage    = (int) $request->get('per_page', 10);
        $wawancara  = $query->orderBy('tanggal_wawancara', 'asc')->paginate($perPage);

        $items = $wawancara->getCollection()->map(fn ($w) => [
            'id_wawancara'      => $w->id_wawancara,
            'tanggal_wawancara' => $w->tanggal_wawancara,
            'lokasi'            => $w->lokasi,
            'catatan'           => $w->catatan,
            'status'            => $w->status,
            'kandidat'          => [
                'id_lamaran'   => $w->lamaran?->id_lamaran,
                'nama_lengkap' => $w->lamaran?->profil?->nama_lengkap,
                'foto_profil'  => $w->lamaran?->profil?->foto_profil,
            ],
            'lowongan'          => [
                'id_lowongan'  => $w->lamaran?->lowongan?->id_lowongan,
                'posisi'       => $w->lamaran?->lowongan?->posisi,
            ],
        ]);

        return response()->json([
            'status' => 'success',
            'data'   => $items,
            'meta'   => [
                'current_page' => $wawancara->currentPage(),
                'last_page'    => $wawancara->lastPage(),
                'per_page'     => $wawancara->perPage(),
                'total'        => $wawancara->total(),
            ],
        ]);
    }

    /**
     * Tandai wawancara telah selesai → status = 'Selesai'.
     *
     * POST /api/v1/admin/wawancara/{id_wawancara}/selesai
     */
    public function selesai($id_wawancara)
    {
        $admin  = auth('api')->user();
        $profil = $admin->profilPerusahaan;

        if (!$profil) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Profil perusahaan tidak ditemukan',
            ], 404);
        }

        $wawancara = Wawancara::with(['lamaran.profil.pengguna', 'lamaran.lowongan'])
            ->whereHas('lamaran.lowongan', fn ($q) =>
                $q->where('id_perusahaan', $profil->id_perusahaan)
            )
            ->where('id_wawancara', $id_wawancara)
            ->first();

        if (!$wawancara) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Jadwal wawancara tidak ditemukan',
            ], 404);
        }

        if ($wawancara->status !== 'Terjadwal') {
            return response()->json([
                'status'  => 'error',
                'message' => "Hanya wawancara berstatus 'Terjadwal' yang bisa ditandai selesai. Status saat ini: '{$wawancara->status}'.",
            ], 422);
        }

        $wawancara->status = 'Selesai';
        $wawancara->save();

        return response()->json([
            'status'  => 'success',
            'message' => 'Wawancara berhasil ditandai selesai',
            'data'    => [
                'id_wawancara' => $wawancara->id_wawancara,
                'status'       => $wawancara->status,
            ],
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Helper: insert notifikasi ke tabel notifikasi.
     */
    private function kirimNotifikasi(?int $idPengguna, string $judul, string $pesan): void
    {
        if (!$idPengguna) return;

        $this->notifikasiService->kirim($idPengguna, $judul, $pesan);
    }

    /**
     * Helper: bangun isi pesan notifikasi berisi detail jadwal.
     */
    private function pesanJadwal(
        string  $intro,
        ?string $posisi,
        ?string $namaKafe,
        string  $tanggal,
        string  $lokasi
    ): string {
        $posisi   = $posisi   ?? 'posisi yang dilamar';
        $namaKafe = $namaKafe ?? 'kafe';

        return "{$intro} untuk posisi {$posisi} di {$namaKafe}. "
             . "Tanggal: {$tanggal}. "
             . "Lokasi/Link: {$lokasi}. "
             . "Harap hadir tepat waktu. Semangat! 💪";
    }
}
