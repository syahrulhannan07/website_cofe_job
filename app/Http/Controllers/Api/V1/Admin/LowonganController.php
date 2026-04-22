<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Lowongan;
use App\Models\LowonganDokumen;
use App\Models\PertanyaanLowongan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class LowonganController extends Controller
{
    /**
     * Display a listing of vacancies for the logged-in admin's cafe.
     *
     * GET /api/v1/admin/lowongan
     * Query: status (Draft|Aktif|Ditutup), search, page, per_page
     * Response shape per item: { id, posisi, status, jumlah_pelamar, batas_awal, batas_akhir }
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

        $query = Lowongan::where('id_perusahaan', $profil->id_perusahaan)
            ->withCount('lamaran');

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Full-text search on posisi / deskripsi
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('posisi',    'LIKE', "%{$search}%")
                  ->orWhere('deskripsi', 'LIKE', "%{$search}%");
            });
        }

        $perPage  = (int) $request->get('per_page', 10);
        $lowongan = $query->orderBy('created_at', 'desc')->paginate($perPage);

        // Map to the exact response shape specified
        $items = $lowongan->getCollection()->map(fn ($l) => [
            'id'             => $l->id_lowongan,
            'posisi'         => $l->posisi,
            'status'         => $l->status,
            'jumlah_pelamar' => $l->lamaran_count,
            'batas_awal'     => $l->batas_awal,
            'batas_akhir'    => $l->batas_akhir,
        ]);

        return response()->json([
            'status' => 'success',
            'data'   => $items,
            'meta'   => [
                'current_page' => $lowongan->currentPage(),
                'last_page'    => $lowongan->lastPage(),
                'per_page'     => $lowongan->perPage(),
                'total'        => $lowongan->total(),
            ],
        ]);
    }

    /**
     * Store a newly created vacancy.
     *
     * POST /api/v1/admin/lowongan
     */
    public function store(Request $request)
    {
        $admin  = auth('api')->user();
        $profil = $admin->profilPerusahaan;

        if (!$profil) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Lengkapi profil kafe Anda terlebih dahulu sebelum dapat membuat lowongan',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'posisi'                               => 'required|string|max:255',
            'deskripsi'                            => 'required|string',
            'persyaratan'                          => 'required|string',
            'batas_awal'                           => 'required|date|date_format:Y-m-d',
            'batas_akhir'                          => 'required|date|date_format:Y-m-d|after:batas_awal',
            'status'                               => 'nullable|in:Draft,Aktif',
            'dokumen_dibutuhkan'                   => 'nullable|array',
            'dokumen_dibutuhkan.*.id_jenis_dokumen'=> 'required|exists:jenis_dokumen,id_jenis_dokumen',
            'dokumen_dibutuhkan.*.wajib'           => 'required|boolean',
            'pertanyaan'                           => 'nullable|array',
            'pertanyaan.*.pertanyaan'              => 'required|string',
            'pertanyaan.*.tipe_jawaban'            => 'required|string|in:text,boolean,number,pilihan_ganda',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Validasi gagal',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $status = $request->get('status', 'Draft');

        // If publishing directly, enforce profile completeness
        if ($status === 'Aktif') {
            if (!$this->isProfileComplete($profil)) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Lengkapi profil kafe Anda terlebih dahulu sebelum dapat memposting lowongan',
                ], 422);
            }
        }

        try {
            DB::beginTransaction();

            $lowongan = Lowongan::create([
                'id_perusahaan' => $profil->id_perusahaan,
                'posisi'        => $request->posisi,
                'deskripsi'     => $request->deskripsi,
                'persyaratan'   => $request->persyaratan,
                'batas_awal'    => $request->batas_awal,
                'batas_akhir'   => $request->batas_akhir,
                'status'        => $status,
            ]);

            // Attach required documents
            if ($request->filled('dokumen_dibutuhkan')) {
                foreach ($request->dokumen_dibutuhkan as $doc) {
                    LowonganDokumen::create([
                        'id_lowongan'      => $lowongan->id_lowongan,
                        'id_jenis_dokumen' => $doc['id_jenis_dokumen'],
                        'wajib'            => $doc['wajib'],
                    ]);
                }
            }

            // Attach screening questions
            if ($request->filled('pertanyaan')) {
                foreach ($request->pertanyaan as $q) {
                    PertanyaanLowongan::create([
                        'id_lowongan'  => $lowongan->id_lowongan,
                        'pertanyaan'   => $q['pertanyaan'],
                        'tipe_jawaban' => $q['tipe_jawaban'],
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'status'  => 'success',
                'message' => 'Lowongan berhasil dibuat',
                'data'    => $lowongan->load(['dokumenDibutuhkan.jenisDokumen', 'pertanyaanSeleksi']),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status'  => 'error',
                'message' => 'Terjadi kesalahan saat menyimpan lowongan',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified vacancy — includes docs, questions, and applicant stats.
     *
     * GET /api/v1/admin/lowongan/{id}
     */
    public function show($id)
    {
        $admin  = auth('api')->user();
        $profil = $admin->profilPerusahaan;

        if (!$profil) {
            return response()->json(['status' => 'error', 'message' => 'Profil perusahaan tidak ditemukan'], 404);
        }

        $lowongan = Lowongan::with(['dokumenDibutuhkan.jenisDokumen', 'pertanyaanSeleksi'])
            ->where('id_perusahaan', $profil->id_perusahaan)
            ->where('id_lowongan', $id)
            ->first();

        if (!$lowongan) {
            return response()->json(['status' => 'error', 'message' => 'Lowongan tidak ditemukan'], 404);
        }

        // Applicant statistics broken down by status
        $statistik = $lowongan->lamaran()
            ->selectRaw('status, COUNT(*) as jumlah')
            ->groupBy('status')
            ->pluck('jumlah', 'status');

        $totalPelamar = $statistik->sum();

        return response()->json([
            'status' => 'success',
            'data'   => array_merge($lowongan->toArray(), [
                'statistik_pelamar' => [
                    'total'    => $totalPelamar,
                    'per_status' => $statistik,
                ],
            ]),
        ]);
    }

    /**
     * Update the specified vacancy.
     * Syncs dokumen_dibutuhkan and pertanyaan if provided.
     *
     * PUT /api/v1/admin/lowongan/{id}
     */
    public function update(Request $request, $id)
    {
        $admin  = auth('api')->user();
        $profil = $admin->profilPerusahaan;

        if (!$profil) {
            return response()->json(['status' => 'error', 'message' => 'Profil perusahaan tidak ditemukan'], 404);
        }

        $lowongan = Lowongan::where('id_perusahaan', $profil->id_perusahaan)
            ->where('id_lowongan', $id)
            ->first();

        if (!$lowongan) {
            return response()->json(['status' => 'error', 'message' => 'Lowongan tidak ditemukan'], 404);
        }

        $validator = Validator::make($request->all(), [
            'posisi'                               => 'nullable|string|max:255',
            'deskripsi'                            => 'nullable|string',
            'persyaratan'                          => 'nullable|string',
            'batas_awal'                           => 'nullable|date|date_format:Y-m-d',
            'batas_akhir'                          => 'nullable|date|date_format:Y-m-d|after:batas_awal',
            'status'                               => 'nullable|in:Draft,Aktif,Ditutup',
            'dokumen_dibutuhkan'                   => 'nullable|array',
            'dokumen_dibutuhkan.*.id_jenis_dokumen'=> 'required|exists:jenis_dokumen,id_jenis_dokumen',
            'dokumen_dibutuhkan.*.wajib'           => 'required|boolean',
            'pertanyaan'                           => 'nullable|array',
            'pertanyaan.*.pertanyaan'              => 'required|string',
            'pertanyaan.*.tipe_jawaban'            => 'required|string|in:text,boolean,number,pilihan_ganda',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Validasi gagal',
                'errors'  => $validator->errors(),
            ], 422);
        }

        // Enforce profile completeness when activating
        $newStatus = $request->status;
        if ($newStatus === 'Aktif' && $lowongan->status !== 'Aktif') {
            if (!$this->isProfileComplete($profil)) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Lengkapi profil kafe Anda terlebih dahulu sebelum dapat memposting lowongan',
                ], 422);
            }
        }

        try {
            DB::beginTransaction();

            $lowongan->update($request->only([
                'posisi', 'deskripsi', 'persyaratan', 'batas_awal', 'batas_akhir', 'status',
            ]));

            // Sync documents if provided (replace-all strategy)
            if ($request->has('dokumen_dibutuhkan')) {
                $lowongan->dokumenDibutuhkan()->delete();
                foreach ($request->dokumen_dibutuhkan as $doc) {
                    LowonganDokumen::create([
                        'id_lowongan'      => $lowongan->id_lowongan,
                        'id_jenis_dokumen' => $doc['id_jenis_dokumen'],
                        'wajib'            => $doc['wajib'],
                    ]);
                }
            }

            // Sync screening questions if provided (replace-all strategy)
            if ($request->has('pertanyaan')) {
                $lowongan->pertanyaanSeleksi()->delete();
                foreach ($request->pertanyaan as $q) {
                    PertanyaanLowongan::create([
                        'id_lowongan'  => $lowongan->id_lowongan,
                        'pertanyaan'   => $q['pertanyaan'],
                        'tipe_jawaban' => $q['tipe_jawaban'],
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'status'  => 'success',
                'message' => 'Lowongan berhasil diperbarui',
                'data'    => $lowongan->load(['dokumenDibutuhkan.jenisDokumen', 'pertanyaanSeleksi']),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status'  => 'error',
                'message' => 'Terjadi kesalahan saat memperbarui lowongan',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Soft-delete the specified vacancy.
     * Blocked if any applications have been submitted.
     *
     * DELETE /api/v1/admin/lowongan/{id}
     */
    public function destroy($id)
    {
        $admin  = auth('api')->user();
        $profil = $admin->profilPerusahaan;

        if (!$profil) {
            return response()->json(['status' => 'error', 'message' => 'Profil perusahaan tidak ditemukan'], 404);
        }

        $lowongan = Lowongan::where('id_perusahaan', $profil->id_perusahaan)
            ->where('id_lowongan', $id)
            ->withCount('lamaran')
            ->first();

        if (!$lowongan) {
            return response()->json(['status' => 'error', 'message' => 'Lowongan tidak ditemukan'], 404);
        }

        if ($lowongan->lamaran_count > 0) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Tidak bisa menghapus lowongan yang sudah memiliki pelamar',
            ], 422);
        }

        // SoftDeletes: sets deleted_at, does NOT physically remove the row
        $lowongan->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Lowongan berhasil dihapus',
        ]);
    }

    /**
     * Publish a vacancy — change status to Aktif.
     * Validates cafe profile completeness first.
     *
     * POST /api/v1/admin/lowongan/{id}/publish
     */
    public function publish($id)
    {
        $admin  = auth('api')->user();
        $profil = $admin->profilPerusahaan;

        if (!$profil) {
            return response()->json(['status' => 'error', 'message' => 'Profil perusahaan tidak ditemukan'], 404);
        }

        $lowongan = Lowongan::where('id_perusahaan', $profil->id_perusahaan)
            ->where('id_lowongan', $id)
            ->first();

        if (!$lowongan) {
            return response()->json(['status' => 'error', 'message' => 'Lowongan tidak ditemukan'], 404);
        }

        if ($lowongan->status === 'Aktif') {
            return response()->json([
                'status'  => 'error',
                'message' => 'Lowongan sudah dalam status Aktif',
            ], 422);
        }

        if (!$this->isProfileComplete($profil)) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Lengkapi profil kafe Anda terlebih dahulu sebelum dapat memposting lowongan',
            ], 422);
        }

        $lowongan->status = 'Aktif';
        $lowongan->save();

        return response()->json([
            'status'  => 'success',
            'message' => 'Lowongan berhasil dipublikasikan',
            'data'    => ['id' => $lowongan->id_lowongan, 'status' => $lowongan->status],
        ]);
    }

    /**
     * Close a vacancy — change status to Ditutup.
     *
     * POST /api/v1/admin/lowongan/{id}/tutup
     */
    public function tutup($id)
    {
        $admin  = auth('api')->user();
        $profil = $admin->profilPerusahaan;

        if (!$profil) {
            return response()->json(['status' => 'error', 'message' => 'Profil perusahaan tidak ditemukan'], 404);
        }

        $lowongan = Lowongan::where('id_perusahaan', $profil->id_perusahaan)
            ->where('id_lowongan', $id)
            ->first();

        if (!$lowongan) {
            return response()->json(['status' => 'error', 'message' => 'Lowongan tidak ditemukan'], 404);
        }

        if ($lowongan->status === 'Ditutup') {
            return response()->json([
                'status'  => 'error',
                'message' => 'Lowongan sudah dalam status Ditutup',
            ], 422);
        }

        $lowongan->status = 'Ditutup';
        $lowongan->save();

        return response()->json([
            'status'  => 'success',
            'message' => 'Lowongan berhasil ditutup',
            'data'    => ['id' => $lowongan->id_lowongan, 'status' => $lowongan->status],
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Check that cafe profile has the three mandatory fields:
     * nama_perusahaan, alamat_perusahaan, logo_perusahaan.
     */
    private function isProfileComplete($profil): bool
    {
        return !empty($profil->nama_perusahaan)
            && !empty($profil->alamat_perusahaan)
            && !empty($profil->logo_perusahaan);
    }
}
