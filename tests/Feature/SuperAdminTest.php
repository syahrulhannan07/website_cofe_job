<?php

namespace Tests\Feature;

use App\Models\Pengguna;
use App\Models\ProfilPerusahaan;
use App\Mail\PersetujuanPerusahaanMail;
use App\Mail\PenolakanPerusahaanMail;
use Database\Factories\PenggunaFactory;
use Database\Factories\ProfilPerusahaanFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

// [UPDATE LOGIC] - Test suite untuk Super Admin (Verifikasi Perusahaan & Kelola Akun Admin)
class SuperAdminTest extends TestCase
{
    use RefreshDatabase;

    private $superAdmin;
    private $token;

    protected function setUp(): void
    {
        parent::setUp();

        // Buat user Super Admin
        $this->superAdmin = PenggunaFactory::new()->create([
            'peran' => 'Super_Admin',
            'status_akun' => 'Aktif',
        ]);

        $this->token = auth('api')->login($this->superAdmin);
    }

    /**
     * FR-11 (UC-10) - Verifikasi Perusahaan Skenario Normal (Setuju)
     */
    public function test_verifikasi_perusahaan_setuju_sukses()
    {
        Mail::fake();

        // Buat admin perusahaan dengan status Nonaktif
        $admin = PenggunaFactory::new()->create([
            'peran' => 'Admin_Perusahaan',
            'status_akun' => 'Nonaktif',
        ]);

        $profil = ProfilPerusahaanFactory::new()->create([
            'id_pengguna' => $admin->id_pengguna,
            'status_verifikasi' => 'Pending',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->putJson("/api/v1/super-admin/verifikasi/{$profil->id_perusahaan}/setuju");

        $response->assertStatus(200);
        $response->assertJsonPath('status', 'success');

        // Pastikan status verifikasi berubah menjadi Diterima
        $this->assertDatabaseHas('profil_perusahaan', [
            'id_perusahaan' => $profil->id_perusahaan,
            'status_verifikasi' => 'Diterima',
        ]);

        // Pastikan status akun pengguna menjadi Aktif
        $this->assertDatabaseHas('pengguna', [
            'id_pengguna' => $admin->id_pengguna,
            'status_akun' => 'Aktif',
        ]);

        // Pastikan email PersetujuanPerusahaanMail dikirim
        Mail::assertSent(PersetujuanPerusahaanMail::class, function ($mail) use ($admin) {
            return $mail->hasTo($admin->email);
        });
    }

    /**
     * FR-11 (UC-10) - Verifikasi Perusahaan Skenario Alternatif (Tolak - Alasan Kurang dari 5 Karakter)
     */
    public function test_verifikasi_perusahaan_tolak_gagal_alasan_terlalu_pendek()
    {
        $admin = PenggunaFactory::new()->create([
            'peran' => 'Admin_Perusahaan',
        ]);

        $profil = ProfilPerusahaanFactory::new()->create([
            'id_pengguna' => $admin->id_pengguna,
            'status_verifikasi' => 'Pending',
        ]);

        // Kirim alasan kurang dari 5 karakter
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->putJson("/api/v1/super-admin/verifikasi/{$profil->id_perusahaan}/tolak", [
                'alasan' => 'fail', // 4 karakter
            ]);

        $response->assertStatus(422);
        $response->assertJsonPath('status', 'error');
        $response->assertJsonValidationErrors(['alasan']);
    }

    /**
     * FR-11 (UC-10) - Verifikasi Perusahaan Skenario Normal (Tolak - Alasan Valid)
     */
    public function test_verifikasi_perusahaan_tolak_sukses()
    {
        Mail::fake();

        $admin = PenggunaFactory::new()->create([
            'peran' => 'Admin_Perusahaan',
            'status_akun' => 'Nonaktif',
        ]);

        $profil = ProfilPerusahaanFactory::new()->create([
            'id_pengguna' => $admin->id_pengguna,
            'status_verifikasi' => 'Pending',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->putJson("/api/v1/super-admin/verifikasi/{$profil->id_perusahaan}/tolak", [
                'alasan' => 'Dokumen tidak valid atau buram.', // >= 5 karakter
            ]);

        $response->assertStatus(200);
        $response->assertJsonPath('status', 'success');

        // Pastikan status verifikasi berubah menjadi Ditolak dan alasan disimpan
        $this->assertDatabaseHas('profil_perusahaan', [
            'id_perusahaan' => $profil->id_perusahaan,
            'status_verifikasi' => 'Ditolak',
            'alasan_penolakan' => 'Dokumen tidak valid atau buram.',
        ]);

        // Pastikan email PenolakanPerusahaanMail dikirim
        Mail::assertSent(PenolakanPerusahaanMail::class, function ($mail) use ($admin) {
            return $mail->hasTo($admin->email);
        });
    }

    /**
     * FR-12 (UC-12) - Mengelola Akun Admin Skenario Normal (Suspend & Blokir Login)
     */
    public function test_mengelola_akun_admin_suspend_dan_blokir_login()
    {
        // 1. Super Admin menangguhkan/memblokir akun admin perusahaan
        $admin = PenggunaFactory::new()->create([
            'peran' => 'Admin_Perusahaan',
            'status_akun' => 'Aktif',
            'email' => 'admin_kafe_blokir@test.com',
            'kata_sandi' => Hash::make('password123'),
        ]);

        $profil = ProfilPerusahaanFactory::new()->create([
            'id_pengguna' => $admin->id_pengguna,
            'status_verifikasi' => 'Diterima',
        ]);

        $responseSuspend = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->putJson("/api/v1/super-admin/akun-kafe/{$admin->id_pengguna}/suspend");

        $responseSuspend->assertStatus(200);
        $responseSuspend->assertJsonPath('status', 'success');

        // Pastikan status akun di database menjadi Diblokir
        $this->assertDatabaseHas('pengguna', [
            'id_pengguna' => $admin->id_pengguna,
            'status_akun' => 'Diblokir',
        ]);

        // 2. Simulasi login kembali menggunakan akun yang telah diblokir tersebut
        $responseLogin = $this->postJson('/api/v1/auth/login', [
            'email' => 'admin_kafe_blokir@test.com',
            'kata_sandi' => 'password123',
        ]);

        // Pastikan sistem menolak dengan mengembalikan respons HTTP 403 atau pesan penangguhan
        $responseLogin->assertStatus(403);
        $responseLogin->assertJsonPath('status', 'error');
        $responseLogin->assertJsonPath('message', 'Akun Anda telah ditangguhkan. Silakan hubungi bantuan.');
    }
}
