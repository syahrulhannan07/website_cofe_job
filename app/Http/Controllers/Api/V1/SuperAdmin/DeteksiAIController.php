<?php

namespace App\Http\Controllers\Api\V1\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\DeteksiLog;
use App\Models\Pengguna;
use App\Models\PengaturanAi;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class DeteksiAIController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = DeteksiLog::with([
            'pengguna:id_pengguna,nama_pengguna,email,status_akun',
            'pengguna.profilPerusahaan:id_pengguna,nama_perusahaan',
            'lowongan:id_lowongan,posisi,status',
        ]);

        if ($request->filled('tindakan')) {
            $query->where('tindakan', $request->tindakan);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('pengguna', function ($q) use ($search) {
                $q->where('nama_pengguna', 'LIKE', "%{$search}%")
                  ->orWhere('email', 'LIKE', "%{$search}%");
            })->orWhereHas('pengguna.profilPerusahaan', function ($q) use ($search) {
                $q->where('nama_perusahaan', 'LIKE', "%{$search}%");
            });
        }

        if ($request->filled('sort')) {
            $dir = $request->filled('order') && $request->order === 'asc' ? 'asc' : 'desc';
            $query->orderBy($request->sort, $dir);
        } else {
            $query->orderBy('dibuat_pada', 'desc');
        }

        $perPage = $request->input('per_page', 20);
        $logs = $query->paginate($perPage);

        $logs->getCollection()->transform(function ($log) {
            return [
                'id_deteksi'     => $log->id_deteksi,
                'skor_total'     => $log->skor_total,
                'tindakan'       => $log->tindakan,
                'detail_signal'  => $log->detail_signal,
                'catatan'        => $log->catatan,
                'dieksekusi_oleh' => $log->dieksekusi_oleh,
                'dibuat_pada'    => $log->dibuat_pada?->toIso8601String(),
                'perusahaan'     => $log->pengguna ? [
                    'id'              => $log->pengguna->id_pengguna,
                    'nama_pengguna'   => $log->pengguna->nama_pengguna,
                    'email'           => $log->pengguna->email,
                    'status_akun'     => $log->pengguna->status_akun,
                    'nama_perusahaan' => $log->pengguna->profilPerusahaan?->nama_perusahaan,
                ] : null,
                'lowongan' => $log->lowongan ? [
                    'id'     => $log->lowongan->id_lowongan,
                    'posisi' => $log->lowongan->posisi,
                    'status' => $log->lowongan->status,
                ] : null,
            ];
        });

        return $this->successResponse($logs);
    }

    public function show($id)
    {
        $log = DeteksiLog::with([
            'pengguna:id_pengguna,nama_pengguna,email,status_akun',
            'pengguna.profilPerusahaan',
            'lowongan',
        ])->find($id);

        if (!$log) {
            return $this->errorResponse('Log deteksi tidak ditemukan', 404);
        }

        return $this->successResponse([
            'id_deteksi'     => $log->id_deteksi,
            'skor_total'     => $log->skor_total,
            'tindakan'       => $log->tindakan,
            'detail_signal'  => $log->detail_signal,
            'catatan'        => $log->catatan,
            'dieksekusi_oleh' => $log->dieksekusi_oleh,
            'dibuat_pada'    => $log->dibuat_pada?->toIso8601String(),
            'perusahaan'     => $log->pengguna ? [
                'id'              => $log->pengguna->id_pengguna,
                'nama_pengguna'   => $log->pengguna->nama_pengguna,
                'email'           => $log->pengguna->email,
                'status_akun'     => $log->pengguna->status_akun,
                'nama_perusahaan' => $log->pengguna->profilPerusahaan?->nama_perusahaan ?? '-',
                'deskripsi'       => $log->pengguna->profilPerusahaan?->deskripsi ?? '',
                'alamat'          => $log->pengguna->profilPerusahaan?->alamat_perusahaan ?? '',
            ] : null,
            'lowongan' => $log->lowongan ? [
                'id'           => $log->lowongan->id_lowongan,
                'posisi'       => $log->lowongan->posisi,
                'deskripsi'    => $log->lowongan->deskripsi,
                'persyaratan'  => $log->lowongan->persyaratan,
                'lokasi'       => $log->lowongan->lokasi,
                'gaji'         => $log->lowongan->gaji,
                'status'       => $log->lowongan->status,
                'batas_awal'   => $log->lowongan->batas_awal,
                'batas_akhir'  => $log->lowongan->batas_akhir,
            ] : null,
        ]);
    }

    public function statistik()
    {
        $total = DeteksiLog::count();
        $flagged = DeteksiLog::where('tindakan', 'flagged')->count();
        $warning = DeteksiLog::where('tindakan', 'warning')->count();
        $suspended = DeteksiLog::where('tindakan', 'suspended')->count();
        $aman = DeteksiLog::where('tindakan', 'aman')->count();

        $trenHarian = DeteksiLog::selectRaw('DATE(dibuat_pada) as tanggal, COUNT(*) as jumlah')
            ->where('dibuat_pada', '>=', now()->subDays(7))
            ->groupBy('tanggal')
            ->orderBy('tanggal')
            ->get();

        return $this->successResponse([
            'total'      => $total,
            'flagged'    => $flagged,
            'warning'    => $warning,
            'suspended'  => $suspended,
            'aman'       => $aman,
            'tren_harian' => $trenHarian,
        ]);
    }

    public function pengaturan()
    {
        $settings = PengaturanAi::all()->pluck('nilai', 'kunci');

        return $this->successResponse($settings);
    }

    public function updatePengaturan(Request $request)
    {
        $validated = $request->validate([
            'kunci' => 'required|string|exists:pengaturan_ai,kunci',
            'nilai' => 'required|string',
        ]);

        PengaturanAi::where('kunci', $validated['kunci'])
            ->update(['nilai' => $validated['nilai']]);

        return $this->successResponse(null, 'Pengaturan berhasil diperbarui');
    }

    public function override(Request $request, $id)
    {
        $log = DeteksiLog::find($id);
        if (!$log) {
            return $this->errorResponse('Log deteksi tidak ditemukan', 404);
        }

        $validated = $request->validate([
            'tindakan'     => 'required|in:aktifkan_kembali,abaikan',
            'alasan'       => 'nullable|string|max:500',
        ]);

        $pengguna = Pengguna::find($log->id_pengguna);
        if (!$pengguna) {
            return $this->errorResponse('Pengguna tidak ditemukan', 404);
        }

        $alasan = $validated['alasan'] ?? '';

        if ($validated['tindakan'] === 'aktifkan_kembali') {
            $pengguna->update(['status_akun' => 'Aktif']);

            $log->update([
                'catatan' => trim(($log->catatan ?? '') . " | SA override: diaktifkan kembali. {$alasan}"),
                'dieksekusi_oleh' => (string) auth('api')->id(),
            ]);

            event(new \App\Events\CompanyAccountStatusChanged($pengguna, 'Aktif'));

            return $this->successResponse(null, 'Akun berhasil diaktifkan kembali');
        }

        if ($validated['tindakan'] === 'abaikan') {
            $log->update([
                'catatan' => trim(($log->catatan ?? '') . " | SA abaikan. {$alasan}"),
                'dieksekusi_oleh' => (string) auth('api')->id(),
            ]);

            return $this->successResponse(null, 'Deteksi diabaikan');
        }

        return $this->errorResponse('Tindakan tidak valid', 422);
    }
}
