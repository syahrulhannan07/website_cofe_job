<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Lamaran;
use App\Models\LogStatusLamaran;
use App\Models\Lowongan;
use App\Models\Notifikasi;
use App\Services\NotifikasiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class SeleksiLamaranController extends Controller
{
    protected $notifikasiService;

    public function __construct(NotifikasiService $notifikasiService)
    {
        $this->notifikasiService = $notifikasiService;
    }

    /**
     * Daftar semua kandidat yang melamar ke lowongan tertentu.
     *
     * GET /api/v1/admin/lowongan/{id_lowongan}/pelamar
     * Query: status (Diproses|Wawancara|Diterima|Ditolak), search, page, per_page
     */
    public function daftarPelamar(Request $request, $id_lowongan)
    {
        $admin  = auth('api')->user();
        $profil = $admin->profilPerusahaan;

        if (!$profil) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Profil perusahaan tidak ditemukan',
            ], 404);
        }

        // Validasi ownership: lowongan harus milik kafe admin yang login
        $lowongan = Lowongan::where('id_perusahaan', $profil->id_perusahaan)
            ->where('id_lowongan', $id_lowongan)
            ->first();

        if (!$lowongan) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Lowongan tidak ditemukan',
            ], 404);
        }

        $query = Lamaran::with('profil')
            ->where('id_lowongan', $id_lowongan);

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Search by nama pelamar
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('profil', function ($q) use ($search) {
                $q->where('nama_lengkap', 'LIKE', "%{$search}%");
            });
        }

        $perPage  = (int) $request->get('per_page', 10);
        $lamaran  = $query->orderBy('created_at', 'desc')->paginate($perPage);

        if ($lamaran->isEmpty()) {
            return response()->json([
                'status'  => 'success',
                'message' => 'Belum ada lamaran masuk untuk posisi ini',
                'data'    => [],
                'meta'    => [
                    'current_page' => 1,
                    'last_page'    => 1,
                    'per_page'     => $perPage,
                    'total'        => 0,
                ],
            ]);
        }

        // Map to the exact response shape
        $items = $lamaran->getCollection()->map(fn ($l) => [
            'id_lamaran'      => $l->id_lamaran,
            'id_profil'       => $l->id_profil,
            'nama_lengkap'    => $l->profil?->nama_lengkap,
            'foto_profil'     => $l->profil?->foto_profil,
            'tanggal_melamar' => $l->created_at?->toDateString(),
            'status'          => $l->status,
        ]);

        return response()->json([
            'status' => 'success',
            'data'   => $items,
            'meta'   => [
                'current_page' => $lamaran->currentPage(),
                'last_page'    => $lamaran->lastPage(),
                'per_page'     => $lamaran->perPage(),
                'total'        => $lamaran->total(),
            ],
        ]);
    }

    /**
     * Detail lengkap satu kandidat.
     *
     * GET /api/v1/admin/lamaran/{id_lamaran}
     */
    public function detailLamaran($id_lamaran)
    {
        $admin  = auth('api')->user();
        $profil = $admin->profilPerusahaan;

        if (!$profil) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Profil perusahaan tidak ditemukan',
            ], 404);
        }

        // Validasi ownership: lamaran harus untuk lowongan milik kafe yang login
        $lamaran = Lamaran::with([
            'profil.skills',
            'profil.pendidikan',
            'profil.pengalamanKerja',
            'lamaranDokumen.jenisDokumen',
            'jawabanPertanyaan.pertanyaan',
            'lowongan',
        ])
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

        $profilPelamar = $lamaran->profil;

        // Dokumen lamaran: { nama_jenis, url_file, diunggah_pada }
        $dokumen = $lamaran->lamaranDokumen->map(fn ($d) => [
            'nama_jenis'   => $d->jenisDokumen?->nama_dokumen,
            'url_file'     => $d->lokasi_file
                ? asset('storage/' . $d->lokasi_file)
                : null,
            'diunggah_pada' => $d->created_at?->toDateTimeString(),
        ]);

        // Jawaban pertanyaan: { pertanyaan, jawaban }
        $jawaban = $lamaran->jawabanPertanyaan->map(fn ($j) => [
            'pertanyaan' => $j->pertanyaan?->pertanyaan,
            'jawaban'    => $j->jawaban,
        ]);

        return response()->json([
            'status' => 'success',
            'data'   => [
                'info_lamaran' => [
                    'id'              => $lamaran->id_lamaran,
                    'status'          => $lamaran->status,
                    'tanggal_melamar' => $lamaran->created_at?->toDateTimeString(),
                ],
                'profil_pelamar' => [
                    'nama'          => $profilPelamar?->nama_lengkap,
                    'foto'          => $profilPelamar?->foto_profil
                        ? asset('storage/' . $profilPelamar->foto_profil)
                        : null,
                    'tentang_saya'  => $profilPelamar?->tentang_saya,
                    'telepon'       => $profilPelamar?->nomor_telepon,
                    'alamat'        => $profilPelamar?->alamat,
                    'jenis_kelamin' => $profilPelamar?->jenis_kelamin,
                ],
                'pendidikan'          => $profilPelamar?->pendidikan ?? [],
                'skill'               => $profilPelamar?->skills ?? [],
                'pengalaman_kerja'    => $profilPelamar?->pengalamanKerja ?? [],
                'dokumen_lamaran'     => $dokumen,
                'jawaban_pertanyaan'  => $jawaban,
            ],
        ]);
    }

    /**
     * Update status lamaran kandidat.
     * Logs the change and sends an in-app notification to the applicant.
     *
     * PUT /api/v1/admin/lamaran/{id_lamaran}/status
     * Body: { status: "Diproses|Wawancara|Diterima|Ditolak", catatan: "string (opsional)" }
     */
    public function updateStatus(Request $request, $id_lamaran)
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
            'status'  => 'required|in:Diproses,Wawancara,Diterima,Ditolak',
            'catatan' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Validasi gagal',
                'errors'  => $validator->errors(),
            ], 422);
        }

        // Validasi ownership
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

        $statusLama = $lamaran->status;
        $statusBaru = $request->status;

        if ($statusLama === $statusBaru) {
            return response()->json([
                'status'  => 'error',
                'message' => "Status lamaran sudah '{$statusBaru}'",
            ], 422);
        }

        try {
            DB::beginTransaction();

            // 1. Update status di tabel lamaran
            //    (Lamaran::booted() akan otomatis insert ke log_status_lamaran)
            $lamaran->status = $statusBaru;
            $lamaran->save();

            // 2. Jika ada catatan tambahan dari admin, insert log manual dengan catatan
            if ($request->filled('catatan')) {
                LogStatusLamaran::create([
                    'id_lamaran'  => $lamaran->id_lamaran,
                    'status_lama' => $statusLama,
                    'status_baru' => $statusBaru,
                    'keterangan'  => $request->catatan,
                    'dibuat_pada' => now(),
                ]);
            }

            // 3. Kirim notifikasi ke pelamar
            $posisi    = $lamaran->lowongan?->posisi ?? 'posisi yang dilamar';
            $namaKafe  = $profil->nama_perusahaan ?? 'kafe';
            $idPengguna = $lamaran->profil?->pengguna?->id_pengguna;

            if ($idPengguna) {
                [$judul, $pesan] = $this->buildNotifikasi($statusBaru, $posisi, $namaKafe);

                $this->notifikasiService->kirim($idPengguna, $judul, $pesan);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Status lamaran berhasil diperbarui',
                'data'    => [
                    'id_lamaran'  => $lamaran->id_lamaran,
                    'status_lama' => $statusLama,
                    'status_baru' => $statusBaru,
                ],
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status'  => 'error',
                'message' => 'Terjadi kesalahan saat memperbarui status',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Bangun konten notifikasi berdasarkan status baru.
     *
     * @return array{0: string, 1: string} [judul, pesan]
     */
    private function buildNotifikasi(string $status, string $posisi, string $namaKafe): array
    {
        return match ($status) {
            'Diterima' => [
                'Lamaran Diterima 🎉',
                "Selamat! Lamaran Anda untuk posisi {$posisi} di {$namaKafe} telah diterima.",
            ],
            'Ditolak' => [
                'Informasi Status Lamaran',
                "Mohon maaf, lamaran Anda untuk posisi {$posisi} di {$namaKafe} tidak melanjutkan proses seleksi.",
            ],
            'Wawancara' => [
                'Undangan Wawancara 🗓️',
                "Selamat! Anda lolos seleksi berkas untuk posisi {$posisi} di {$namaKafe}. Jadwal wawancara akan segera dikirimkan.",
            ],
            'Diproses' => [
                'Lamaran Sedang Diproses',
                "Lamaran Anda untuk posisi {$posisi} di {$namaKafe} sedang dalam tahap peninjauan.",
            ],
            default => [
                'Update Status Lamaran',
                "Status lamaran Anda untuk posisi {$posisi} di {$namaKafe} telah diperbarui menjadi {$status}.",
            ],
        };
    }
}
