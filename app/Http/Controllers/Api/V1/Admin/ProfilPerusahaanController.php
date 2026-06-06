<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;

class ProfilPerusahaanController extends Controller
{
    public function index()
    {
        $admin = auth('api')->user();
        $profil = $admin->profilPerusahaan;

        if (!$profil) {
            return response()->json([
                'status' => 'error',
                'message' => 'Profil perusahaan tidak ditemukan'
            ], 404);
        }

        // Include user data
        $profil->nama_pengguna = $admin->nama_pengguna;
        $profil->email = $admin->email;

        return response()->json([
            'status' => 'success',
            'data' => $profil
        ]);
    }

    public function update(Request $request)
    {
        $admin = auth('api')->user();
        $profil = $admin->profilPerusahaan;

        if (!$profil) {
            return response()->json([
                'status' => 'error',
                'message' => 'Profil perusahaan tidak ditemukan'
            ], 404);
        }

        // Validasi
        $validator = Validator::make($request->all(), [
            'nama_perusahaan' => 'nullable|string|max:255',
            'nama_pengguna' => 'nullable|string|max:255',
            'email' => 'nullable|email|unique:pengguna,email,' . $admin->id_pengguna . ',id_pengguna',
            'alamat_perusahaan' => 'nullable|string',
            'kecamatan' => 'nullable|string|max:255',
            'deskripsi' => 'nullable|string',
            'tanggal_berdiri' => 'nullable|date',
            'logo' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:10240',
            'dokumen_izin' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
        ], [
            'logo.max' => 'Gagal mengunggah: Ukuran gambar terlalu besar',
            'logo.mimes' => 'Format file logo tidak valid',
            'logo.image' => 'Format file logo tidak valid',
            'dokumen_izin.max' => 'Gagal mengunggah: Ukuran dokumen terlalu besar',
            'dokumen_izin.mimes' => 'Format file dokumen tidak valid',
            'dokumen_izin.file' => 'Format file dokumen tidak valid',
        ]);

        if ($validator->fails()) {
            // [UPDATE LOGIC]
            $message = $validator->errors()->first();
            if ($validator->errors()->has('logo')) {
                $message = $validator->errors()->first('logo');
            } elseif ($validator->errors()->has('dokumen_izin')) {
                $message = $validator->errors()->first('dokumen_izin');
            }
            return response()->json([
                'status' => 'error',
                'message' => $message,
                'errors' => $validator->errors()
            ], 422);
        }

        // Update User Data
        if ($request->has('nama_pengguna')) {
            $admin->nama_pengguna = $request->nama_pengguna;
        }
        if ($request->has('email')) {
            $admin->email = $request->email;
        }
        $admin->save();

        // Update Profil Data
        if ($request->has('nama_perusahaan')) {
            $profil->nama_perusahaan = $request->nama_perusahaan;
        }
        if ($request->has('alamat_perusahaan')) {
            $profil->alamat_perusahaan = $request->alamat_perusahaan;
        }
        if ($request->has('kecamatan')) {
            $profil->kecamatan = $request->kecamatan;
        }
        if ($request->has('deskripsi')) {
            $profil->deskripsi = $request->deskripsi;
        }
        if ($request->has('tanggal_berdiri')) {
            $profil->tanggal_berdiri = $request->tanggal_berdiri;
        }

        // Handle logo upload
        if ($request->hasFile('logo')) {
            if ($profil->logo_perusahaan) {
                Storage::disk('public')->delete($profil->logo_perusahaan);
            }

            $file = $request->file('logo');
            $fileName = time() . '_logo_' . $file->getClientOriginalName();
            $path = $file->storeAs('logo_kafe', $fileName, 'public');
            $profil->logo_perusahaan = $path;
        }

        // Handle Dokumen Izin upload
        if ($request->hasFile('dokumen_izin')) {
            if ($profil->dokumen_izin) {
                Storage::disk('public')->delete($profil->dokumen_izin);
            }

            $file = $request->file('dokumen_izin');
            $fileName = time() . '_izin_' . $file->getClientOriginalName();
            $path = $file->storeAs('legalitas', $fileName, 'public');
            $profil->dokumen_izin = $path;
        }

        $profil->save();

        // Reload data to include updated user info
        $profil->nama_pengguna = $admin->nama_pengguna;
        $profil->email = $admin->email;

        return response()->json([
            'status' => 'success',
            'message' => 'Profil berhasil diperbarui',
            'data' => $profil
        ]);
    }

    /**
     * Ganti password perusahaan menggunakan password lama.
     */
    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = auth('api')->user();

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Sesi berakhir atau user tidak dikenali.'
            ], 401);
        }

        // Cek password lama
        if (!Hash::check(trim($request->current_password), $user->kata_sandi)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Password saat ini salah.'
            ], 422);
        }

        // Update password baru
        $user->update([
            'kata_sandi' => Hash::make(trim($request->password))
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Password berhasil diubah.'
        ], 200);
    }
}
