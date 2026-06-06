<?php

namespace App\Http\Controllers\Api\V1\Pelamar;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Pelamar\UpdateProfilRequest;
use App\Http\Requests\Api\V1\Pelamar\StoreSkillRequest;
use App\Http\Requests\Api\V1\Pelamar\StorePendidikanRequest;
use App\Http\Requests\Api\V1\Pelamar\StorePengalamanRequest;
use App\Models\Skill;
use App\Models\Pendidikan;
use App\Models\PengalamanKerja;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

class ProfilController extends Controller
{
    /**
     * Mendapatkan profil lengkap pelamar (Eager Loading)
     */
    public function index()
    {
        $pengguna = auth('api')->user();
        
        if (!$pengguna) {
            return response()->json([
                'status' => 'error',
                'message' => 'Sesi berakhir, silakan login kembali.'
            ], 401);
        }

        $profil = $pengguna->profilPelamar()
            ->with(['pengguna', 'skills', 'pendidikan', 'pengalamanKerja'])
            ->first();

        if (!$profil) {
            return response()->json([
                'status' => 'error',
                'message' => 'Profil tidak ditemukan. Harap hubungi admin.'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $profil
        ], 200);
    }

    /**
     * Mengupdate data profil pelamar termasuk upload foto
     */
    public function update(UpdateProfilRequest $request)
    {
        $pengguna = auth('api')->user();
        $profil = $pengguna->profilPelamar;
        if (!$profil) {
            return response()->json([
                'status' => 'error',
                'message' => 'Profil pelamar belum tersedia'
            ], 404);
        }

        $data = $request->validated();

        // Handle Update Email di tabel pengguna
        if ($request->has('email')) {
            $pengguna->update([
                'email' => $request->email
            ]);
        }

        // Handle Upload Foto Profil
        if ($request->hasFile('foto_profil')) {
            // Hapus foto lama jika ada
            if ($profil->foto_profil) {
                Storage::disk('public')->delete($profil->foto_profil);
            }

            $path = $request->file('foto_profil')->store('foto_profil', 'public');
            $data['foto_profil'] = $path;
        }

        $profil->update($data);

        return response()->json([
            'status' => 'success',
            'message' => 'Profil berhasil diperbarui',
            'data' => $profil->fresh(['skills', 'pendidikan', 'pengalamanKerja'])
        ], 200);
    }

    /**
     * Manajemen Skill
     */
    public function storeSkill(StoreSkillRequest $request)
    {
        $profil = auth('api')->user()->profilPelamar;
        
        $skill = $profil->skills()->create($request->validated());

        return response()->json([
            'status' => 'success',
            'message' => 'Skill berhasil ditambahkan',
            'data' => $skill
        ], 201);
    }

    public function deleteSkill($id)
    {
        $profil = auth('api')->user()->profilPelamar;
        $skill = $profil->skills()->find($id);

        if (!$skill) {
            return response()->json(['status' => 'error', 'message' => 'Skill tidak ditemukan'], 404);
        }

        $skill->delete();

        return response()->json(['status' => 'success', 'message' => 'Skill berhasil dihapus'], 200);
    }

    /**
     * Manajemen Pendidikan
     */
    public function storePendidikan(StorePendidikanRequest $request)
    {
        $profil = auth('api')->user()->profilPelamar;
        
        $pendidikan = $profil->pendidikan()->create($request->validated());

        return response()->json([
            'status' => 'success',
            'message' => 'Data pendidikan berhasil ditambahkan',
            'data' => $pendidikan
        ], 201);
    }

    public function updatePendidikan(StorePendidikanRequest $request, $id)
    {
        $profil = auth('api')->user()->profilPelamar;
        $pendidikan = $profil->pendidikan()->find($id);

        if (!$pendidikan) {
            return response()->json(['status' => 'error', 'message' => 'Data pendidikan tidak ditemukan'], 404);
        }

        $pendidikan->update($request->validated());

        return response()->json([
            'status' => 'success',
            'message' => 'Data pendidikan berhasil diperbarui',
            'data' => $pendidikan
        ], 200);
    }

    public function deletePendidikan($id)
    {
        $profil = auth('api')->user()->profilPelamar;
        $pendidikan = $profil->pendidikan()->find($id);

        if (!$pendidikan) {
            return response()->json(['status' => 'error', 'message' => 'Data pendidikan tidak ditemukan'], 404);
        }

        $pendidikan->delete();

        return response()->json(['status' => 'success', 'message' => 'Data pendidikan berhasil dihapus'], 200);
    }

    /**
     * Manajemen Pengalaman Kerja
     */
    public function storePengalaman(StorePengalamanRequest $request)
    {
        $profil = auth('api')->user()->profilPelamar;
        
        $pengalaman = $profil->pengalamanKerja()->create($request->validated());

        return response()->json([
            'status' => 'success',
            'message' => 'Data pengalaman kerja berhasil ditambahkan',
            'data' => $pengalaman
        ], 201);
    }

    public function updatePengalaman(StorePengalamanRequest $request, $id)
    {
        $profil = auth('api')->user()->profilPelamar;
        $pengalaman = $profil->pengalamanKerja()->find($id);

        if (!$pengalaman) {
            return response()->json(['status' => 'error', 'message' => 'Data pengalaman kerja tidak ditemukan'], 404);
        }

        $pengalaman->update($request->validated());

        return response()->json([
            'status' => 'success',
            'message' => 'Data pengalaman kerja berhasil diperbarui',
            'data' => $pengalaman
        ], 200);
    }

    public function deletePengalaman($id)
    {
        $profil = auth('api')->user()->profilPelamar;
        $pengalaman = $profil->pengalamanKerja()->find($id);

        if (!$pengalaman) {
            return response()->json(['status' => 'error', 'message' => 'Data pengalaman kerja tidak ditemukan'], 404);
        }

        $pengalaman->delete();

        return response()->json(['status' => 'success', 'message' => 'Data pengalaman kerja berhasil dihapus'], 200);
    }

    public function updatePassword(Request $request)
    {
        // 1. Validasi input
        $request->validate([
            'current_password' => 'required',
            'password' => 'required|string|min:8|confirmed',
        ]);

        // 2. Ambil user yang sedang login dengan taktik cadangan
        $user = Auth::user();

        // Taktik Cadangan: Jika Auth::user() ternyata null/kosong karena masalah guard token
        if (!$user) {
            $user = auth('api')->user(); 
        }

        // Jika masih tidak ketemu juga (misal token benar-benar rusak)
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Sesi berakhir atau user tidak dikenali.'
            ], 401);
        }

        // 3. Pengecekan password lama (kata_sandi di DB)
        if (!Hash::check(trim($request->current_password), $user->kata_sandi)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Password saat ini salah.'
            ], 422);
        }

        // 4. Update password baru dengan enkripsi Hash::make
        $user->update([
            'kata_sandi' => Hash::make(trim($request->password))
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Password Berhasil Diubah'
        ], 200);
    }
}