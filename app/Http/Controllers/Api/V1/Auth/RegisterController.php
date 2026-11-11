<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Models\Nib;
use App\Models\Pengguna;
use App\Models\ProfilPelamar;
use App\Models\ProfilPerusahaan;
use App\Rules\NotCoordinatePair;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use App\Enums\StatusScreening;

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

            // Kirim notifikasi selamat datang ke pelamar
            $pengguna->notify(new \App\Notifications\NewApplicantRegisteredNotification());

            // Kirim notifikasi ke semua Super Admin
            $superAdmins = \App\Models\Pengguna::where('peran', 'Super_Admin')->get();
            foreach ($superAdmins as $sa) {
                $sa->notify(new \App\Notifications\NewApplicantRegisteredSuperAdminNotification($pengguna));
            }

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

            $errorMessage = 'Terjadi kesalahan saat registrasi';
            $exceptionMessage = $e->getMessage();

            if (str_contains($exceptionMessage, 'SQL') || str_contains($exceptionMessage, 'database') || str_contains($exceptionMessage, 'PDO')) {
                $errorMessage = 'Gagal menyimpan data ke database. Pastikan MySQL berjalan dan sudah menjalankan `php artisan migrate`.';
            }

            return response()->json([
                'status' => 'error',
                'message' => $errorMessage,
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
            'alamat_perusahaan' => ['required', 'string', new NotCoordinatePair()],
            'latitude' => 'nullable|required_with:longitude|numeric|between:-90,90',
            'longitude' => 'nullable|required_with:latitude|numeric|between:-180,180',
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
            $perusahaan = ProfilPerusahaan::create([
                'id_pengguna' => $pengguna->id_pengguna,
                'nama_perusahaan' => $request->nama_perusahaan,
                'alamat_perusahaan' => $request->alamat_perusahaan,
                'latitude' => $request->input('latitude'),
                'longitude' => $request->input('longitude'),
                'dokumen_izin' => $path,
                'status_verifikasi' => 'Pending',
            ]);

            // Dispatch CompanyRegistered event
            event(new \App\Events\CompanyRegistered($perusahaan));

            DB::commit();

            // Kirim notifikasi registrasi berhasil ke perusahaan
            $pengguna->notify(new \App\Notifications\CompanyRegistrationReceivedNotification($perusahaan));

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

            $errorMessage = 'Terjadi kesalahan saat pendaftaran';
            $exceptionMessage = $e->getMessage();

            if (str_contains($exceptionMessage, 'public') || str_contains($exceptionMessage, 'Storage::disk(')) {
                $errorMessage = 'Gagal menyimpan berkas ke storage publik. Pastikan `php artisan storage:link` sudah dijalankan dan folder storage writable.';
            } elseif (str_contains($exceptionMessage, 'SQL') || str_contains($exceptionMessage, 'database') || str_contains($exceptionMessage, 'PDO')) {
                $errorMessage = 'Gagal menyimpan data ke database. Pastikan MySQL berjalan dan sudah menjalankan `php artisan migrate`.';
            }

            return response()->json([
                'status' => 'error',
                'message' => $errorMessage,
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
            'alamat' => ['required', 'string', new NotCoordinatePair()],
            'latitude' => 'nullable|required_with:longitude|numeric|between:-90,90',
            'longitude' => 'nullable|required_with:latitude|numeric|between:-180,180',
            'deskripsi' => 'nullable|string',
            'dokumen_legalitas' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'foto_outlet' => 'nullable|file|mimes:jpg,jpeg,png|max:5120',

        ], [
            'required' => ':attribute wajib diisi.',
            'string' => ':attribute harus berupa teks.',
            'email' => ':attribute harus berupa alamat email yang valid.',
            'min' => ':attribute minimal :min karakter.',
            'max' => ':attribute maksimal :max karakter.',
            'konfirmasi_kata_sandi.same' => 'Konfirmasi kata sandi harus sama dengan kata sandi.',
            'latitude.required_with' => 'Latitude wajib diisi jika longitude diisi.',
            'longitude.required_with' => 'Longitude wajib diisi jika latitude diisi.',
            'numeric' => ':attribute harus berupa angka.',
            'between' => ':attribute harus antara :min dan :max.',
            'file' => ':attribute harus berupa berkas yang valid.',
            'uploaded' => ':attribute gagal diunggah.',
            'dokumen_legalitas.required' => 'Dokumen wajib diunggah untuk keperluan verifikasi',
            'dokumen_legalitas.mimes' => 'Format dokumen tidak valid',
            'dokumen_legalitas.max' => 'Ukuran dokumen maksimal 5MB',
            'foto_outlet.mimes' => 'Format foto outlet tidak valid (JPG/JPEG/PNG).',
            'foto_outlet.max' => 'Ukuran foto outlet maksimal 5MB',

        ], [
            'nama_kafe' => 'Nama kafe',
            'nama_pengelola' => 'Nama pengelola',
            'email' => 'Email',
            'kata_sandi' => 'Kata sandi',
            'konfirmasi_kata_sandi' => 'Konfirmasi kata sandi',
            'alamat' => 'Alamat',
            'latitude' => 'Latitude',
            'longitude' => 'Longitude',
            'deskripsi' => 'Deskripsi',
            'dokumen_legalitas' => 'Dokumen legalitas',
            'foto_outlet' => 'Foto outlet',

        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors()
            ], 422);
        }

        // 2. Cek email unik
        if (Pengguna::where('email', $request->email)->exists()) {
            $message = 'Email ini sudah digunakan. Silakan gunakan email yang berbeda.';
            return response()->json([
                'status' => 'error',
                'message' => $message,
                'errors' => ['email' => [$message]],
            ], 422);
        }

        $uploadedPathsPublic = [];
        $uploadedPathsLocal = [];
        $pathFotoOutlet = null;
        try {
            // Simpan dokumen_izin di public storage untuk kompatibilitas konsumen lama
            $pathPublic = $this->storeCompanyRegistrationFile(
                $request->file('dokumen_legalitas'),
                'legalitas',
                'public',
                $uploadedPathsPublic
            );

            // Simpan dokumen_nib di private storage untuk screening
            $pathLocal = $this->storeCompanyRegistrationFile(
                $request->file('dokumen_legalitas'),
                'legalitas',
                'local',
                $uploadedPathsLocal
            );

            // Simpan foto outlet di public storage (opsional)
            if ($request->hasFile('foto_outlet')) {
                $pathFotoOutlet = $this->storeCompanyRegistrationFile(
                    $request->file('foto_outlet'),
                    'foto_outlet',
                    'public',
                    $uploadedPathsPublic
                );
            }

            [$pengguna, $perusahaan] = DB::transaction(function () use ($request, $pathPublic, $pathLocal, $pathFotoOutlet) {
                // 4. Buat record PENGGUNA
                $pengguna = Pengguna::create([
                    'nama_pengguna' => $request->nama_pengelola,
                    'email' => $request->email,
                    'kata_sandi' => Hash::make($request->kata_sandi),
                    'peran' => 'Admin_Perusahaan',
                ]);

                // 5. Buat record PROFIL_PERUSAHAAN — dokumen_izin di public storage
                $perusahaan = ProfilPerusahaan::create([
                    'id_pengguna' => $pengguna->id_pengguna,
                    'nama_perusahaan' => $request->nama_kafe,

                    'alamat_perusahaan' => $request->alamat,
                    'latitude' => $request->input('latitude'),
                    'longitude' => $request->input('longitude'),
                    'deskripsi' => $request->deskripsi,
                    'dokumen_izin' => $pathPublic,
                    'logo_perusahaan' => $pathFotoOutlet,
                    'status_verifikasi' => 'Pending',
                ]);

                // 6. Buat record NIB — dokumen_nib di private storage
                Nib::create([
                    'id_perusahaan' => $perusahaan->id_perusahaan,
                    'dokumen_nib' => $pathLocal,
                    'status_screening' => StatusScreening::Belum_Diperiksa,
                ]);

                return [$pengguna, $perusahaan];
            });
        } catch (\Throwable $e) {
            Log::error('Company registration failed', ['exception' => $e]);
            // Cleanup both disks
            foreach ($uploadedPathsPublic as $uploadedPath) {
                try {
                    if (!Storage::disk('public')->delete($uploadedPath)) {
                        Log::error('Company registration upload cleanup failed (public)', ['path' => $uploadedPath]);
                    }
                } catch (\Throwable $cleanupError) {
                    Log::error('Company registration upload cleanup failed (public)', ['path' => $uploadedPath, 'exception' => $cleanupError]);
                }
            }
            foreach ($uploadedPathsLocal as $uploadedPath) {
                try {
                    if (!Storage::disk('local')->delete($uploadedPath)) {
                        Log::error('Company registration upload cleanup failed (local)', ['path' => $uploadedPath]);
                    }
                } catch (\Throwable $cleanupError) {
                    Log::error('Company registration upload cleanup failed (local)', ['path' => $uploadedPath, 'exception' => $cleanupError]);
                }
            }

            $errorMessage = 'Terjadi kesalahan saat pendaftaran';
            $exceptionMessage = $e->getMessage();

            if (str_contains($exceptionMessage, 'public') || str_contains($exceptionMessage, 'Storage::disk(')) {
                $errorMessage = 'Gagal menyimpan berkas ke storage publik. Pastikan `php artisan storage:link` sudah dijalankan dan folder storage writable.';
            } elseif (str_contains($exceptionMessage, 'local')) {
                $errorMessage = 'Gagal menyimpan berkas ke storage lokal. Periksa izin folder storage.';
            } elseif (str_contains($exceptionMessage, 'SQL') || str_contains($exceptionMessage, 'database') || str_contains($exceptionMessage, 'PDO')) {
                $errorMessage = 'Gagal menyimpan data ke database. Pastikan MySQL berjalan dan sudah menjalankan `php artisan migrate`.';
            }

            return response()->json([
                'status' => 'error',
                'message' => $errorMessage,
            ], 500);
        }

        // Dispatch CompanyRegistered event after successful commit
        try {
            event(new \App\Events\CompanyRegistered($perusahaan));
        } catch (\Throwable $e) {
            // Log event failure but don't fail registration
            \Illuminate\Support\Facades\Log::error('CompanyRegistered event failed: ' . $e->getMessage());
        }

        // Kirim notifikasi registrasi berhasil ke perusahaan
        try {
            $pengguna->notify(new \App\Notifications\CompanyRegistrationReceivedNotification($perusahaan));
        } catch (\Throwable $e) {
            // Log notification failure but don't fail registration
            \Illuminate\Support\Facades\Log::error('CompanyRegistrationReceivedNotification failed: ' . $e->getMessage());
        }

        // 7. Return response sukses
        return response()->json([
            'success' => true,
            'message' => 'Pendaftaran berhasil. Akun Anda sedang ditinjau oleh Super Admin. Harap tunggu persetujuan.'
        ], 201);
    }

    private function storeCompanyRegistrationFile(UploadedFile $file, string $directory, string $disk = 'local', array &$uploadedPaths): string
    {
        // Track the generated name before writing so partial writes can also be removed.
        $uploadedPaths[] = $directory . '/' . $file->hashName();
        $path = $file->store($directory, $disk);
        if (!$path) {
            throw new \RuntimeException('Gagal menyimpan berkas pendaftaran perusahaan.');
        }

        return $path;
    }
}
