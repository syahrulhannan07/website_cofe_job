<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

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
            'alamat_perusahaan' => 'nullable|string',
            'deskripsi' => 'nullable|string',
            'logo' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:10240',
        ], [
            'logo.max' => 'Gagal mengunggah: Ukuran gambar terlalu besar',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        // Update data
        if ($request->has('nama_perusahaan')) {
            $profil->nama_perusahaan = $request->nama_perusahaan;
        }
        if ($request->has('alamat_perusahaan')) {
            $profil->alamat_perusahaan = $request->alamat_perusahaan;
        }
        if ($request->has('deskripsi')) {
            $profil->deskripsi = $request->deskripsi;
        }

        // Handle logo upload
        if ($request->hasFile('logo')) {
            // Hapus logo lama jika ada
            if ($profil->logo_perusahaan) {
                Storage::disk('public')->delete($profil->logo_perusahaan);
            }

            $file = $request->file('logo');
            $fileName = time() . '_logo_' . $file->getClientOriginalName();
            $path = $file->storeAs('logo_kafe', $fileName, 'public');
            $profil->logo_perusahaan = $path;
        }

        $profil->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Profil berhasil diperbarui',
            'data' => $profil
        ]);
    }
}
