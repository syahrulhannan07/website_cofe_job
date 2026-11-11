<?php

namespace Tests\Feature;

use App\Enums\StatusScreening;
use App\Jobs\ProcessNibScreeningJob;
use App\Models\Nib;
use App\Models\Pengguna;
use App\Models\ProfilPerusahaan;
use App\Services\Nib\NibScreeningResultService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class NibScreeningApiTest extends TestCase
{
    use RefreshDatabase;

    private string $superAdminToken;
    private string $penggunaBukanSuperAdminToken;
    private string $nibId;

    protected function setUp(): void
    {
        parent::setUp();
        $this->assertSame('sqlite', DB::connection()->getDriverName());
        $this->assertSame(':memory:', DB::connection()->getDatabaseName());

        $this->setupUsers();
    }

    private function setupUsers(): void
    {
        // Super Admin
        $superAdmin = Pengguna::create([
            'nama_pengguna' => 'super_admin',
            'email' => 'superadmin@example.com',
            'kata_sandi' => bcrypt('password'),
            'peran' => 'Super_Admin',
            'status_akun' => 'Aktif',
        ]);
        $this->superAdminToken = \PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth::fromUser($superAdmin);

        // Bukan Super Admin (Admin Perusahaan)
        $penggunaBiasa = Pengguna::create([
            'nama_pengguna' => 'admin_kafe',
            'email' => 'kafe@example.com',
            'kata_sandi' => bcrypt('password'),
            'peran' => 'Admin_Perusahaan',
            'status_akun' => 'Aktif',
        ]);
        $this->penggunaBukanSuperAdminToken = \PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth::fromUser($penggunaBiasa);
    }

    private function createNibRecord(?string $statusScreening = null): void
    {
        $pengguna = Pengguna::create([
            'nama_pengguna' => 'admin_kafe_2',
            'email' => 'kafe2@example.com',
            'kata_sandi' => bcrypt('password'),
            'peran' => 'Admin_Perusahaan',
            'status_akun' => 'Aktif',
        ]);

        $profil = ProfilPerusahaan::create([
            'id_pengguna' => $pengguna->id_pengguna,
            'nama_perusahaan' => 'PT Kafe Contoh',
            'alamat_perusahaan' => 'Jl. Contoh No. 1, Indramayu',
            'status_verifikasi' => 'Pending',
        ]);

        $status = $statusScreening ?? StatusScreening::Belum_Diperiksa->value;

        $nib = Nib::create([
            'id_perusahaan' => $profil->id_perusahaan,
            'dokumen_nib' => 'nib/test.pdf',
            'nomor_nib' => null,
            'status_screening' => $status,
        ]);

        $this->nibId = $nib->id_nib;
    }

    private function mockScreeningService(): void
    {
        $mock = \Mockery::mock(NibScreeningResultService::class);
        $mock->shouldReceive('generate')
            ->once()
            ->andReturn([
                'id_nib' => $this->nibId,
                'status_proses' => NibScreeningResultService::STATUS_PROSES_BERHASIL,
                'ringkasan' => [
                    'status_ekstraksi' => 'BERHASIL',
                    'status_analisis' => 'ANALISIS_LENGKAP',
                    'total_field' => 3,
                    'field_ditemukan' => 3,
                    'field_tidak_ditemukan' => 0,
                    'field_ambigu' => 0,
                    'field_invalid' => 0,
                    'persentase_kelengkapan' => 100,
                    'qr_ditemukan' => false,
                    'qr_jenis' => null,
                    'total_temuan' => 1,
                    'temuan_critical' => 0,
                    'temuan_warning' => 0,
                    'total_halaman' => 1,
                    'sumber_ekstraksi' => 'pdf',
                ],
                'data_terekstraksi' => [
                    'fields' => [],
                    'qr' => [],
                    'perbandingan' => [],
                ],
                'analisis_struktur' => [
                    'karakteristik_dokumen' => [],
                    'indikator_struktur' => [],
                    'indikator_konsistensi' => [],
                    'temuan' => [],
                ],
                'indikator_screening' => [],
                'ketidaksesuaian' => [],
                'bukti_pemeriksaan' => [],
                'perlu_review_manual' => false,
                'alasan_review' => null,
                'dihasilkan_pada' => now()->toIso8601String(),
            ]);

        $this->app->instance(NibScreeningResultService::class, $mock);
    }

    /**
     * Test: Super Admin berhasil meminta screening.
     */
    public function test_super_admin_berhasil_meminta_screening(): void
    {
        $this->createNibRecord();

        Queue::fake();

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->post("/api/v1/super-admin/nib/{$this->nibId}/screening");

        $response->assertStatus(202);
        $response->assertJson([
            'status' => 'success',
            'message' => 'Permintaan screening NIB telah diterima dan diproses melalui antrian.',
        ]);

        // Verifikasi job telah di-dispatch ke queue
        $nibId = $this->nibId;
        Queue::assertPushed(ProcessNibScreeningJob::class, function ($job) use ($nibId) {
            return $job->id_nib === $nibId;
        });
    }

    /**
     * Test: Permintaan dispatch Job ke queue.
     */
    public function test_permintaan_dispatch_job_ke_queue(): void
    {
        $this->createNibRecord();

        Queue::fake();

        $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->post("/api/v1/super-admin/nib/{$this->nibId}/screening");

        Queue::assertPushed(ProcessNibScreeningJob::class);
    }

    /**
     * Test: Pengguna tanpa autentikasi ditolak.
     */
    public function test_pengguna_tanpa_autentikasi_ditolak(): void
    {
        $this->createNibRecord();

        $response = $this->post("/api/v1/super-admin/nib/{$this->nibId}/screening");

        $response->assertStatus(401);
    }

    /**
     * Test: Pengguna non-Super Admin ditolak.
     */
    public function test_pengguna_non_super_admin_ditolak(): void
    {
        $this->createNibRecord();

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->penggunaBukanSuperAdminToken)
            ->post("/api/v1/super-admin/nib/{$this->nibId}/screening");

        $response->assertStatus(403);
    }

    /**
     * Test: ID NIB tidak ditemukan.
     */
    public function test_id_nib_tidak_ditemukan(): void
    {
        Queue::fake();

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->post('/api/v1/super-admin/nib/non-existent-id/screening');

        $response->assertStatus(404);
        $response->assertJson([
            'status' => 'error',
            'message' => 'NIB tidak ditemukan.',
        ]);
    }

    /**
     * Test: Super Admin berhasil mengambil hasil screening.
     */
    public function test_super_admin_berhasil_mengambil_hasil_screening(): void
    {
        $this->createNibRecord();

        // Simpan hasil screening sebelumnya
        $nib = Nib::find($this->nibId);
        $hasilScreening = [
            'id_nib' => $this->nibId,
            'status_proses' => NibScreeningResultService::STATUS_PROSES_BERHASIL,
            'ringkasan' => ['status_ekstraksi' => 'BERHASIL', 'field_ditemukan' => 3],
            'perlu_review_manual' => false,
            'alasan_review' => null,
            'dihasilkan_pada' => now()->toIso8601String(),
        ];
        $nib->update([
            'hasil_screening' => json_encode($hasilScreening, JSON_UNESCAPED_UNICODE),
            'diperiksa_pada' => now(),
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->get("/api/v1/super-admin/nib/{$this->nibId}/screening");

        $response->assertStatus(200);
        $response->assertJson([
            'status' => 'success',
            'message' => 'Hasil screening berhasil diambil.',
        ]);
        $response->assertJsonStructure([
            'data' => [
                'id_nib',
                'hasil_screening',
                'status_screening',
                'diperiksa_pada',
            ],
        ]);

        // Verifikasi hasil_screening adalah objek, bukan string JSON ganda
        $data = $response->json('data');
        $this->assertIsArray($data['hasil_screening']);
        $this->assertSame(NibScreeningResultService::STATUS_PROSES_BERHASIL, $data['hasil_screening']['status_proses']);
        $this->assertSame(StatusScreening::Belum_Diperiksa->value, $data['status_screening']);
    }

    /**
     * Test: Hasil screening belum tersedia.
     */
    public function test_hasil_screening_belum_tersedia(): void
    {
        $this->createNibRecord();

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->get("/api/v1/super-admin/nib/{$this->nibId}/screening");

        $response->assertStatus(200);
        $response->assertJson([
            'status' => 'success',
            'message' => 'Hasil screening belum tersedia.',
        ]);
        $response->assertJsonStructure([
            'data' => [
                'id_nib',
                'hasil_screening',
                'status_screening',
                'diperiksa_pada',
                'catatan',
            ],
        ]);

        $this->assertNull($response->json('data.hasil_screening'));
    }

    /**
     * Test: Hasil JSON dikembalikan sebagai objek/struktur, bukan JSON string ganda.
     */
    public function test_hasil_json_dikembalikan_sebagai_objek(): void
    {
        $this->createNibRecord();

        $nib = Nib::find($this->nibId);
        $hasilScreening = [
            'id_nib' => $this->nibId,
            'status_proses' => NibScreeningResultService::STATUS_PROSES_BERHASIL_DENGAN_PERINGATAN,
            'ringkasan' => [
                'status_ekstraksi' => 'BERHASIL',
                'field_ditemukan' => 2,
                'field_tidak_ditemukan' => 1,
            ],
            'perlu_review_manual' => true,
            'alasan_review' => 'Beberapa informasi tidak lengkap.',
            'dihasilkan_pada' => now()->toIso8601String(),
        ];
        $nib->update([
            'hasil_screening' => json_encode($hasilScreening, JSON_UNESCAPED_UNICODE),
            'diperiksa_pada' => now(),
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->get("/api/v1/super-admin/nib/{$this->nibId}/screening");

        $response->assertStatus(200);

        $data = $response->json('data');
        // hasil_screening harus berupa array/objek, bukan string
        $this->assertIsArray($data['hasil_screening']);
        $this->assertSame(NibScreeningResultService::STATUS_PROSES_BERHASIL_DENGAN_PERINGATAN, $data['hasil_screening']['status_proses']);
        $this->assertTrue($data['hasil_screening']['perlu_review_manual']);

        // Memastikan tidak ada double encoding (string JSON di dalam string JSON)
        $this->assertNotTrue(is_string($data['hasil_screening']));
    }

    /**
     * Test: GET tidak memicu Job.
     */
    public function test_get_tidak_memicu_job(): void
    {
        $this->createNibRecord();

        Queue::fake();

        $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->get("/api/v1/super-admin/nib/{$this->nibId}/screening");

        Queue::assertNothingPushed();
    }

    /**
     * Test: Screening ulang tidak menghapus hasil lama.
     */
    public function test_screening_ulang_tidak_menghapus_hasil_lama(): void
    {
        $this->createNibRecord();

        // Simpan hasil berhasil sebelumnya
        $nib = Nib::find($this->nibId);
        $hasilLama = [
            'id_nib' => $this->nibId,
            'status_proses' => NibScreeningResultService::STATUS_PROSES_BERHASIL,
            'ringkasan' => ['status_ekstraksi' => 'BERHASIL', 'field_ditemukan' => 1],
            'perlu_review_manual' => false,
            'alasan_review' => null,
            'dihasilkan_pada' => now()->subHours(1)->toIso8601String(),
        ];
        $nib->update([
            'hasil_screening' => json_encode($hasilLama, JSON_UNESCAPED_UNICODE),
            'diperiksa_pada' => now()->subHours(1),
        ]);

        Queue::fake();

        // Panggil screening ulang
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->post("/api/v1/super-admin/nib/{$this->nibId}/screening/ulang");

        $response->assertStatus(202);

        // Job harus di-dispatch
        Queue::assertPushed(ProcessNibScreeningJob::class);

        // Hasil lama masih ada di database (job belum dieksekusi dalam test ini)
        $nibBaru = Nib::find($this->nibId);
        $hasilScreening = json_decode($nibBaru->hasil_screening, true);
        $this->assertSame(NibScreeningResultService::STATUS_PROSES_BERHASIL, $hasilScreening['status_proses']);
        $this->assertSame(1, $hasilScreening['ringkasan']['field_ditemukan']);
    }

    /**
     * Test: Request screening berulang tidak menghasilkan pemrosesan paralel.
     * Karena job menggunakan ShouldBeUnique dengan uniqueId berbasis id_nib,
     * dan controller mencegah request duplikat saat status Menunggu/Sedang_Diproses.
     */
    public function test_request_screening_berulang_tidak_parallel(): void
    {
        $this->createNibRecord();

        Queue::fake();

        // Kirim dua request screening untuk NIB yang sama
        $response1 = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->post("/api/v1/super-admin/nib/{$this->nibId}/screening");

        // Request kedua harus ditolak karena screening sudah Menunggu
        $response2 = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->post("/api/v1/super-admin/nib/{$this->nibId}/screening");

        $response1->assertStatus(202);
        $response2->assertStatus(409);
        $response2->assertJsonPath('message', 'Screening sedang berjalan. Tunggu hingga selesai.');

        // Kedua job memiliki uniqueId yang sama (jika keduanya berhasil di-dispatch)
        $job1 = new ProcessNibScreeningJob($this->nibId);
        $job2 = new ProcessNibScreeningJob($this->nibId);
        $this->assertSame($job1->uniqueId(), $job2->uniqueId());
        $this->assertSame('nib-screening:' . $this->nibId, $job1->uniqueId());
    }

    /**
     * Test: Metadata status_screening dan diperiksa_pada dikembalikan secara terpisah.
     */
    public function test_metadata_status_dan_diperiksa_pada_dikembalikan(): void
    {
        $this->createNibRecord();

        $nib = Nib::find($this->nibId);
        $tanggalSekarang = now();
        $nib->update([
            'hasil_screening' => json_encode([
                'status_proses' => NibScreeningResultService::STATUS_PROSES_BERHASIL,
                'ringkasan' => ['status_ekstraksi' => 'BERHASIL'],
            ], JSON_UNESCAPED_UNICODE),
            'diperiksa_pada' => $tanggalSekarang,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->get("/api/v1/super-admin/nib/{$this->nibId}/screening");

        $response->assertStatus(200);

        $data = $response->json('data');
        $this->assertSame(StatusScreening::Belum_Diperiksa->value, $data['status_screening']);
        $this->assertNotNull($data['diperiksa_pada']);
    }

    /**
     * Test: Super Admin berhasil mengambil hasil screening yang belum ada (GET pada NIB tanpa hasil).
     */
    public function test_get_hasil_screening_tanpa_hasil(): void
    {
        $this->createNibRecord();

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->get("/api/v1/super-admin/nib/{$this->nibId}/screening");

        $response->assertStatus(200);
        $response->assertJson([
            'status' => 'success',
            'message' => 'Hasil screening belum tersedia.',
        ]);
        $this->assertNull($response->json('data.hasil_screening'));
        $this->assertNull($response->json('data.diperiksa_pada'));
    }

    /**
     * Test: Screening ulang dengan ID NIB tidak ditemukan.
     */
    public function test_screening_ulang_id_nib_tidak_ditemukan(): void
    {
        Queue::fake();

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->post('/api/v1/super-admin/nib/non-existent-id/screening/ulang');

        $response->assertStatus(404);
        Queue::assertNothingPushed();
    }

    /**
     * Test: Response screening menyertakan status_proses_screening.
     */
    public function test_response_screening_menyertakan_status_proses_screening(): void
    {
        $this->createNibRecord();

        Queue::fake();

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->post("/api/v1/super-admin/nib/{$this->nibId}/screening");

        $response->assertStatus(202);
        $response->assertJsonPath('data.status_proses_screening', 'Menunggu');
        $response->assertJsonPath('data.id_nib', $this->nibId);

        // Verifikasi di database
        $nib = Nib::find($this->nibId);
        $this->assertSame('Menunggu', $nib->status_proses_screening);
    }

    /**
     * Test: Response GET hasil menyertakan status_proses_screening.
     */
    public function test_response_get_hasil_menyertakan_status_proses_screening(): void
    {
        $this->createNibRecord();

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->get("/api/v1/super-admin/nib/{$this->nibId}/screening");

        $response->assertStatus(200);
        $response->assertJsonPath('data.status_proses_screening', 'Belum_Dimulai');
    }

    /**
     * Test: Screening ulang response menyertakan status_proses_screening.
     */
    public function test_response_screening_ulang_menyertakan_status_proses(): void
    {
        $this->createNibRecord();

        Queue::fake();

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->post("/api/v1/super-admin/nib/{$this->nibId}/screening/ulang");

        $response->assertStatus(202);
        $response->assertJsonPath('data.status_proses_screening', 'Menunggu');
    }

    /**
     * Test: Kedua screening bersamaan untuk NIB yang sama ditolak (409).
     */
    public function test_kedua_screening_bersamaan_ditolak_409(): void
    {
        $this->createNibRecord();

        // Pertama-tama set status Menunggu (simulasi setelah dispatch pertama)
        $nib = Nib::find($this->nibId);
        $nib->update(['status_proses_screening' => 'Menunggu']);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->post("/api/v1/super-admin/nib/{$this->nibId}/screening");

        $response->assertStatus(409);
        $response->assertJsonPath('message', 'Screening sedang berjalan. Tunggu hingga selesai.');
    }
}
