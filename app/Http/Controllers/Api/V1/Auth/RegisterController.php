<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Models\Pengguna;
use App\Models\ProfilPelamar;
use App\Models\ProfilPerusahaan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class RegisterController extends Controller
{
    public function daftarPelamar(Request $request)
    {
        // 1. Validasi input
        $validator = Validator::make($request->all(), [
            'nama_pengguna' => 'required|string|min:3|max:100',
            'email' => 'required|string|email|max:255',
            'kata_sandi' => 'required|string|min:8',
            'konfirmasi_kata_sandi' => 'required|same:kata_sandi',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        // 2. Cek apakah email sudah terdaftar (return 409 sesuai permintaan)
        if (Pengguna::where('email', $request->email)->exists()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Email sudah digunakan'
            ], 409);
        }

        try {
            DB::beginTransaction();

            // 3 & 4. Simpan ke tabel PENGGUNA
            $pengguna = Pengguna::create([
                'nama_pengguna' => $request->nama_pengguna,
                'email' => $request->email,
                'kata_sandi' => Hash::make($request->kata_sandi),
                'peran' => 'Pelamar',
            ]);

            // 5. Buat record kosong di PROFIL_PELAMAR
            ProfilPelamar::create([
                'id_pengguna' => $pengguna->id_pengguna,
                'nama_lengkap' => $request->nama_pengguna, // Optional: default to username
            ]);

            DB::commit();

            // 6. Return 201 dengan data pengguna
            return response()->json([
                'status' => 'success',
                'message' => 'Registrasi berhasil',
                'data' => [
                    'id_pengguna' => $pengguna->id_pengguna,
                    'nama_pengguna' => $pengguna->nama_pengguna,
                    'email' => $pengguna->email,
                    'peran' => $pengguna->peran,
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat registrasi',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function daftarPerusahaan(Request $request)
    {
        // 1. Validasi input dan file
        $validator = Validator::make($request->all(), [
            'nama_pengguna' => 'required|string|min:3|max:100',
            'email' => 'required|string|email|max:255',
            'kata_sandi' => 'required|string|min:8',
            'nama_perusahaan' => 'required|string|max:255',
            'alamat_perusahaan' => 'required|string',
            'dokumen_izin' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        // 2. Cek email unik
        if (Pengguna::where('email', $request->email)->exists()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Email sudah digunakan'
            ], 409);
        }

        try {
            DB::beginTransaction();

            // 3. Simpan file dokumen_izin
            $path = $request->file('dokumen_izin')->store('dokumen_izin', 'public');

            if (!$path) {
                throw new \Exception('Gagal menyimpan file');
            }

            // 4. Buat record PENGGUNA
            $pengguna = Pengguna::create([
                'nama_pengguna' => $request->nama_pengguna,
                'email' => $request->email,
                'kata_sandi' => Hash::make($request->kata_sandi),
                'peran' => 'Admin_Perusahaan',
            ]);

            // 5. Buat record PROFIL_PERUSAHAAN
            ProfilPerusahaan::create([
                'id_pengguna' => $pengguna->id_pengguna,
                'nama_perusahaan' => $request->nama_perusahaan,
                'alamat_perusahaan' => $request->alamat_perusahaan,
                'dokumen_izin' => $path,
                'status_verifikasi' => 'Pending',
            ]);

            DB::commit();

            // 6. Return response sukses
            return response()->json([
                'status' => 'success',
                'message' => 'Pendaftaran berhasil. Akun Anda sedang ditinjau oleh Super Admin. Harap tunggu persetujuan.',
                'data' => [
                    'id_pengguna' => $pengguna->id_pengguna,
                    'email' => $pengguna->email,
                    'nama_perusahaan' => $request->nama_perusahaan,
                    'status_verifikasi' => 'Pending',
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat pendaftaran',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function registrasiPerusahaan(Request $request)
    {
        // 1. Validasi input
        $validator = Validator::make($request->all(), [
            'nama_kafe' => 'required|string|min:3|max:255',
            'nama_pengelola' => 'required|string|max:255',
            'email' => 'required|string|email|max:255',
            'kata_sandi' => 'required|string|min:8',
            'konfirmasi_kata_sandi' => 'required|same:kata_sandi',
            'alamat' => 'required|string',
            'deskripsi' => 'nullable|string',
            'dokumen_legalitas' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ], [
            'dokumen_legalitas.required' => 'Dokumen wajib diunggah untuk keperluan verifikasi',
            'dokumen_legalitas.mimes' => 'Format dokumen tidak valid',
            'dokumen_legalitas.max' => 'Ukuran dokumen maksimal 5MB',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        // 2. Cek email unik
        if (Pengguna::where('email', $request->email)->exists()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Email ini sudah digunakan. Silakan gunakan email yang berbeda.'
            ], 422);
        }

        try {
            DB::beginTransaction();

            // 3. Simpan file dokumen_legalitas ke storage/legalitas/
            $file = $request->file('dokumen_legalitas');
            $fileName = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('legalitas', $fileName, 'public');

            if (!$path) {
                throw new \Exception('Gagal menyimpan dokumen legalitas');
            }

            // 4. Buat record PENGGUNA
            $pengguna = Pengguna::create([
                'nama_pengguna' => $request->nama_pengelola,
                'email' => $request->email,
                'kata_sandi' => Hash::make($request->kata_sandi),
                'peran' => 'Admin_Perusahaan',
            ]);

            // 5. Buat record PROFIL_PERUSAHAAN
            ProfilPerusahaan::create([
                'id_pengguna' => $pengguna->id_pengguna,
                'nama_perusahaan' => $request->nama_kafe,
                'alamat_perusahaan' => $request->alamat,
                'deskripsi' => $request->deskripsi,
                'dokumen_legalitas' => $path,
                'status_verifikasi' => 'Pending',
            ]);

            DB::commit();

            // 6. Return response sukses
            return response()->json([
                'success' => true,
                'message' => 'Pendaftaran berhasil. Akun Anda sedang ditinjau oleh Super Admin. Harap tunggu persetujuan.'
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat pendaftaran',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
