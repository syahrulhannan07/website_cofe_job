<?php

namespace Tests\Feature\Api;

use App\Models\Pengguna;
use App\Models\ProfilPerusahaan;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use Illuminate\Support\Facades\Hash;

class SuperAdminTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    /**
     * TS_WEB_25: Check super admin access
     */
    public function test_super_admin_can_login_successfully()
    {
        $user = Pengguna::create([
            'nama_pengguna' => 'Super Admin',
            'email' => 'super@admin.com',
            'kata_sandi' => Hash::make('password123'),
            'peran' => 'Super_Admin'
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'super@admin.com',
            'kata_sandi' => 'password123',
        ]);

        $response->assertStatus(200)
                 ->assertJsonFragment(['peran' => 'Super_Admin']);
    }

    /**
     * TS_WEB_26: Check wrong admin credentials
     */
    public function test_super_admin_login_fails_with_wrong_credentials()
    {
        $user = Pengguna::create([
            'nama_pengguna' => 'Super Admin',
            'email' => 'super@admin.com',
            'kata_sandi' => Hash::make('password123'),
            'peran' => 'Super_Admin'
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'super@admin.com',
            'kata_sandi' => 'wrongpassword',
        ]);

        $response->assertStatus(401);
    }

    /**
     * TS_WEB_27: Check company approval
     */
    public function test_super_admin_can_approve_company()
    {
        $admin = Pengguna::create(['peran' => 'Super_Admin', 'email' => 'super@admin.com', 'kata_sandi' => Hash::make('pw')]);
        $token = auth('api')->login($admin);

        $userPer = Pengguna::create(['peran' => 'Admin_Perusahaan', 'email' => 'cafe@test.com', 'kata_sandi' => 'pw']);
        $perusahaan = ProfilPerusahaan::create([
            'id_pengguna' => $userPer->id_pengguna,
            'nama_perusahaan' => 'Cafe Baru',
            'status_verifikasi' => 'Pending'
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
                         ->postJson("/api/v1/superadmin/verifikasi/{$perusahaan->id_perusahaan}/setujui");

        $response->assertStatus(200);
        $this->assertDatabaseHas('profil_perusahaan', [
            'id_perusahaan' => $perusahaan->id_perusahaan,
            'status_verifikasi' => 'Diterima'
        ]);
    }

    /**
     * TS_WEB_28: Check company rejection
     */
    public function test_super_admin_can_reject_company_with_reason()
    {
        $admin = Pengguna::create(['peran' => 'Super_Admin', 'email' => 'super@admin.com', 'kata_sandi' => Hash::make('pw')]);
        $token = auth('api')->login($admin);

        $userPer = Pengguna::create(['peran' => 'Admin_Perusahaan', 'email' => 'cafe2@test.com', 'kata_sandi' => 'pw']);
        $perusahaan = ProfilPerusahaan::create([
            'id_pengguna' => $userPer->id_pengguna,
            'nama_perusahaan' => 'Cafe Baru',
            'status_verifikasi' => 'Pending'
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
                         ->postJson("/api/v1/superadmin/verifikasi/{$perusahaan->id_perusahaan}/tolak", [
                             'alasan' => 'Dokumen tidak lengkap dan tidak terbaca.'
                         ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('profil_perusahaan', [
            'id_perusahaan' => $perusahaan->id_perusahaan,
            'status_verifikasi' => 'Ditolak',
            'alasan_penolakan' => 'Dokumen tidak lengkap dan tidak terbaca.'
        ]);
    }

    /**
     * TS_WEB_29: Check account suspension
     */
    public function test_super_admin_can_suspend_admin_account()
    {
        $super = Pengguna::create(['peran' => 'Super_Admin', 'email' => 'super@admin.com', 'kata_sandi' => Hash::make('pw')]);
        $token = auth('api')->login($super);

        $admin = Pengguna::create(['peran' => 'Admin_Perusahaan', 'email' => 'admin@cafe.com', 'kata_sandi' => Hash::make('pw'), 'status_akun' => 'Aktif']);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
                         ->postJson("/api/v1/superadmin/admin/{$admin->id_pengguna}/nonaktifkan", [
                             'alasan' => 'Melanggar aturan.'
                         ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('pengguna', [
            'id_pengguna' => $admin->id_pengguna,
            'status_akun' => 'Diblokir'
        ]);
    }

    /**
     * TS_WEB_30: Check account search results
     */
    public function test_super_admin_sees_no_results_when_searching_non_existent_company()
    {
        $super = Pengguna::create(['peran' => 'Super_Admin', 'email' => 'super@admin.com', 'kata_sandi' => Hash::make('pw')]);
        $token = auth('api')->login($super);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
                         ->getJson("/api/v1/superadmin/admin?cari=NonExistentCafe");

        $response->assertStatus(200);
        
        // The structure depends on whether it's a paginated response or simple successResponse
        $data = $response->json('data');
        $this->assertCount(0, $data);
    }
}
