<?php

namespace App\Http\Controllers\Api\V1\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Pengguna;
use Illuminate\Http\Request;

// [UPDATE LOGIC] - Controller baru untuk mengelola akun admin kafe oleh Super Admin
class SuperAdminKafeController extends Controller
{
    /**
     * Ambil daftar seluruh akun Admin Kafe dari database.
     * Dukung fitur pencarian berdasarkan nama kafe atau nama pengguna terkait.
     */
    public function index(Request $request)
    {
        // [UPDATE LOGIC] - Query mengambil data admin kafe dengan relasi profilPerusahaan
        $query = Pengguna::where('peran', 'Admin_Perusahaan')
            ->with('profilPerusahaan');

        // [UPDATE LOGIC] - Dukung fitur pencarian jika terdapat parameter query ?search=...
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                // filter pada nama pengguna terkait
                $q->where('nama_pengguna', 'LIKE', "%{$search}%")
                  // filter pada nama kafe terkait (profil_perusahaan)
                  ->orWhereHas('profilPerusahaan', function ($qp) use ($search) {
                      $qp->where('nama_perusahaan', 'LIKE', "%{$search}%");
                  });
            });
        }

        $admins = $query->orderBy('created_at', 'desc')->get();

        // [UPDATE LOGIC] - Pemetaan data agar formatnya sesuai dengan kebutuhan di frontend
        $data = $admins->map(function ($a) {
            return [
                'id' => $a->id_pengguna,
                'nama_pengguna' => $a->nama_pengguna,
                'nama_perusahaan' => $a->profilPerusahaan?->nama_perusahaan ?? '-',
                'email' => $a->email,
                'status' => $a->status_akun, // status_akun bernilai 'Aktif' atau 'Diblokir'
                'dibuat_pada' => $a->created_at?->toIso8601String(),
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $data
        ], 200);
    }

    /**
     * Tangani request penonaktifan akun menggunakan method PUT atau PATCH.
     */
    public function suspend($id)
    {
        // [UPDATE LOGIC] - Mencari akun admin kafe terkait
        $admin = Pengguna::where('peran', 'Admin_Perusahaan')->find($id);

        if (!$admin) {
            return response()->json([
                'status' => 'error',
                'message' => 'Akun admin kafe tidak ditemukan'
            ], 404);
        }

        // [UPDATE LOGIC] - Ubah status akun pengguna menjadi "Diblokir"
        $admin->status_akun = 'Diblokir';
        $admin->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Akun admin kafe berhasil ditangguhkan/diblokir'
        ], 200);
    }
}
