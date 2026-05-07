<?php

namespace Tests\Feature\Api;

use App\Models\Pengguna;
use App\Models\ProfilPerusahaan;
use App\Models\Lowongan;
use App\Models\Lamaran;
use App\Models\ProfilPelamar;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class PerusahaanTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    /**
     * TS_WEB_13: Check successful company signup
     */
    public function test_perusahaan_can_signup_successfully()
    {
        Storage::fake('public');

        $response = $this->postJson('/api/v1/auth/register/perusahaan', [
            'nama_kafe' => 'Cafe Maju Jaya',
            'nama_pengelola' => 'Andi Admin',
            'email' => 'andi@maju.com',
            'kata_sandi' => 'password123',
            'konfirmasi_kata_sandi' => 'password123',
            'alamat' => 'Jl. Merdeka No. 1',
            'dokumen_legalitas' => UploadedFile::fake()->create('nib.pdf', 100, 'application/pdf'),
        ]);

        $response->assertStatus(201)
                 ->assertJson(['success' => true]);

        $this->assertDatabaseHas('pengguna', ['email' => 'andi@maju.com', 'peran' => 'Admin_Perusahaan']);
        $this->assertDatabaseHas('profil_perusahaan', ['nama_perusahaan' => 'Cafe Maju Jaya', 'status_verifikasi' => 'Pending']);
    }

    /**
     * TS_WEB_14: Check invalid file extension
     */
    public function test_perusahaan_signup_fails_with_invalid_file_extension()
    {
        $response = $this->postJson('/api/v1/auth/register/perusahaan', [
            'nama_kafe' => 'Cafe Maju Jaya',
            'nama_pengelola' => 'Andi Admin',
            'email' => 'andi@maju.com',
            'kata_sandi' => 'password123',
            'konfirmasi_kata_sandi' => 'password123',
            'alamat' => 'Jl. Merdeka No. 1',
            'dokumen_legalitas' => UploadedFile::fake()->create('nib.txt', 100, 'text/plain'),
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['dokumen_legalitas']);
    }

    /**
     * TS_WEB_15: Check successful admin login
     */
    public function test_admin_perusahaan_can_login_successfully()
    {
        $user = Pengguna::create([
            'nama_pengguna' => 'Andi Admin',
            'email' => 'andi@maju.com',
            'kata_sandi' => Hash::make('password123'),
            'peran' => 'Admin_Perusahaan'
        ]);

        ProfilPerusahaan::create([
            'id_pengguna' => $user->id_pengguna,
            'nama_perusahaan' => 'Cafe Maju Jaya',
            'status_verifikasi' => 'Aktif'
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'andi@maju.com',
            'kata_sandi' => 'password123',
        ]);

        $response->assertStatus(200)
                 ->assertJsonFragment(['peran' => 'Admin_Perusahaan']);
    }

    /**
     * TS_WEB_16: Check login response for unverified account
     */
    public function test_admin_login_shows_pending_status_for_unverified_account()
    {
        $user = Pengguna::create([
            'nama_pengguna' => 'Andi Admin',
            'email' => 'andi@maju.com',
            'kata_sandi' => Hash::make('password123'),
            'peran' => 'Admin_Perusahaan'
        ]);

        ProfilPerusahaan::create([
            'id_pengguna' => $user->id_pengguna,
            'nama_perusahaan' => 'Cafe Maju Jaya',
            'status_verifikasi' => 'Pending'
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'andi@maju.com',
            'kata_sandi' => 'password123',
        ]);

        $response->assertStatus(200)
                 ->assertJsonFragment(['status_verifikasi' => 'Pending']);
    }

    /**
     * TS_WEB_17: Check successful company info update
     */
    public function test_admin_can_update_company_profile_successfully()
    {
        $user = Pengguna::create([
            'nama_pengguna' => 'Andi Admin',
            'email' => 'andi@maju.com',
            'kata_sandi' => Hash::make('password123'),
            'peran' => 'Admin_Perusahaan'
        ]);

        $profil = ProfilPerusahaan::create([
            'id_pengguna' => $user->id_pengguna,
            'nama_perusahaan' => 'Cafe Maju Jaya',
        ]);

        $token = auth('api')->login($user);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
                         ->postJson('/api/v1/admin/profil-perusahaan', [
                             'nama_perusahaan' => 'Cafe Maju Jaya Berkah',
                             'deskripsi' => 'Kafe terbaik di kota.',
                             'alamat_perusahaan' => 'Jl. Baru No. 10'
                         ]);

        $response->assertStatus(200)
                 ->assertJsonFragment(['nama_perusahaan' => 'Cafe Maju Jaya Berkah']);
    }

    /**
     * TS_WEB_18: Check oversized logo upload
     */
    public function test_admin_cannot_upload_oversized_logo()
    {
        $user = Pengguna::create([
            'nama_pengguna' => 'Andi Admin',
            'email' => 'andi@maju.com',
            'kata_sandi' => Hash::make('password123'),
            'peran' => 'Admin_Perusahaan'
        ]);

        ProfilPerusahaan::create(['id_pengguna' => $user->id_pengguna]);

        $token = auth('api')->login($user);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
                         ->postJson('/api/v1/admin/profil-perusahaan', [
                             'logo' => UploadedFile::fake()->image('large_logo.png')->size(11000) // 11MB
                         ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['logo']);
    }

    /**
     * TS_WEB_19: Check successful job posting
     */
    public function test_admin_can_post_new_job_successfully()
    {
        $user = Pengguna::create([
            'nama_pengguna' => 'Andi Admin',
            'email' => 'andi@maju.com',
            'kata_sandi' => Hash::make('password123'),
            'peran' => 'Admin_Perusahaan'
        ]);

        $profil = ProfilPerusahaan::create([
            'id_pengguna' => $user->id_pengguna,
            'nama_perusahaan' => 'Cafe Maju',
            'alamat_perusahaan' => 'Jl. Ada',
            'deskripsi' => 'Deskripsi'
        ]);

        $token = auth('api')->login($user);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
                         ->postJson('/api/v1/admin/lowongan', [
                             'posisi' => 'Waiter',
                             'deskripsi' => 'Melayani pelanggan.',
                             'persyaratan' => 'Min. SMA',
                             'lokasi' => 'Jakarta',
                             'gaji' => '3000000',
                             'batas_awal' => now()->format('Y-m-d'),
                             'batas_akhir' => now()->addDays(7)->format('Y-m-d'),
                         ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('lowongan', ['posisi' => 'Waiter', 'id_perusahaan' => $profil->id_perusahaan]);
    }

    /**
     * TS_WEB_21: Check change application status
     */
    public function test_admin_can_change_application_status()
    {
        $user = Pengguna::create(['peran' => 'Admin_Perusahaan', 'email' => 'admin@cafe.com', 'kata_sandi' => Hash::make('pw')]);
        $profilPer = ProfilPerusahaan::create(['id_pengguna' => $user->id_pengguna]);
        
        $pelamar = Pengguna::create(['peran' => 'Pelamar', 'email' => 'pelamar@test.com', 'kata_sandi' => 'pw']);
        $profilPel = ProfilPelamar::create(['id_pengguna' => $pelamar->id_pengguna]);

        $lowongan = Lowongan::create(['id_perusahaan' => $profilPer->id_perusahaan, 'posisi' => 'Barista']);
        $lamaran = Lamaran::create(['id_lowongan' => $lowongan->id_lowongan, 'id_profil' => $profilPel->id_profil, 'status' => 'Diproses']);

        $token = auth('api')->login($user);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
                         ->putJson("/api/v1/admin/lamaran/{$lamaran->id_lamaran}/status", [
                             'status' => 'Diterima',
                             'keterangan' => 'Lolos kualifikasi'
                         ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('lamaran', ['id_lamaran' => $lamaran->id_lamaran, 'status' => 'Diterima']);
    }

    /**
     * TS_WEB_22: Check view candidate files
     */
    public function test_admin_can_view_candidate_files()
    {
        $user = Pengguna::create(['peran' => 'Admin_Perusahaan', 'email' => 'admin@cafe.com', 'kata_sandi' => Hash::make('pw')]);
        $profilPer = ProfilPerusahaan::create(['id_pengguna' => $user->id_pengguna]);
        $token = auth('api')->login($user);

        $pelamar = Pengguna::create(['peran' => 'Pelamar', 'email' => 'pelamar2@test.com', 'kata_sandi' => 'pw']);
        $profilPel = ProfilPelamar::create(['id_pengguna' => $pelamar->id_pengguna]);
        $lowongan = Lowongan::create(['id_perusahaan' => $profilPer->id_perusahaan, 'posisi' => 'Barista']);
        $lamaran = Lamaran::create(['id_lowongan' => $lowongan->id_lowongan, 'id_profil' => $profilPel->id_profil, 'status' => 'Diproses']);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
                         ->getJson("/api/v1/admin/lamaran/{$lamaran->id_lamaran}");

        $response->assertStatus(200)
                 ->assertJsonStructure(['status', 'data' => ['id_lamaran']]);
    }

    /**
     * TS_WEB_23: Check successful schedule creation
     */
    public function test_admin_can_create_interview_schedule()
    {
        $user = Pengguna::create(['peran' => 'Admin_Perusahaan', 'email' => 'admin@cafe.com', 'kata_sandi' => Hash::make('pw')]);
        $profilPer = ProfilPerusahaan::create(['id_pengguna' => $user->id_pengguna]);
        $token = auth('api')->login($user);

        $pelamar = Pengguna::create(['peran' => 'Pelamar', 'email' => 'pelamar3@test.com', 'kata_sandi' => 'pw']);
        $profilPel = ProfilPelamar::create(['id_pengguna' => $pelamar->id_pengguna]);
        $lowongan = Lowongan::create(['id_perusahaan' => $profilPer->id_perusahaan, 'posisi' => 'Barista']);
        $lamaran = Lamaran::create(['id_lowongan' => $lowongan->id_lowongan, 'id_profil' => $profilPel->id_profil, 'status' => 'Diproses']);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
                         ->postJson("/api/v1/admin/lamaran/{$lamaran->id_lamaran}/wawancara", [
                             'tanggal_wawancara' => now()->addDay()->toDateTimeString(),
                             'lokasi' => 'Cafe Maju',
                             'catatan' => 'Bawa CV'
                         ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('wawancara', ['id_lamaran' => $lamaran->id_lamaran, 'lokasi' => 'Cafe Maju']);
    }

    /**
     * TS_WEB_24: Check incomplete schedule data
     */
    public function test_admin_schedule_creation_fails_with_incomplete_data()
    {
        $user = Pengguna::create(['peran' => 'Admin_Perusahaan', 'email' => 'admin@cafe.com', 'kata_sandi' => Hash::make('pw')]);
        $token = auth('api')->login($user);

        $lamaran = Lamaran::create(['id_lowongan' => 1, 'id_profil' => 1, 'status' => 'Diproses']);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
                         ->postJson("/api/v1/admin/lamaran/{$lamaran->id_lamaran}/wawancara", [
                             'tanggal_wawancara' => '', // Missing
                             'lokasi' => '' // Missing
                         ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['tanggal_wawancara', 'lokasi']);
    }
}
