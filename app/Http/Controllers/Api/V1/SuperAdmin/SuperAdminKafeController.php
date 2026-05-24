<?php

namespace App\Http\Controllers\Api\V1\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Pengguna;
use App\Models\Lowongan;
use Illuminate\Http\Request;

class SuperAdminKafeController extends Controller
{
    /**
     * Ambil daftar seluruh akun Admin Kafe, dukung pencarian nama kafe/pengguna.
     */
    public function index(Request $request)
    {
        $query = Pengguna::where('peran', 'Admin_Perusahaan')
            ->with('profilPerusahaan');

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nama_pengguna', 'LIKE', "%{$search}%")
                  ->orWhereHas('profilPerusahaan', fn ($qp) =>
                      $qp->where('nama_perusahaan', 'LIKE', "%{$search}%")
                  );
            });
        }

        $admins = $query->orderBy('created_at', 'desc')->get();

        $data = $admins->map(fn ($a) => [
            'id'              => $a->id_pengguna,
            'id_perusahaan'   => $a->profilPerusahaan?->id_perusahaan,
            'nama_pengguna'   => $a->nama_pengguna,
            'nama_perusahaan' => $a->profilPerusahaan?->nama_perusahaan ?? '-',
            'email'           => $a->email,
            'status'          => $a->status_akun,
            'dibuat_pada'     => $a->created_at?->toIso8601String(),
        ]);

        return response()->json(['status' => 'success', 'data' => $data], 200);
    }

    /**
     * Ambil detail satu akun kafe beserta profil dan daftar lowongannya.
     * Digunakan oleh ModalDetailAdmin untuk menampilkan info kafe + lowongan.
     */
    public function show($id)
    {
        $admin = Pengguna::where('peran', 'Admin_Perusahaan')
            ->with(['profilPerusahaan.lowongan' => function ($q) {
                // Sertakan jumlah pelamar per lowongan
                $q->withCount('lamaran')->orderBy('created_at', 'desc');
            }])
            ->find($id);

        if (!$admin) {
            return response()->json(['status' => 'error', 'message' => 'Admin tidak ditemukan'], 404);
        }

        $profil = $admin->profilPerusahaan;

        // Mapping daftar lowongan kafe
        $lowonganList = $profil?->lowongan?->map(fn ($l) => [
            'id'         => $l->id_lowongan,
            'posisi'     => $l->posisi,
            'lokasi'     => $l->lokasi ?? '-',
            'status'     => $l->status_label,
            'tanggal'    => $l->created_at?->format('d M Y'),
            'pelamar'    => $l->lamaran_count ?? 0,
        ]) ?? [];

        return response()->json([
            'status' => 'success',
            'data' => [
                'id'              => $admin->id_pengguna,
                'id_perusahaan'   => $profil?->id_perusahaan,
                'nama_perusahaan' => $profil?->nama_perusahaan ?? '-',
                'nama_pengguna'   => $admin->nama_pengguna,
                'email'           => $admin->email,
                'status'          => $admin->status_akun,
                'deskripsi'       => $profil?->deskripsi ?? '',
                'alamat'          => $profil?->alamat_perusahaan ?? '',
                'lowongan'        => $lowonganList,
            ],
        ], 200);
    }

    /**
     * Ambil detail satu lowongan beserta kualifikasi dan pertanyaan seleksi.
     * Digunakan oleh HalamanDetailLowonganSuperAdmin.
     */
    public function showLowongan($idLowongan)
    {
        $lowongan = Lowongan::with(['perusahaan', 'pertanyaanSeleksi', 'dokumenDibutuhkan.jenisDokumen'])
            ->withCount('lamaran')
            ->find($idLowongan);

        if (!$lowongan) {
            return response()->json(['status' => 'error', 'message' => 'Lowongan tidak ditemukan'], 404);
        }

        // Mapping dokumen yang dibutuhkan
        $dokumenList = $lowongan->dokumenDibutuhkan?->map(fn ($d) => [
            'id'         => $d->id_lowongan_dokumen,
            'nama'       => $d->jenisDokumen?->nama_dokumen ?? '-',
            'wajib'      => (bool) $d->wajib,
            'keterangan' => $d->jenisDokumen?->keterangan ?? '',
        ])->toArray() ?? [];

        return response()->json([
            'status' => 'success',
            'data' => [
                'id'           => $lowongan->id_lowongan,
                'posisi'       => $lowongan->posisi,
                'perusahaan'   => $lowongan->perusahaan?->nama_perusahaan ?? '-',
                'lokasi'       => $lowongan->lokasi ?? '-',
                'gaji'         => $lowongan->gaji ?? '-',
                'status'       => $lowongan->status_label,
                'tanggal'      => $lowongan->batas_awal
                    ? \Carbon\Carbon::parse($lowongan->batas_awal)->translatedFormat('d F Y')
                    : '-',
                'batas'        => $lowongan->batas_akhir
                    ? \Carbon\Carbon::parse($lowongan->batas_akhir)->translatedFormat('d F Y')
                    : '-',
                'deskripsi'    => $lowongan->deskripsi ?? '',
                'persyaratan'  => $lowongan->persyaratan ?? '',
                'pertanyaan'   => $lowongan->pertanyaanSeleksi->pluck('pertanyaan')->toArray(),
                'dokumen'      => $dokumenList,
                'jumlah_pelamar' => $lowongan->lamaran_count,
                'terdeteksi'   => stripos($lowongan->posisi, 'barista') !== false || ($lowongan->id_lowongan === 1),
            ],
        ], 200);
    }

    /**
     * Nonaktifkan (suspend/blokir) akun admin kafe.
     */
    public function suspend(Request $request, $id)
    {
        $admin = Pengguna::where('peran', 'Admin_Perusahaan')->find($id);

        if (!$admin) {
            return response()->json(['status' => 'error', 'message' => 'Akun admin kafe tidak ditemukan'], 404);
        }

        $status = $request->input('status', 'Diblokir');
        if (!in_array($status, ['Aktif', 'Nonaktif', 'Diblokir'])) {
            return response()->json(['status' => 'error', 'message' => 'Status tidak valid'], 422);
        }

        $admin->status_akun = $status;
        $admin->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Status akun admin kafe berhasil diperbarui',
            'data' => [
                'status' => $admin->status_akun
            ]
        ], 200);
    }

    /**
     * Update status lowongan (misalnya diblokir/ditutup atau diaktifkan kembali).
     */
    public function updateLowonganStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:Draft,Aktif,Ditutup',
        ]);

        $lowongan = Lowongan::find($id);

        if (!$lowongan) {
            return response()->json(['status' => 'error', 'message' => 'Lowongan tidak ditemukan'], 404);
        }

        $lowongan->status = $request->status;
        $lowongan->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Status lowongan berhasil diperbarui',
            'data' => [
                'id' => $lowongan->id_lowongan,
                'status' => $lowongan->status_label,
            ]
        ], 200);
    }
}

