<?php

namespace App\Http\Controllers\Api\V1\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\ProfilPerusahaan;
use App\Mail\PersetujuanPerusahaanMail;
use App\Mail\PenolakanPerusahaanMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

// [UPDATE LOGIC] - Controller baru untuk menangani verifikasi profil perusahaan
class VerifikasiPerusahaanController extends Controller
{
    /**
     * Tampilkan daftar perusahaan yang berstatus 'Pending'.
     */
    public function index()
    {
        // [UPDATE LOGIC] - Mengambil data kafe dengan status 'Pending' beserta data pengguna (admin kafe)
        $pendingPerusahaan = ProfilPerusahaan::with('pengguna')
            ->where('status_verifikasi', 'Pending')
            ->orderBy('created_at', 'desc')
            ->get();

        // Pemetaan data agar formatnya sesuai dengan kebutuhan tabel di frontend
        $data = $pendingPerusahaan->map(function ($p) {
            return [
                'id' => $p->id_perusahaan, // key id dipetakan dari id_perusahaan
                'id_perusahaan' => $p->id_perusahaan,
                'nama_perusahaan' => $p->nama_perusahaan,
                'nama_pengguna' => $p->pengguna?->nama_pengguna,
                'email' => $p->pengguna?->email,
                'alamat_perusahaan' => $p->alamat_perusahaan,
                'kecamatan' => $p->kecamatan,
                'deskripsi' => $p->deskripsi,
                'dokumen_izin' => $p->dokumen_izin,
                'dokumen_legalitas' => $p->dokumen_legalitas,
                'created_at' => $p->created_at?->toIso8601String(),
                'status_verifikasi' => $p->status_verifikasi,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $data
        ], 200);
    }

    /**
     * Setujui pendaftaran akun kafe.
     */
    public function approve($id)
    {
        // [UPDATE LOGIC] - Mengambil profil kafe beserta penggunanya
        $perusahaan = ProfilPerusahaan::with('pengguna')->find($id);

        if (!$perusahaan) {
            return response()->json([
                'status' => 'error',
                'message' => 'Profil perusahaan tidak ditemukan'
            ], 404);
        }

        // Ubah status_verifikasi menjadi 'Diterima'
        $perusahaan->status_verifikasi = 'Diterima';
        $perusahaan->save();

        // Ubah status_akun pengguna terkait menjadi 'Aktif'
        if ($perusahaan->pengguna) {
            $perusahaan->pengguna->status_akun = 'Aktif';
            $perusahaan->pengguna->save();

            // Kirim email PersetujuanPerusahaanMail secara synchronous
            try {
                Mail::to($perusahaan->pengguna->email)
                    ->send(new PersetujuanPerusahaanMail($perusahaan));
            } catch (\Exception $e) {
                Log::error('Gagal mengirim email persetujuan untuk perusahaan ID ' . $id . ': ' . $e->getMessage());
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Pendaftaran perusahaan berhasil disetujui'
        ], 200);
    }

    /**
     * Tolak pendaftaran akun kafe.
     */
    public function reject(Request $request, $id)
    {
        // [UPDATE LOGIC] - Validasi alasan penolakan
        $validator = Validator::make($request->all(), [
            'alasan' => 'required|string|min:5'
        ], [
            'alasan.required' => 'Alasan penolakan wajib diisi',
            'alasan.min' => 'Alasan penolakan minimal berisi 5 karakter'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $perusahaan = ProfilPerusahaan::with('pengguna')->find($id);

        if (!$perusahaan) {
            return response()->json([
                'status' => 'error',
                'message' => 'Profil perusahaan tidak ditemukan'
            ], 404);
        }

        // Ubah status_verifikasi menjadi 'Ditolak' dan simpan alasan penolakan
        $perusahaan->status_verifikasi = 'Ditolak';
        $perusahaan->alasan_penolakan = $request->alasan;
        $perusahaan->save();

        // Kirim email PenolakanPerusahaanMail secara synchronous
        if ($perusahaan->pengguna) {
            try {
                Mail::to($perusahaan->pengguna->email)
                    ->send(new PenolakanPerusahaanMail($perusahaan, $request->alasan));
            } catch (\Exception $e) {
                Log::error('Gagal mengirim email penolakan untuk perusahaan ID ' . $id . ': ' . $e->getMessage());
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Pendaftaran perusahaan telah ditolak'
        ], 200);
    }
}
