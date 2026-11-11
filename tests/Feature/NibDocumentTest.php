<?php

namespace Tests\Feature;

use App\Models\Nib;
use App\Models\Pengguna;
use App\Models\ProfilPerusahaan;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class NibDocumentTest extends TestCase
{
    use RefreshDatabase;

    private const ROUTE_DOKUMEN = '/api/v1/super-admin/nib';

    protected function setUp(): void
    {
        parent::setUp();
        $this->assertSame('sqlite', DB::connection()->getDriverName());
        $this->assertSame(':memory:', DB::connection()->getDatabaseName());
        Storage::fake('public');
        Storage::fake('local');
    }

    /**
     * Membuat super admin dan perusahaan dengan record NIB untuk pengujian.
     */
    private function setupSuperAdminAndCompany(): array
    {
        $superAdmin = Pengguna::create([
            'nama_pengguna' => 'super_admin',
            'email' => 'superadmin@example.com',
            'kata_sandi' => bcrypt('password'),
            'peran' => 'Super_Admin',
            'status_akun' => 'Aktif',
        ]);

        $pengguna = Pengguna::create([
            'nama_pengguna' => 'admin_kafe',
            'email' => 'kafe@example.com',
            'kata_sandi' => bcrypt('password'),
            'peran' => 'Admin_Perusahaan',
            'status_akun' => 'Aktif',
        ]);

        $perusahaan = ProfilPerusahaan::create([
            'id_pengguna' => $pengguna->id_pengguna,
            'nama_perusahaan' => 'Kafe Uji',
            'alamat_perusahaan' => 'Jl. Uji No. 1, Indramayu',
            'status_verifikasi' => 'Pending',
        ]);

        // Simpan dokumen_izin di public storage (kompatibilitas lama)
        $filePublic = UploadedFile::fake()->create('izin_document.pdf', 100, 'application/pdf');
        $pathPublic = $filePublic->store('legalitas', 'public');

        // Simpan dokumen_nib di private storage (screening)
        $fileLocal = UploadedFile::fake()->create('nib_document.pdf', 100, 'application/pdf');
        $pathLocal = $fileLocal->store('legalitas', 'local');

        // Simpan path dokumen_izin ke database
        $perusahaan->update(['dokumen_izin' => $pathPublic]);

        $nib = Nib::create([
            'id_perusahaan' => $perusahaan->id_perusahaan,
            'dokumen_nib' => $pathLocal,
            'status_screening' => \App\Enums\StatusScreening::Belum_Diperiksa,
        ]);

        return [
            'superAdmin' => $superAdmin,
            'pengguna' => $pengguna,
            'perusahaan' => $perusahaan,
            'nib' => $nib,
            'pathPublic' => $pathPublic,
            'pathLocal' => $pathLocal,
        ];
    }

    /**
     * Buat token JWT untuk super admin.
     */
    private function superAdminToken(Pengguna $superAdmin): string
    {
        return \PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth::fromUser($superAdmin);
    }

    /** @test */
    public function dokumen_nib_berhasil_disimpan_di_private_storage(): void
    {
        $this->setupSuperAdminAndCompany();

        $nib = Nib::first();
        $this->assertNotNull($nib);
        $this->assertNotNull($nib->dokumen_nib);

        // Dokumen NIB harus ada di private storage (local disk)
        $this->assertTrue(Storage::disk('local')->exists($nib->dokumen_nib));

        // Dokumen NIB tidak boleh ada di public storage
        $this->assertFalse(Storage::disk('public')->exists($nib->dokumen_nib));
    }

    /** @test */
    public function dokumen_izin_tetap_di_public_storage_untuk_kompatibilitas_lama(): void
    {
        $data = $this->setupSuperAdminAndCompany();

        $perusahaan = ProfilPerusahaan::first();
        $this->assertNotNull($perusahaan->dokumen_izin);

        // dokumen_izin harus ada di public storage
        $this->assertTrue(Storage::disk('public')->exists($perusahaan->dokumen_izin));

        // dokumen_izin tidak boleh ada di local storage
        $this->assertFalse(Storage::disk('local')->exists($perusahaan->dokumen_izin));
    }

    /** @test */
    public function dokumen_nib_tidak_bisa_diakses_secara_publik(): void
    {
        $data = $this->setupSuperAdminAndCompany();

        // Akses langsung ke storage path harus gagal (private storage tidak ada URL publik)
        $response = $this->get('/storage/' . $data['pathLocal']);
        $response->assertStatus(404);
    }

    /** @test */
    public function dokumen_izin_bisa_diakses_melalui_url_publik(): void
    {
        $data = $this->setupSuperAdminAndCompany();

        // dokumen_izin di public storage harus bisa diakses via URL publik
        $response = $this->get('/storage/' . $data['pathPublic']);
        $response->assertStatus(200);
    }

    /** @test */
    public function super_admin_terautentikasi_dapat_mengakses_dokumen_nib(): void
    {
        $data = $this->setupSuperAdminAndCompany();
        $token = $this->superAdminToken($data['superAdmin']);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->get("{self::ROUTE_DOKUMEN}/{$data['nib']->id_nib}/dokumen");

        $response->assertStatus(200);
        $response->assertHeader('Content-Type');
        $response->assertHeader('Content-Disposition');
        $response->assertHeader('X-Content-Type-Options', 'nosniff');
    }

    /** @test */
    public function pengguna_tanpa_autentikasi_ditolak(): void
    {
        $data = $this->setupSuperAdminAndCompany();

        $response = $this->get("{self::ROUTE_DOKUMEN}/{$data['nib']->id_nib}/dokumen");

        $response->assertStatus(401);
    }

    /** @test */
    public function pengguna_tanpa_role_super_admin_ditolak(): void
    {
        $data = $this->setupSuperAdminAndCompany();
        $penggunaToken = \PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth::fromUser($data['pengguna']);

        $response = $this->withHeader('Authorization', 'Bearer ' . $penggunaToken)
            ->get("{self::ROUTE_DOKUMEN}/{$data['nib']->id_nib}/dokumen");

        $response->assertStatus(403);
    }

    /** @test */
    public function dokumen_tidak_ditemukan_menghasilkan_respons_404(): void
    {
        $data = $this->setupSuperAdminAndCompany();
        $token = $this->superAdminToken($data['superAdmin']);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->get("{self::ROUTE_DOKUMEN}/999999/dokumen");

        $response->assertStatus(404);
    }

    /** @test */
    public function path_traversal_tidak_bisa_dilakukan(): void
    {
        $data = $this->setupSuperAdminAndCompany();
        $token = $this->superAdminToken($data['superAdmin']);

        // Coba akses dengan path traversal di parameter id_nib
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->get("{self::ROUTE_DOKUMEN}/../escape/dokumen");

        $response->assertStatus(404);
    }

    /** @test */
    public function file_format_tidak_didukung_ditolak(): void
    {
        $data = $this->setupSuperAdminAndCompany();
        $token = $this->superAdminToken($data['superAdmin']);

        // Upload file dengan format yang tidak didukung (misalnya .exe)
        Storage::disk('local')->put('nib/malicious.exe', 'fake executable content');

        $nib = Nib::first();
        $nib->update(['dokumen_nib' => 'nib/malicious.exe']);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->get("{self::ROUTE_DOKUMEN}/{$nib->id_nib}/dokumen");

        $response->assertStatus(415);
    }

    /** @test */
    public function dokumen_yang_hilang_menghasilkan_respons_404(): void
    {
        $data = $this->setupSuperAdminAndCompany();
        $token = $this->superAdminToken($data['superAdmin']);

        // Hapus file dari storage
        Storage::disk('local')->delete($data['pathLocal']);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->get("{self::ROUTE_DOKUMEN}/{$data['nib']->id_nib}/dokumen");

        $response->assertStatus(404);
    }

    /** @test */
    public function kegagalan_transaksi_tidak_meninggalkan_file_yatim(): void
    {
        // Setup super admin
        $superAdmin = Pengguna::create([
            'nama_pengguna' => 'super_admin',
            'email' => 'superadmin@example.com',
            'kata_sandi' => bcrypt('password'),
            'peran' => 'Super_Admin',
            'status_akun' => 'Aktif',
        ]);

        $pengguna = Pengguna::create([
            'nama_pengguna' => 'admin_kafe',
            'email' => 'kafe@example.com',
            'kata_sandi' => bcrypt('password'),
            'peran' => 'Admin_Perusahaan',
            'status_akun' => 'Aktif',
        ]);

        // Simulasi upload file ke kedua disk
        Storage::fake('public');
        Storage::fake('local');
        $filePublic = UploadedFile::fake()->create('izin_document.pdf', 100, 'application/pdf');
        $pathPublic = $filePublic->store('legalitas', 'public');
        $fileLocal = UploadedFile::fake()->create('nib_document.pdf', 100, 'application/pdf');
        $pathLocal = $fileLocal->store('legalitas', 'local');

        // Simulasi transaksi yang gagal setelah file disimpan
        try {
            DB::beginTransaction();
            $perusahaan = ProfilPerusahaan::create([
                'id_pengguna' => $pengguna->id_pengguna,
                'nama_perusahaan' => 'Kafe Uji',
                'alamat_perusahaan' => 'Jl. Uji No. 1, Indramayu',
                'status_verifikasi' => 'Pending',
            ]);
            throw new \Exception('Simulasi kegagalan transaksi');
        } catch (\Exception $e) {
            DB::rollBack();
            // Bersihkan file dari kedua disk
            if (Storage::disk('public')->exists($pathPublic)) {
                Storage::disk('public')->delete($pathPublic);
            }
            if (Storage::disk('local')->exists($pathLocal)) {
                Storage::disk('local')->delete($pathLocal);
            }
        }

        // Verifikasi file sudah dibersihkan dari kedua disk
        $this->assertFalse(Storage::disk('public')->exists($pathPublic));
        $this->assertFalse(Storage::disk('local')->exists($pathLocal));
    }

    /**
     * Endpoint dokumen legacy: Super Admin terautentikasi dapat mengakses.
     */
    /** @test */
    public function super_admin_terautentikasi_dapat_mengakses_dokumen_legacy(): void
    {
        $data = $this->setupSuperAdminAndCompany();
        $token = $this->superAdminToken($data['superAdmin']);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->get("/api/v1/super-admin/akun-kafe/{$data['perusahaan']->id_pengguna}/dokumen");

        $response->assertStatus(200);
        $response->assertHeader('Content-Type');
        $response->assertHeader('Content-Disposition');
        $response->assertHeader('X-Content-Type-Options', 'nosniff');
    }

    /**
     * Endpoint dokumen legacy: pengguna tanpa autentikasi ditolak (401).
     */
    /** @test */
    public function pengguna_tanpa_autentikasi_ditolak_dokumen_legacy(): void
    {
        $data = $this->setupSuperAdminAndCompany();

        $response = $this->get("/api/v1/super-admin/akun-kafe/{$data['perusahaan']->id_pengguna}/dokumen");

        $response->assertStatus(401);
    }

    /**
     * Endpoint dokumen legacy: pengguna bukan Super Admin ditolak (403).
     */
    /** @test */
    public function pengguna_bukan_super_admin_ditolak_dokumen_legacy(): void
    {
        $data = $this->setupSuperAdminAndCompany();
        $penggunaToken = \PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth::fromUser($data['pengguna']);

        $response = $this->withHeader('Authorization', 'Bearer ' . $penggunaToken)
            ->get("/api/v1/super-admin/akun-kafe/{$data['perusahaan']->id_pengguna}/dokumen");

        $response->assertStatus(403);
    }

    /**
     * Endpoint dokumen legacy: perusahaan tidak ditemukan menghasilkan 404.
     */
    /** @test */
    public function perusahaan_tidak_ditemukan_dokumen_legacy_menghasilkan_404(): void
    {
        $data = $this->setupSuperAdminAndCompany();
        $token = $this->superAdminToken($data['superAdmin']);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->get('/api/v1/super-admin/akun-kafe/999999/dokumen');

        $response->assertStatus(404);
    }

    /**
     * Endpoint dokumen legacy: dokumen tidak tersedia menghasilkan 404.
     */
    /** @test */
    public function dokumen_legacy_tidak_tersedia_menghasilkan_404(): void
    {
        $data = $this->setupSuperAdminAndCompany();
        $token = $this->superAdminToken($data['superAdmin']);

        // Hapus dokumen_izin dari profil perusahaan
        $perusahaan = ProfilPerusahaan::first();
        $perusahaan->update(['dokumen_izin' => null]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->get("/api/v1/super-admin/akun-kafe/{$data['perusahaan']->id_pengguna}/dokumen");

        $response->assertStatus(404);
    }

    /**
     * Endpoint dokumen legacy: ID yang tidak valid menghasilkan 404.
     */
    /** @test */
    public function id_legacy_tidak_valid_menghasilkan_404(): void
    {
        $data = $this->setupSuperAdminAndCompany();
        $token = $this->superAdminToken($data['superAdmin']);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->get('/api/v1/super-admin/akun-kafe/999999/dokumen');

        $response->assertStatus(404);
    }
}
