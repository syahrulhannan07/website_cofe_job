<?php

namespace Tests\Feature\Api;

use App\Models\Pengguna;
use App\Models\ProfilPelamar;
use App\Models\ProfilPerusahaan;
use App\Models\Lowongan;
use App\Models\Lamaran;
use App\Models\JenisDokumen;
use App\Models\Wawancara;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class PelamarTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    /**
     * TS_MOB_01: Check successful registration
     */
    public function test_pelamar_can_register_successfully()
    {
        $response = $this->postJson('/api/v1/auth/daftar-pelamar', [
            'nama_pengguna' => 'Budi Santoso',
            'email' => 'budi@example.com',
            'kata_sandi' => 'password123',
            'konfirmasi_kata_sandi' => 'password123',
        ]);

        $response->assertStatus(201)
                 ->assertJsonStructure([
                     'status',
                     'message',
                     'data' => ['id_pengguna', 'nama_pengguna', 'email']
                 ]);

        $this->assertDatabaseHas('pengguna', [
            'email' => 'budi@example.com',
            'peran' => 'Pelamar'
        ]);
    }

    /**
     * TS_MOB_02: Check duplicate email
     */
    public function test_pelamar_registration_fails_with_duplicate_email()
    {
        Pengguna::create([
            'nama_pengguna' => 'Existing User',
            'email' => 'existing@example.com',
            'kata_sandi' => Hash::make('password123'),
            'peran' => 'Pelamar'
        ]);

        $response = $this->postJson('/api/v1/auth/daftar-pelamar', [
            'nama_pengguna' => 'New User',
            'email' => 'existing@example.com',
            'kata_sandi' => 'password123',
            'konfirmasi_kata_sandi' => 'password123',
        ]);

        $response->assertStatus(409)
                 ->assertJsonFragment(['message' => 'Email sudah digunakan']);
    }

    /**
     * TS_MOB_03: Check successful login
     */
    public function test_pelamar_can_login_successfully()
    {
        $user = Pengguna::create([
            'nama_pengguna' => 'Budi Santoso',
            'email' => 'budi@example.com',
            'kata_sandi' => Hash::make('password123'),
            'peran' => 'Pelamar'
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'budi@example.com',
            'kata_sandi' => 'password123',
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'status',
                     'message',
                     'data' => ['token', 'pengguna']
                 ]);
    }

    /**
     * TS_MOB_04: Check wrong credentials
     */
    public function test_pelamar_login_fails_with_wrong_credentials()
    {
        Pengguna::create([
            'nama_pengguna' => 'Budi Santoso',
            'email' => 'budi@example.com',
            'kata_sandi' => Hash::make('password123'),
            'peran' => 'Pelamar'
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'budi@example.com',
            'kata_sandi' => 'wrongpassword',
        ]);

        $response->assertStatus(401)
                 ->assertJson([
                     'status' => 'error',
                     'message' => 'Username atau password salah.'
                 ]);
    }

    /**
     * TS_MOB_05: Check successful profile update
     */
    public function test_pelamar_can_update_profile_successfully()
    {
        $user = Pengguna::create([
            'nama_pengguna' => 'Budi Santoso',
            'email' => 'budi@example.com',
            'kata_sandi' => Hash::make('password123'),
            'peran' => 'Pelamar'
        ]);

        ProfilPelamar::create([
            'id_pengguna' => $user->id_pengguna,
            'nama_lengkap' => 'Budi Santoso',
        ]);

        $token = auth('api')->login($user);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
                         ->postJson('/api/v1/pelamar/profil/update', [
                             'nama_lengkap' => 'Budi Santoso Updated',
                             'tentang_saya' => 'Saya seorang barista berpengalaman.',
                             'tanggal_lahir' => '1995-05-05',
                             'nomor_telepon' => '08123456789',
                             'alamat' => 'Jl. Kopi No. 10',
                             'jenis_kelamin' => 'Laki-laki',
                         ]);

        $response->assertStatus(200)
                 ->assertJson([
                     'status' => 'success',
                 ]);

        $this->assertDatabaseHas('profil_pelamar', [
            'id_pengguna' => $user->id_pengguna,
            'nama_lengkap' => 'Budi Santoso Updated',
            'alamat' => 'Jl. Kopi No. 10'
        ]);
    }

    /**
     * TS_MOB_06: Check mandatory field validation
     */
    public function test_pelamar_profile_update_validation_fails_when_fields_empty()
    {
        $user = Pengguna::create([
            'nama_pengguna' => 'Budi Santoso',
            'email' => 'budi@example.com',
            'kata_sandi' => Hash::make('password123'),
            'peran' => 'Pelamar'
        ]);

        ProfilPelamar::create([
            'id_pengguna' => $user->id_pengguna,
            'nama_lengkap' => 'Budi Santoso',
        ]);

        $token = auth('api')->login($user);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
                         ->postJson('/api/v1/pelamar/profil/update', [
                             'nama_lengkap' => '', // Mandatory field empty
                         ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['nama_lengkap']);
    }

    /**
     * TS_MOB_07: Check successful job application
     */
    public function test_pelamar_can_apply_for_job_successfully()
    {
        Storage::fake('local');

        $admin = Pengguna::create([
            'nama_pengguna' => 'Admin Cafe',
            'email' => 'admin@cafe.com',
            'kata_sandi' => Hash::make('password123'),
            'peran' => 'Admin_Perusahaan'
        ]);

        $perusahaan = ProfilPerusahaan::create([
            'id_pengguna' => $admin->id_pengguna,
            'nama_perusahaan' => 'Cafe Kita',
        ]);

        $lowongan = Lowongan::create([
            'id_perusahaan' => $perusahaan->id_perusahaan,
            'posisi' => 'Barista',
            'deskripsi' => 'Dibutuhkan barista.',
            'batas_awal' => now()->subDay()->format('Y-m-d'),
            'batas_akhir' => now()->addDays(7)->format('Y-m-d'),
            'status' => 'Published'
        ]);

        $user = Pengguna::create([
            'nama_pengguna' => 'Budi Santoso',
            'email' => 'budi@example.com',
            'kata_sandi' => Hash::make('password123'),
            'peran' => 'Pelamar'
        ]);

        $profil = ProfilPelamar::create([
            'id_pengguna' => $user->id_pengguna,
            'nama_lengkap' => 'Budi Santoso',
            'nomor_telepon' => '08123456789',
        ]);

        $token = auth('api')->login($user);

        // 1. Mulai Lamaran
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
                         ->postJson('/api/v1/lamaran/mulai', [
                             'id_lowongan' => $lowongan->id_lowongan
                         ]);

        $response->assertStatus(201);
        $id_lamaran = $response->json('data.id_lamaran');

        // 2. Kirim Lamaran (Tanpa dokumen wajib jika ada, tapi di sini kita buat simpel dulu)
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
                         ->postJson("/api/v1/lamaran/{$id_lamaran}/kirim");

        $response->assertStatus(200)
                 ->assertJson([
                     'status' => 'success',
                     'message' => 'Lamaran berhasil dikirim.'
                 ]);

        $this->assertDatabaseHas('lamaran', [
            'id_lamaran' => $id_lamaran,
            'status' => 'Diproses'
        ]);
    }

    /**
     * TS_MOB_08: Check missing mandatory document
     */
    public function test_pelamar_cannot_send_application_if_mandatory_document_missing()
    {
        Storage::fake('local');

        $perusahaan = ProfilPerusahaan::create([
            'id_pengguna' => 1, // Mock
            'nama_perusahaan' => 'Cafe Kita',
        ]);

        $lowongan = Lowongan::create([
            'id_perusahaan' => $perusahaan->id_perusahaan,
            'posisi' => 'Barista',
            'batas_awal' => now()->format('Y-m-d'),
            'batas_akhir' => now()->addDays(7)->format('Y-m-d'),
            'status' => 'Published'
        ]);

        $jenisDoc = JenisDokumen::create(['nama_dokumen' => 'KTP', 'wajib' => true]);
        $lowongan->dokumenDibutuhkan()->create([
            'id_jenis_dokumen' => $jenisDoc->id_jenis_dokumen,
            'wajib' => true
        ]);

        $user = Pengguna::create([
            'nama_pengguna' => 'Budi Santoso',
            'email' => 'budi@example.com',
            'kata_sandi' => Hash::make('password123'),
            'peran' => 'Pelamar'
        ]);

        $profil = ProfilPelamar::create([
            'id_pengguna' => $user->id_pengguna,
            'nama_lengkap' => 'Budi Santoso',
            'nomor_telepon' => '08123456789',
        ]);

        $token = auth('api')->login($user);

        $lamaran = Lamaran::create([
            'id_lowongan' => $lowongan->id_lowongan,
            'id_profil' => $profil->id_profil,
            'status' => 'Diproses'
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
                         ->postJson("/api/v1/lamaran/{$lamaran->id_lamaran}/kirim");

        $response->assertStatus(422)
                 ->assertJson([
                     'status' => 'error',
                     'message' => 'Harap upload semua dokumen wajib terlebih dahulu.'
                 ]);
    }

    /**
     * TS_MOB_09: Check status visibility
     */
    public function test_pelamar_can_see_application_status()
    {
        $user = Pengguna::create([
            'nama_pengguna' => 'Budi Santoso',
            'email' => 'budi@example.com',
            'kata_sandi' => Hash::make('password123'),
            'peran' => 'Pelamar'
        ]);

        $profil = ProfilPelamar::create([
            'id_pengguna' => $user->id_pengguna,
            'nama_lengkap' => 'Budi Santoso',
        ]);

        $perusahaan = ProfilPerusahaan::create(['nama_perusahaan' => 'Cafe Kita']);
        $lowongan = Lowongan::create(['id_perusahaan' => $perusahaan->id_perusahaan, 'posisi' => 'Barista']);

        Lamaran::create([
            'id_lowongan' => $lowongan->id_lowongan,
            'id_profil' => $profil->id_profil,
            'status' => 'Diterima'
        ]);

        $token = auth('api')->login($user);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
                         ->getJson('/api/v1/pelamar/lamaran');

        $response->assertStatus(200)
                 ->assertJsonFragment(['status' => 'Diterima', 'posisi' => 'Barista']);
    }

    /**
     * TS_MOB_10: Check empty application list
     */
    public function test_pelamar_sees_empty_message_when_no_applications()
    {
        $user = Pengguna::create([
            'nama_pengguna' => 'Budi Santoso',
            'email' => 'budi@example.com',
            'kata_sandi' => Hash::make('password123'),
            'peran' => 'Pelamar'
        ]);

        $token = auth('api')->login($user);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
                         ->getJson('/api/v1/pelamar/lamaran');

        $response->assertStatus(200)
                 ->assertJson([
                     'status' => 'success',
                     'message' => 'Anda belum melamar pekerjaan apapun',
                     'data' => []
                 ]);
    }

    /**
     * TS_MOB_11: Check interview details
     */
    public function test_pelamar_can_see_interview_details()
    {
        $user = Pengguna::create([
            'nama_pengguna' => 'Budi Santoso',
            'email' => 'budi@example.com',
            'kata_sandi' => Hash::make('password123'),
            'peran' => 'Pelamar'
        ]);

        $profil = ProfilPelamar::create(['id_pengguna' => $user->id_pengguna]);
        $lamaran = Lamaran::create(['id_profil' => $profil->id_profil, 'id_lowongan' => 1, 'status' => 'Wawancara']);
        
        Wawancara::create([
            'id_lamaran' => $lamaran->id_lamaran,
            'tanggal_wawancara' => now()->addDay()->toDateTimeString(),
            'lokasi' => 'Jl. Sudirman No. 1',
            'status' => 'Terjadwal'
        ]);

        $token = auth('api')->login($user);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
                         ->getJson("/api/v1/pelamar/lamaran/{$lamaran->id_lamaran}/wawancara");

        $response->assertStatus(200)
                 ->assertJsonFragment([
                     'lokasi' => 'Jl. Sudirman No. 1',
                     'label_expired' => 'Mendatang'
                 ]);
    }

    /**
     * TS_MOB_12: Check expired schedule
     */
    public function test_pelamar_sees_expired_badge_on_past_interview()
    {
        $user = Pengguna::create([
            'nama_pengguna' => 'Budi Santoso',
            'email' => 'budi@example.com',
            'kata_sandi' => Hash::make('password123'),
            'peran' => 'Pelamar'
        ]);

        $profil = ProfilPelamar::create(['id_pengguna' => $user->id_pengguna]);
        $lamaran = Lamaran::create(['id_profil' => $profil->id_profil, 'id_lowongan' => 1, 'status' => 'Wawancara']);
        
        Wawancara::create([
            'id_lamaran' => $lamaran->id_lamaran,
            'tanggal_wawancara' => now()->subDay()->toDateTimeString(),
            'lokasi' => 'Jl. Sudirman No. 1',
            'status' => 'Terjadwal'
        ]);

        $token = auth('api')->login($user);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
                         ->getJson("/api/v1/pelamar/lamaran/{$lamaran->id_lamaran}/wawancara");

        $response->assertStatus(200)
                 ->assertJsonFragment([
                     'label_expired' => 'Kedaluwarsa'
                 ]);
    }
}
