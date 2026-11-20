<?php

namespace Tests\Feature;

use App\Models\Pengguna;
use App\Models\ProfilPerusahaan;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class SuperAdminVerifikasiTest extends TestCase
{
    use RefreshDatabase;

    private Pengguna $superAdmin;

    private Pengguna $adminPerusahaan;

    private ProfilPerusahaan $profilPerusahaan;

    protected function setUp(): void
    {
        parent::setUp();

        Notification::fake();

        $this->superAdmin = Pengguna::create([
            'nama_pengguna' => 'Super Admin',
            'email' => 'superadmin-verifikasi@test.local',
            'kata_sandi' => Hash::make('rahasia123'),
            'peran' => 'Super_Admin',
            'status_akun' => 'Aktif',
        ]);

        $this->adminPerusahaan = Pengguna::create([
            'nama_pengguna' => 'Owner Kafe Uji',
            'email' => 'owner-verifikasi@test.local',
            'kata_sandi' => Hash::make('rahasia123'),
            'peran' => 'Admin_Perusahaan',
            'status_akun' => 'Nonaktif',
        ]);

        $this->profilPerusahaan = ProfilPerusahaan::create([
            'id_pengguna' => $this->adminPerusahaan->id_pengguna,
            'nama_perusahaan' => 'Kafe Uji Verifikasi',
            'alamat_perusahaan' => 'Jl. Uji No. 1',
            'status_verifikasi' => 'Pending',
        ]);
    }

    private function loginSuperAdmin(): string
    {
        $response = $this->postJson('/api/v1/auth/portal-pusat/login', [
            'username_email' => $this->superAdmin->email,
            'kata_sandi' => 'rahasia123',
        ]);

        $response->assertStatus(200);

        return $response->json('data.token');
    }

    public function test_super_admin_dapat_menyetujui_verifikasi(): void
    {
        $token = $this->loginSuperAdmin();

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson("/api/v1/superadmin/verifikasi/{$this->profilPerusahaan->id_perusahaan}/setujui");

        $response->assertStatus(200);

        $this->assertDatabaseHas('profil_perusahaan', [
            'id_perusahaan' => $this->profilPerusahaan->id_perusahaan,
            'status_verifikasi' => 'Diterima',
        ]);

        $this->assertDatabaseHas('pengguna', [
            'id_pengguna' => $this->adminPerusahaan->id_pengguna,
            'status_akun' => 'Aktif',
        ]);
    }

    public function test_super_admin_dapat_menolak_verifikasi_dengan_alasan_minimal_lima_karakter(): void
    {
        $token = $this->loginSuperAdmin();

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson("/api/v1/superadmin/verifikasi/{$this->profilPerusahaan->id_perusahaan}/tolak", [
                'alasan' => 'Data tidak valid',
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('profil_perusahaan', [
            'id_perusahaan' => $this->profilPerusahaan->id_perusahaan,
            'status_verifikasi' => 'Ditolak',
            'alasan_penolakan' => 'Data tidak valid',
        ]);
    }

    public function test_penolakan_dengan_alasan_kurang_dari_lima_karakter_ditolak(): void
    {
        $token = $this->loginSuperAdmin();

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson("/api/v1/superadmin/verifikasi/{$this->profilPerusahaan->id_perusahaan}/tolak", [
                'alasan' => 'abc',
            ]);

        $response->assertStatus(422);
    }
}
