<?php

namespace Tests\Feature;

use App\Models\Pengguna;
use App\Models\ProfilPerusahaan;
use Database\Factories\PenggunaFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

// [UPDATE LOGIC] - Test suite untuk Autentikasi dan Registrasi
class AuthTest extends TestCase
{
    use RefreshDatabase;

    /**
     * FR-01 (UC-01) - Registrasi Pelamar Skenario Normal
     */
    public function test_registrasi_pelamar_sukses()
    {
        $payload = [
            'nama_pengguna' => 'pelamartest',
            'email' => 'pelamar@test.com',
            'kata_sandi' => 'password123',
            'konfirmasi_kata_sandi' => 'password123',
        ];

        $response = $this->postJson('/api/v1/auth/daftar-pelamar', $payload);

        $response->assertStatus(201);
        $response->assertJsonPath('status', 'success');
        $this->assertDatabaseHas('pengguna', [
            'nama_pengguna' => 'pelamartest',
            'email' => 'pelamar@test.com',
            'peran' => 'Pelamar',
        ]);
        $this->assertDatabaseHas('profil_pelamar', [
            'nama_lengkap' => 'pelamartest',
        ]);
    }

    /**
     * FR-01 (UC-01) - Registrasi Pelamar Skenario Alternatif (Email sudah terdaftar)
     */
    public function test_registrasi_pelamar_gagal_email_duplikat()
    {
        PenggunaFactory::new()->create([
            'email' => 'pelamar@test.com',
        ]);

        $payload = [
            'nama_pengguna' => 'pelamartest2',
            'email' => 'pelamar@test.com',
            'kata_sandi' => 'password123',
            'konfirmasi_kata_sandi' => 'password123',
        ];

        $response = $this->postJson('/api/v1/auth/daftar-pelamar', $payload);

        $response->assertStatus(409);
        $response->assertJsonPath('status', 'error');
        $response->assertJsonPath('message', 'Email sudah digunakan');
    }

    /**
     * FR-06 (UC-06) - Registrasi Perusahaan Skenario Normal
     */
    public function test_registrasi_perusahaan_sukses()
    {
        Storage::fake('public');
        $file = UploadedFile::fake()->create('nib.pdf', 100, 'application/pdf');

        $payload = [
            'nama_pengguna' => 'kafetest',
            'email' => 'kafe@test.com',
            'kata_sandi' => 'password123',
            'nama_perusahaan' => 'Kafe Antigravity',
            'alamat_perusahaan' => 'Jl. Antigravity 123',
            'dokumen_izin' => $file,
        ];

        $response = $this->postJson('/api/v1/auth/daftar-perusahaan', $payload);

        $response->assertStatus(201);
        $response->assertJsonPath('status', 'success');
        $response->assertJsonPath('data.status_verifikasi', 'Pending');

        $this->assertDatabaseHas('pengguna', [
            'nama_pengguna' => 'kafetest',
            'email' => 'kafe@test.com',
            'peran' => 'Admin_Perusahaan',
        ]);

        $this->assertDatabaseHas('profil_perusahaan', [
            'nama_perusahaan' => 'Kafe Antigravity',
            'status_verifikasi' => 'Pending',
        ]);
    }

    /**
     * FR-06 (UC-06) - Registrasi Perusahaan Skenario Alternatif (Dokumen NIB/Izin Kosong)
     */
    public function test_registrasi_perusahaan_gagal_dokumen_kosong()
    {
        $payload = [
            'nama_pengguna' => 'kafetest',
            'email' => 'kafe@test.com',
            'kata_sandi' => 'password123',
            'nama_perusahaan' => 'Kafe Antigravity',
            'alamat_perusahaan' => 'Jl. Antigravity 123',
            'dokumen_izin' => '', // kosong
        ];

        $response = $this->postJson('/api/v1/auth/daftar-perusahaan', $payload);

        $response->assertStatus(422);
        $response->assertJsonPath('status', 'error');
    }

    /**
     * FR-02, FR-07, FR-10 (UC-02) - Unified Login Multi-Role Pelamar
     */
    public function test_login_pelamar_sukses()
    {
        $pengguna = PenggunaFactory::new()->create([
            'email' => 'pelamar@test.com',
            'kata_sandi' => Hash::make('password123'),
            'peran' => 'Pelamar',
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'pelamar@test.com',
            'kata_sandi' => 'password123',
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('status', 'success');
        $response->assertJsonStructure(['data' => ['token', 'pengguna']]);
    }

    /**
     * FR-02, FR-07, FR-10 (UC-02) - Unified Login Multi-Role Admin Perusahaan
     */
    public function test_login_admin_perusahaan_sukses()
    {
        $pengguna = PenggunaFactory::new()->create([
            'email' => 'admin@test.com',
            'kata_sandi' => Hash::make('password123'),
            'peran' => 'Admin_Perusahaan',
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@test.com',
            'kata_sandi' => 'password123',
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('status', 'success');
        $response->assertJsonStructure(['data' => ['token', 'pengguna']]);
    }

    /**
     * FR-02, FR-07, FR-10 (UC-02) - Unified Login Multi-Role Super Admin
     */
    public function test_login_super_admin_sukses()
    {
        $pengguna = PenggunaFactory::new()->create([
            'email' => 'super@test.com',
            'kata_sandi' => Hash::make('password123'),
            'peran' => 'Super_Admin',
        ]);

        $response = $this->postJson('/api/v1/auth/portal-pusat/login', [
            'username_email' => 'super@test.com',
            'kata_sandi' => 'password123',
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('status', 'success');
        $response->assertJsonStructure(['data' => ['token', 'pengguna']]);
    }

    /**
     * FR-02, FR-07, FR-10 (UC-02) - Login Skenario Alternatif (Password Salah)
     */
    public function test_login_gagal_password_salah()
    {
        $pengguna = PenggunaFactory::new()->create([
            'email' => 'pelamar@test.com',
            'kata_sandi' => Hash::make('password123'),
            'peran' => 'Pelamar',
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'pelamar@test.com',
            'kata_sandi' => 'passwordsalah',
        ]);

        $response->assertStatus(401);
        $response->assertJsonPath('status', 'error');
    }
}
