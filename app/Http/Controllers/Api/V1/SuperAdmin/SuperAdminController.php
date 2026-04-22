<?php

namespace App\Http\Controllers\Api\V1\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Lamaran;
use App\Models\Lowongan;
use App\Models\Notifikasi;
use App\Models\Pengguna;
use App\Models\ProfilPelamar;
use App\Models\ProfilPerusahaan;
use App\Services\NotifikasiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class SuperAdminController extends Controller
{
    protected $notifikasiService;

    public function __construct(NotifikasiService $notifikasiService)
    {
        $this->notifikasiService = $notifikasiService;
    }

    /**
     * Daftar kafe dengan status_verifikasi = 'Pending'.
     */
    public function daftarVerifikasi(Request $request)
    {
        $query = ProfilPerusahaan::with('pengguna')
            ->where('status_verifikasi', 'Pending');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('nama_perusahaan', 'LIKE', "%{$search}%");
        }

        $perPage = (int) $request->get('per_page', 10);
        $perusahaan = $query->orderBy('created_at', 'desc')->paginate($perPage);

        $items = $perusahaan->getCollection()->map(fn ($p) => [
            'id_perusahaan'          => $p->id_perusahaan,
            'nama_perusahaan'        => $p->nama_perusahaan,
            'email_admin'            => $p->pengguna?->email,
            'alamat'                 => $p->alamat_perusahaan,
            'dibuat_pada'            => $p->created_at?->toDateTimeString(),
            'dokumen_legalitas_url' => $p->dokumen_legalitas ? asset('storage/' . $p->dokumen_legalitas) : null,
        ]);

        return response()->json([
            'status' => 'success',
            'data'   => $items,
            'meta'   => [
                'current_page' => $perusahaan->currentPage(),
                'last_page'    => $perusahaan->lastPage(),
                'per_page'     => $perusahaan->perPage(),
                'total'        => $perusahaan->total(),
            ],
        ]);
    }

    /**
     * Detail profil kafe untuk ditinjau.
     */
    public function detailVerifikasi($id)
    {
        $p = ProfilPerusahaan::with('pengguna')->find($id);

        if (!$p) {
            return response()->json(['status' => 'error', 'message' => 'Profil perusahaan tidak ditemukan'], 404);
        }

        return response()->json([
            'status' => 'success',
            'data'   => array_merge($p->toArray(), [
                'dokumen_legalitas_url' => $p->dokumen_legalitas ? asset('storage/' . $p->dokumen_legalitas) : null,
                'dokumen_izin_url'      => $p->dokumen_izin ? asset('storage/' . $p->dokumen_izin) : null,
                'logo_url'              => $p->logo_perusahaan ? asset('storage/' . $p->logo_perusahaan) : null,
            ]),
        ]);
    }

    /**
     * Setujui pendaftaran kafe.
     */
    public function setujuiVerifikasi($id)
    {
        $p = ProfilPerusahaan::find($id);

        if (!$p) {
            return response()->json(['status' => 'error', 'message' => 'Profil perusahaan tidak ditemukan'], 404);
        }

        $p->status_verifikasi = 'Diterima';
        $p->save();

        // Notifikasi ke Admin Kafe
        $this->notifikasiService->kirim(
            $p->id_pengguna,
            'Akun Terverifikasi ✅',
            'Selamat! Akun kafe Anda telah diverifikasi dan kini Anda dapat memposting lowongan.'
        );

        return response()->json([
            'status'  => 'success',
            'message' => 'Akun kafe berhasil diverifikasi',
        ]);
    }

    /**
     * Tolak pendaftaran kafe.
     */
    public function tolakVerifikasi(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'alasan' => 'required|string|min:10',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'errors' => $validator->errors()], 422);
        }

        $p = ProfilPerusahaan::find($id);

        if (!$p) {
            return response()->json(['status' => 'error', 'message' => 'Profil perusahaan tidak ditemukan'], 404);
        }

        $p->status_verifikasi = 'Ditolak';
        $p->alasan_penolakan  = $request->alasan;
        $p->save();

        // Notifikasi ke Admin Kafe
        $this->notifikasiService->kirim(
            $p->id_pengguna,
            'Pendaftaran Ditolak ❌',
            "Mohon maaf, pendaftaran kafe Anda ditolak dengan alasan: {$request->alasan}. Silakan perbaiki profil Anda dan ajukan kembali."
        );

        return response()->json([
            'status'  => 'success',
            'message' => 'Pendaftaran kafe telah ditolak',
        ]);
    }

    /**
     * Daftar semua akun Admin Kafe.
     */
    public function daftarAdmin(Request $request)
    {
        $query = Pengguna::with('profilPerusahaan')
            ->where('peran', 'Admin_Perusahaan');

        if ($request->filled('status')) {
            $query->where('status_akun', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nama_pengguna', 'LIKE', "%{$search}%")
                  ->orWhere('email', 'LIKE', "%{$search}%");
            });
        }

        $perPage = (int) $request->get('per_page', 10);
        $admins = $query->orderBy('created_at', 'desc')->paginate($perPage);

        $items = $admins->getCollection()->map(fn ($a) => [
            'id'                => $a->id_pengguna,
            'nama_pengelola'    => $a->nama_pengguna,
            'email'             => $a->email,
            'nama_kafe'         => $a->profilPerusahaan?->nama_perusahaan,
            'status_verifikasi' => $a->profilPerusahaan?->status_verifikasi,
            'status_akun'       => $a->status_akun,
            'dibuat_pada'       => $a->created_at?->toDateTimeString(),
        ]);

        return response()->json([
            'status' => 'success',
            'data'   => $items,
            'meta'   => [
                'current_page' => $admins->currentPage(),
                'last_page'    => $admins->lastPage(),
                'per_page'     => $admins->perPage(),
                'total'        => $admins->total(),
            ],
        ]);
    }

    /**
     * Detail akun Admin Kafe tertentu.
     */
    public function detailAdmin($id)
    {
        $admin = Pengguna::with('profilPerusahaan')->find($id);

        if (!$admin || $admin->peran !== 'Admin_Perusahaan') {
            return response()->json(['status' => 'error', 'message' => 'Admin tidak ditemukan'], 404);
        }

        return response()->json([
            'status' => 'success',
            'data'   => $admin,
        ]);
    }

    /**
     * Suspend akun Admin Kafe.
     */
    public function nonaktifkanAdmin(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'alasan' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'errors' => $validator->errors()], 422);
        }

        $admin = Pengguna::find($id);

        if (!$admin || $admin->peran !== 'Admin_Perusahaan') {
            return response()->json(['status' => 'error', 'message' => 'Admin tidak ditemukan'], 404);
        }

        $admin->status_akun = 'Diblokir';
        $admin->save();

        // Blacklist token (opsional, jika menggunakan JWT)
        // JWTAuth::invalidate(JWTAuth::fromUser($admin)); 
        // Catatan: Ini hanya meng-invalidate token saat ini. 
        // Untuk benar-benar memblokir, kita harus cek status_akun di LoginController dan Middleware.

        return response()->json([
            'status'  => 'success',
            'message' => 'Akun admin berhasil dinonaktifkan',
        ]);
    }

    /**
     * Aktifkan kembali akun yang di-suspend.
     */
    public function aktifkanAdmin($id)
    {
        $admin = Pengguna::find($id);

        if (!$admin || $admin->peran !== 'Admin_Perusahaan') {
            return response()->json(['status' => 'error', 'message' => 'Admin tidak ditemukan'], 404);
        }

        $admin->status_akun = 'Aktif';
        $admin->save();

        return response()->json([
            'status'  => 'success',
            'message' => 'Akun admin berhasil diaktifkan kembali',
        ]);
    }

    /**
     * Statistik ringkasan ekosistem.
     */
    public function dashboard()
    {
        $stats = [
            'total_kafe_aktif'              => ProfilPerusahaan::where('status_verifikasi', 'Diterima')->count(),
            'total_kafe_pending_verifikasi' => ProfilPerusahaan::where('status_verifikasi', 'Pending')->count(),
            'total_pelamar'                 => ProfilPelamar::count(),
            'total_lowongan_aktif'          => Lowongan::where('status', 'Aktif')->count(),
            'total_lamaran_bulan_ini'       => Lamaran::whereMonth('created_at', now()->month)
                                                ->whereYear('created_at', now()->year)
                                                ->count(),
        ];

        return response()->json([
            'status' => 'success',
            'data'   => $stats,
        ]);
    }
}
