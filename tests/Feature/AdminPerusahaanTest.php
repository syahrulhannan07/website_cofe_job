<?php

namespace Tests\Feature;

use App\Models\JenisDokumen;
use App\Models\Lamaran;
use App\Models\Lowongan;
use App\Models\Pengguna;
use App\Models\ProfilPelamar;
use App\Models\ProfilPerusahaan;
use App\Models\Wawancara;
use App\Mail\StatusLamaranMail;
use App\Mail\UndanganWawancaraMail;
use Database\Factories\JenisDokumenFactory;
use Database\Factories\LamaranFactory;
use Database\Factories\LowonganFactory;
use Database\Factories\PenggunaFactory;
use Database\Factories\ProfilPelamarFactory;
use Database\Factories\ProfilPerusahaanFactory;
use Database\Factories\WawancaraFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

// [UPDATE LOGIC] - Test suite untuk Admin Perusahaan
class AdminPerusahaanTest extends TestCase
{
    use RefreshDatabase;

    private $admin;
    private $profilPerusahaan;
    private $token;

    protected function setUp(): void
    {
        parent::setUp();

        // Buat user admin perusahaan dan profilnya
        $this->admin = PenggunaFactory::new()->create([
            'peran' => 'Admin_Perusahaan',
            'status_akun' => 'Aktif',
        ]);
        
        $this->profilPerusahaan = ProfilPerusahaanFactory::new()->create([
            'id_pengguna' => $this->admin->id_pengguna,
            'status_verifikasi' => 'Diterima',
            'logo_perusahaan' => 'logo/default.png',
            'nama_perusahaan' => 'Kafe Tester',
            'alamat_perusahaan' => 'Jl. Kopi Tester',
        ]);

        $this->token = auth('api')->login($this->admin);
    }

    /**
     * FR-08 (UC-07) - Mengelola Profil Perusahaan Skenario Normal
     */
    public function test_mengelola_profil_perusahaan_sukses()
    {
        Storage::fake('public');
        $logo = UploadedFile::fake()->image('logo.png', 100, 100);

        $payload = [
            'nama_perusahaan' => 'Kafe Baru Indonesia',
            'nama_pengguna' => 'admin_baru',
            'email' => 'admin_baru@kafe.com',
            'alamat_perusahaan' => 'Jl. Baru No. 123',
            'deskripsi' => 'Kafe modern aesthetic.',
            'logo' => $logo,
        ];

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/v1/admin/profil-perusahaan', $payload);

        $response->assertStatus(200);
        $response->assertJsonPath('status', 'success');

        $this->assertDatabaseHas('profil_perusahaan', [
            'id_perusahaan' => $this->profilPerusahaan->id_perusahaan,
            'nama_perusahaan' => 'Kafe Baru Indonesia',
            'alamat_perusahaan' => 'Jl. Baru No. 123',
        ]);

        $this->assertDatabaseHas('pengguna', [
            'id_pengguna' => $this->admin->id_pengguna,
            'nama_pengguna' => 'admin_baru',
            'email' => 'admin_baru@kafe.com',
        ]);
    }

    /**
     * FR-08 (UC-07) - Mengelola Profil Perusahaan Skenario Alternatif (Logo > 10MB)
     */
    public function test_mengelola_profil_perusahaan_gagal_logo_terlalu_besar()
    {
        Storage::fake('public');
        // File logo berukuran 11MB (11264 KB)
        $logo = UploadedFile::fake()->create('logo_giant.png', 11000, 'image/png');

        $payload = [
            'logo' => $logo,
        ];

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/v1/admin/profil-perusahaan', $payload);

        $response->assertStatus(422);
        $response->assertJsonPath('status', 'error');
        $response->assertJsonPath('message', 'Gagal mengunggah: Ukuran gambar terlalu besar');
    }

    /**
     * FR-08.01 (UC-08) - Mengelola Lowongan Skenario Normal
     */
    public function test_mengelola_lowongan_sukses()
    {
        $payload = [
            'posisi' => 'Barista Senior',
            'deskripsi' => 'Membuat kopi berkualitas tinggi.',
            'persyaratan' => 'Pengalaman minimal 2 tahun.',
            'lokasi' => 'Bandung',
            'gaji' => 'Rp 4.000.000',
            'batas_awal' => now()->format('Y-m-d'),
            'batas_akhir' => now()->addDays(15)->format('Y-m-d'),
            'status' => 'Draft',
        ];

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/v1/admin/lowongan', $payload);

        $response->assertStatus(201);
        $response->assertJsonPath('status', 'success');

        $this->assertDatabaseHas('lowongan', [
            'posisi' => 'Barista Senior',
            'id_perusahaan' => $this->profilPerusahaan->id_perusahaan,
            'status' => 'Draft',
        ]);
    }

    /**
     * FR-08.01 (UC-08) - Mengelola Lowongan Skenario Alternatif (Blokir Active jika Pending/Belum Lengkap)
     */
    public function test_mengelola_lowongan_gagal_active_jika_pending_atau_belum_lengkap()
    {
        // Kasus 1: Akun perusahaan masih berstatus 'Pending' (Belum Terverifikasi)
        $adminPending = PenggunaFactory::new()->create(['peran' => 'Admin_Perusahaan']);
        $profilPending = ProfilPerusahaanFactory::new()->create([
            'id_pengguna' => $adminPending->id_pengguna,
            'status_verifikasi' => 'Pending',
            'logo_perusahaan' => 'logo/default.png',
            'nama_perusahaan' => 'Kafe Pending',
            'alamat_perusahaan' => 'Jl. Kopi Pending',
        ]);
        $tokenPending = auth('api')->login($adminPending);

        $payload = [
            'posisi' => 'Barista Senior',
            'deskripsi' => 'Membuat kopi.',
            'persyaratan' => 'Pengalaman.',
            'batas_awal' => now()->format('Y-m-d'),
            'batas_akhir' => now()->addDays(15)->format('Y-m-d'),
            'status' => 'Active',
        ];

        $responsePending = $this->withHeader('Authorization', 'Bearer ' . $tokenPending)
            ->postJson('/api/v1/admin/lowongan', $payload);

        $responsePending->assertStatus(403);
        $responsePending->assertJsonPath('message', 'Akun Anda sedang dalam proses verifikasi oleh Super Admin. Harap tunggu persetujuan.');

        // Kasus 2: Akun terverifikasi tapi profil belum lengkap (logo_perusahaan kosong)
        $adminIncomplete = PenggunaFactory::new()->create(['peran' => 'Admin_Perusahaan']);
        $profilIncomplete = ProfilPerusahaan::create([
            'id_pengguna' => $adminIncomplete->id_pengguna,
            'status_verifikasi' => 'Diterima',
            'nama_perusahaan' => 'Kafe Belum Lengkap',
            'alamat_perusahaan' => 'Jl. Belum Lengkap',
            'logo_perusahaan' => null, // Bikin tidak lengkap!
        ]);
        $tokenIncomplete = auth('api')->login($adminIncomplete);

        $responseIncomplete = $this->withHeader('Authorization', 'Bearer ' . $tokenIncomplete)
            ->postJson('/api/v1/admin/lowongan', $payload);

        $responseIncomplete->assertStatus(422);
        $responseIncomplete->assertJsonPath('message', 'Lengkapi profil kafe Anda terlebih dahulu sebelum memposting');
    }

    /**
     * FR-09 (UC-09) - Mengelola Status Lamaran Skenario Normal
     */
    public function test_mengelola_status_lamaran_sukses()
    {
        Mail::fake();

        $pelamar = PenggunaFactory::new()->create(['peran' => 'Pelamar']);
        $profilPelamar = ProfilPelamarFactory::new()->create(['id_pengguna' => $pelamar->id_pengguna]);
        $lowongan = LowonganFactory::new()->create(['id_perusahaan' => $this->profilPerusahaan->id_perusahaan]);
        
        $lamaran = LamaranFactory::new()->create([
            'id_lowongan' => $lowongan->id_lowongan,
            'id_profil' => $profilPelamar->id_profil,
            'status' => 'Diproses',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->putJson("/api/v1/admin/lamaran/{$lamaran->id_lamaran}/status", [
                'status' => 'Wawancara',
            ]);

        $response->assertStatus(200);
        $response->assertJsonPath('status', 'success');
        $response->assertJsonPath('data.status', 'Wawancara');

        $this->assertDatabaseHas('lamaran', [
            'id_lamaran' => $lamaran->id_lamaran,
            'status' => 'Wawancara',
        ]);

        Mail::assertSent(StatusLamaranMail::class, function ($mail) use ($pelamar) {
            return $mail->hasTo($pelamar->email);
        });
    }

    /**
     * FR-09 (UC-09) - Mengelola Status Lamaran Skenario Alternatif (ID Tidak Ditemukan)
     */
    public function test_mengelola_status_lamaran_gagal_id_tidak_ditemukan()
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->putJson('/api/v1/admin/lamaran/9999/status', [
                'status' => 'Wawancara',
            ]);

        $response->assertStatus(404);
        $response->assertJsonPath('status', 'error');
    }

    /**
     * FR-09.01 (UC-09.01) - Menjadwalkan Wawancara Skenario Normal
     */
    public function test_menjadwalkan_wawancara_sukses()
    {
        Mail::fake();

        $pelamar = PenggunaFactory::new()->create(['peran' => 'Pelamar']);
        $profilPelamar = ProfilPelamarFactory::new()->create(['id_pengguna' => $pelamar->id_pengguna]);
        $lowongan = LowonganFactory::new()->create(['id_perusahaan' => $this->profilPerusahaan->id_perusahaan]);
        
        $lamaran = LamaranFactory::new()->create([
            'id_lowongan' => $lowongan->id_lowongan,
            'id_profil' => $profilPelamar->id_profil,
            'status' => 'Diproses',
        ]);

        $payload = [
            'tanggal' => '2026-06-01',
            'waktu' => '10:00',
            'tempat_link' => 'Ruang Meeting Kafe',
            'tanggal_wawancara' => '2026-06-01 10:00',
            'lokasi' => 'Jl. Sukajadi No. 12 Bandung',
            'catatan' => 'Harap bawa CV cetak.',
        ];

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson("/api/v1/admin/lamaran/{$lamaran->id_lamaran}/wawancara", $payload);

        $response->assertStatus(201);
        $response->assertJsonPath('status', 'success');

        $this->assertDatabaseHas('wawancara', [
            'id_lamaran' => $lamaran->id_lamaran,
            'lokasi' => 'Jl. Sukajadi No. 12 Bandung',
        ]);

        $this->assertDatabaseHas('lamaran', [
            'id_lamaran' => $lamaran->id_lamaran,
            'status' => 'Wawancara', // Otomatis berubah status lamarannya menjadi Wawancara
        ]);

        Mail::assertSent(UndanganWawancaraMail::class, function ($mail) use ($pelamar) {
            return $mail->hasTo($pelamar->email);
        });
    }

    /**
     * FR-09.01 (UC-09.01) - Menjadwalkan Wawancara Skenario Alternatif (Input Kosong)
     */
    public function test_menjadwalkan_wawancara_gagal_input_kosong()
    {
        $pelamar = PenggunaFactory::new()->create(['peran' => 'Pelamar']);
        $profilPelamar = ProfilPelamarFactory::new()->create(['id_pengguna' => $pelamar->id_pengguna]);
        $lowongan = LowonganFactory::new()->create(['id_perusahaan' => $this->profilPerusahaan->id_perusahaan]);
        
        $lamaran = LamaranFactory::new()->create([
            'id_lowongan' => $lowongan->id_lowongan,
            'id_profil' => $profilPelamar->id_profil,
            'status' => 'Diproses',
        ]);

        $payload = [
            'tanggal' => '', // kosong
            'waktu' => '',
            'tempat_link' => '',
            'tanggal_wawancara' => '',
            'lokasi' => '',
        ];

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson("/api/v1/admin/lamaran/{$lamaran->id_lamaran}/wawancara", $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['tanggal', 'waktu', 'tempat_link', 'tanggal_wawancara', 'lokasi']);
    }
}
