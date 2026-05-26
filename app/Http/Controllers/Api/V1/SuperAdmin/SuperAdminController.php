<?php

namespace App\Http\Controllers\Api\V1\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Lamaran;
use App\Models\Lowongan;
use App\Models\ProfilPelamar;
use App\Models\ProfilPerusahaan;
use App\Repositories\V1\PenggunaRepository;
use App\Repositories\V1\SuperAdmin\PerusahaanRepository;
use App\Services\NotifikasiService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SuperAdminController extends Controller
{
    use ApiResponse;

    protected $perusahaanRepo;
    protected $penggunaRepo;
    protected $notifikasiService;

    public function __construct(
        PerusahaanRepository $perusahaanRepo,
        PenggunaRepository $penggunaRepo,
        NotifikasiService $notifikasiService
    ) {
        $this->perusahaanRepo = $perusahaanRepo;
        $this->penggunaRepo = $penggunaRepo;
        $this->notifikasiService = $notifikasiService;
    }

    /**
     * Daftar kafe dengan status_verifikasi = 'Pending'.
     */
    public function daftarVerifikasi(Request $request)
    {
        $perusahaan = $this->perusahaanRepo->getPending($request->all());

        $items = $perusahaan->getCollection()->map(fn ($p) => [
            'id_perusahaan'         => $p->id_perusahaan,
            'nama_perusahaan'       => $p->nama_perusahaan,
            'email_admin'           => $p->pengguna?->email,
            'alamat'                => $p->alamat_perusahaan,
            'dibuat_pada'           => $p->created_at?->toDateTimeString(),
            'dokumen_legalitas_url' => $p->dokumen_legalitas ? asset('storage/' . $p->dokumen_legalitas) : null,
        ]);

        return $this->successResponse($items, null, 200, [
            'current_page' => $perusahaan->currentPage(),
            'last_page'    => $perusahaan->lastPage(),
            'total'        => $perusahaan->total(),
        ]);
    }

    // Overriding successResponse to handle meta for pagination if needed, 
    // but standardizing is better. I'll just return items and meta manually for now or use a Resource.

    public function detailVerifikasi($id)
    {
        $p = $this->perusahaanRepo->findById($id, ['pengguna']);
        if (!$p) return $this->errorResponse('Profil perusahaan tidak ditemukan', 404);

        return $this->successResponse(array_merge($p->toArray(), [
            'dokumen_legalitas_url' => $p->dokumen_legalitas ? asset('storage/' . $p->dokumen_legalitas) : null,
            'dokumen_izin_url'      => $p->dokumen_izin ? asset('storage/' . $p->dokumen_izin) : null,
            'logo_url'              => $p->logo_perusahaan ? asset('storage/' . $p->logo_perusahaan) : null,
        ]));
    }

    public function setujuiVerifikasi($id)
    {
        $p = $this->perusahaanRepo->findById($id, ['pengguna']);
        if (!$p) return $this->errorResponse('Profil perusahaan tidak ditemukan', 404);

        $this->perusahaanRepo->updateStatus($p, 'Diterima');

        if ($p->pengguna) {
            $p->pengguna->status_akun = 'Aktif';
            $p->pengguna->save();
        }

        event(new \App\Events\CompanyVerificationStatusChanged($p, 'Diterima'));

        return $this->successResponse(null, 'Akun kafe berhasil diverifikasi');
    }

    public function tolakVerifikasi(Request $request, $id)
    {
        $validator = Validator::make($request->all(), ['alasan' => 'required|string|min:10']);
        if ($validator->fails()) return $this->errorResponse('Validasi gagal', 422, $validator->errors());

        $p = $this->perusahaanRepo->findById($id, ['pengguna']);
        if (!$p) return $this->errorResponse('Profil perusahaan tidak ditemukan', 404);

        $this->perusahaanRepo->updateStatus($p, 'Ditolak', $request->alasan);

        event(new \App\Events\CompanyVerificationStatusChanged($p, 'Ditolak', $request->alasan));

        return $this->successResponse(null, 'Pendaftaran kafe telah ditolak');
    }

    public function daftarAdmin(Request $request)
    {
        $admins = $this->penggunaRepo->getByRole('Admin_Perusahaan', $request->all());

        $items = $admins->getCollection()->map(fn ($a) => [
            'id'                => $a->id_pengguna,
            'nama_pengelola'    => $a->nama_pengguna,
            'email'             => $a->email,
            'nama_kafe'         => $a->profilPerusahaan?->nama_perusahaan,
            'status_verifikasi' => $a->profilPerusahaan?->status_verifikasi,
            'status_akun'       => $a->status_akun,
            'dibuat_pada'       => $a->created_at?->toDateTimeString(),
        ]);

        return $this->successResponse($items);
    }

    public function detailAdmin($id)
    {
        $admin = $this->penggunaRepo->findById($id, ['profilPerusahaan']);
        if (!$admin || $admin->peran !== 'Admin_Perusahaan') return $this->errorResponse('Admin tidak ditemukan', 404);

        return $this->successResponse($admin);
    }

    public function nonaktifkanAdmin(Request $request, $id)
    {
        $validator = Validator::make($request->all(), ['alasan' => 'required|string']);
        if ($validator->fails()) return $this->errorResponse('Validasi gagal', 422, $validator->errors());

        $admin = $this->penggunaRepo->findById($id);
        if (!$admin || $admin->peran !== 'Admin_Perusahaan') return $this->errorResponse('Admin tidak ditemukan', 404);

        $this->penggunaRepo->updateStatus($admin, 'Diblokir');

        event(new \App\Events\CompanyAccountStatusChanged($admin, 'Diblokir'));

        return $this->successResponse(null, 'Akun admin berhasil dinonaktifkan');
    }

    public function aktifkanAdmin($id)
    {
        $admin = $this->penggunaRepo->findById($id);
        if (!$admin || $admin->peran !== 'Admin_Perusahaan') return $this->errorResponse('Admin tidak ditemukan', 404);

        $this->penggunaRepo->updateStatus($admin, 'Aktif');

        event(new \App\Events\CompanyAccountStatusChanged($admin, 'Aktif'));

        return $this->successResponse(null, 'Akun admin berhasil diaktifkan kembali');
    }

    public function dashboard()
    {
        $totalKafeTerdaftar = ProfilPerusahaan::count();
        $totalPelamar = ProfilPelamar::count();
        $kafeAktif = ProfilPerusahaan::where('status_verifikasi', 'Diterima')->count();
        $kafePending = ProfilPerusahaan::where('status_verifikasi', 'Pending')->count();

        // Tren pertumbuhan 30 hari terakhir — hitung pendaftar per hari
        $awalRentang = now()->subDays(29)->startOfDay();
        $trenPerusahaan = ProfilPerusahaan::where('created_at', '>=', $awalRentang)
            ->selectRaw('DATE(created_at) as tanggal, COUNT(*) as jumlah')
            ->groupBy('tanggal')
            ->orderBy('tanggal')
            ->get()
            ->keyBy('tanggal');

        $trenPelamar = ProfilPelamar::where('created_at', '>=', $awalRentang)
            ->selectRaw('DATE(created_at) as tanggal, COUNT(*) as jumlah')
            ->groupBy('tanggal')
            ->orderBy('tanggal')
            ->get()
            ->keyBy('tanggal');

        $dataTren = [];
        for ($i = 0; $i < 30; $i++) {
            $tgl = now()->subDays(29 - $i)->format('Y-m-d');
            $dataTren[] = [
                'tanggal'    => $tgl,
                'perusahaan' => $trenPerusahaan->has($tgl) ? (int) $trenPerusahaan[$tgl]->jumlah : 0,
                'pelamar'    => $trenPelamar->has($tgl) ? (int) $trenPelamar[$tgl]->jumlah : 0,
            ];
        }

        // 15 pendaftar terbaru (gabungan pelamar + perusahaan)
        $pelamarTerbaru = \App\Models\Pengguna::where('peran', 'Pelamar')
            ->orderByDesc('created_at')
            ->limit(15)
            ->get()
            ->map(fn ($p) => [
                'nama'          => $p->nama_pengguna,
                'role'          => 'Pelamar',
                'tanggal_daftar'=> $p->created_at?->toDateTimeString(),
                'status'        => $p->status_akun,
            ]);

        $perusahaanTerbaru = \App\Models\Pengguna::where('peran', 'Admin_Perusahaan')
            ->with('profilPerusahaan')
            ->orderByDesc('created_at')
            ->limit(15)
            ->get()
            ->map(fn ($p) => [
                'nama'          => $p->profilPerusahaan?->nama_perusahaan ?? $p->nama_pengguna,
                'role'          => 'Perusahaan',
                'tanggal_daftar'=> $p->created_at?->toDateTimeString(),
                'status'        => $p->profilPerusahaan?->status_verifikasi ?? $p->status_akun,
            ]);

        $pendaftarTerbaru = $pelamarTerbaru->merge($perusahaanTerbaru)
            ->sortByDesc('tanggal_daftar')
            ->take(15)
            ->values();

        // 4 kafe pending paling lama (FIFO — urut created_at ASC)
        $antrianVerifikasi = ProfilPerusahaan::where('status_verifikasi', 'Pending')
            ->orderBy('created_at', 'asc')
            ->limit(4)
            ->get()
            ->map(fn ($k) => [
                'id'     => $k->id_perusahaan,
                'nama'   => $k->nama_perusahaan,
                'lokasi' => $k->kecamatan ?? $k->alamat_perusahaan ?? '-',
            ]);

        return $this->successResponse([
            'statistik' => [
                'total_kafe_terdaftar' => $totalKafeTerdaftar,
                'total_pelamar'        => $totalPelamar,
                'kafe_aktif'           => $kafeAktif,
                'kafe_pending'         => $kafePending,
            ],
            'tren_pertumbuhan'    => $dataTren,
            'pendaftar_terbaru'   => $pendaftarTerbaru,
            'antrian_verifikasi'  => $antrianVerifikasi,
        ]);
    }
}
