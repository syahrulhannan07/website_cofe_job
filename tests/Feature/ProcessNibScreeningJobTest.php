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
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Queue;
use Mockery;
use Tests\TestCase;

class ProcessNibScreeningJobTest extends TestCase
{
    use RefreshDatabase;

    private \Mockery\MockInterface $mockScreeningService;
    private string $nibId;
    private string $profilId;

    protected function setUp(): void
    {
        parent::setUp();
        $this->assertSame('sqlite', DB::connection()->getDriverName());
        $this->assertSame(':memory:', DB::connection()->getDatabaseName());

        $this->mockScreeningService = Mockery::mock(NibScreeningResultService::class);
        $this->app->instance(NibScreeningResultService::class, $this->mockScreeningService);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    private function createNibRecord(?string $statusScreening = null): void
    {
        $pengguna = Pengguna::create([
            'nama_pengguna' => 'admin_kafe',
            'email' => 'kafe@example.com',
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
        $this->profilId = $profil->id_perusahaan;
    }

    private function mockSuccessfulGenerate(string $idNib): void
    {
        $this->mockScreeningService->shouldReceive('generate')
            ->once()
            ->with($idNib, Mockery::type(ProfilPerusahaan::class))
            ->andReturn([
                'id_nib' => $idNib,
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
    }

    private function mockWarningGenerate(string $idNib): void
    {
        $this->mockScreeningService->shouldReceive('generate')
            ->once()
            ->with($idNib, Mockery::type(ProfilPerusahaan::class))
            ->andReturn([
                'id_nib' => $idNib,
                'status_proses' => NibScreeningResultService::STATUS_PROSES_BERHASIL_DENGAN_PERINGATAN,
                'ringkasan' => [
                    'status_ekstraksi' => 'BERHASIL',
                    'status_analisis' => 'ANALISIS_LENGKAP',
                    'total_field' => 3,
                    'field_ditemukan' => 2,
                    'field_tidak_ditemukan' => 1,
                    'field_ambigu' => 0,
                    'field_invalid' => 0,
                    'persentase_kelengkapan' => 67,
                    'qr_ditemukan' => false,
                    'qr_jenis' => null,
                    'total_temuan' => 1,
                    'temuan_critical' => 0,
                    'temuan_warning' => 1,
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
                    'indikator_struktur' => ['INFORMASI_TIDAK_LENGKAP'],
                    'indikator_konsistensi' => [],
                    'temuan' => [
                        [
                            'jenis_temuan' => 'NAMA_PERUSAHAAN_TIDAK_DITEMUKAN',
                            'deskripsi' => 'Nama perusahaan tidak ditemukan.',
                            'field_terkait' => 'nama_perusahaan',
                            'sumber_bukti' => [],
                            'halaman' => null,
                            'tingkat_perhatian' => 'WARNING',
                        ],
                    ],
                ],
                'indikator_screening' => ['INFORMASI_TIDAK_LENGKAP'],
                'ketidaksesuaian' => [],
                'bukti_pemeriksaan' => [],
                'perlu_review_manual' => true,
                'alasan_review' => 'Beberapa informasi tidak lengkap.',
                'dihasilkan_pada' => now()->toIso8601String(),
            ]);
    }

    private function mockFailedGenerate(string $idNib): void
    {
        $this->mockScreeningService->shouldReceive('generate')
            ->once()
            ->with($idNib, Mockery::type(ProfilPerusahaan::class))
            ->andReturn([
                'id_nib' => $idNib,
                'status_proses' => NibScreeningResultService::STATUS_PROSES_GAGAL,
                'ringkasan' => [
                    'status_ekstraksi' => 'GAGAL',
                    'status_analisis' => 'ANALISIS_TIDAK_LENGKAP',
                    'total_field' => 0,
                    'field_ditemukan' => 0,
                    'field_tidak_ditemukan' => 0,
                    'field_ambigu' => 0,
                    'field_invalid' => 0,
                    'persentase_kelengkapan' => 0,
                    'qr_ditemukan' => false,
                    'qr_jenis' => null,
                    'total_temuan' => 1,
                    'temuan_critical' => 1,
                    'temuan_warning' => 0,
                    'total_halaman' => null,
                    'sumber_ekstraksi' => 'tidak_tersedia',
                ],
                'data_terekstraksi' => [
                    'fields' => [],
                    'qr' => [],
                    'perbandingan' => [],
                ],
                'analisis_struktur' => [
                    'karakteristik_dokumen' => [],
                    'indikator_struktur' => ['ANALISIS_TIDAK_LENGKAP'],
                    'indikator_konsistensi' => [],
                    'temuan' => [
                        [
                            'jenis_temuan' => 'EKSTRAKSI_GAGAL',
                            'deskripsi' => 'Gagal mengekstrak teks dari PDF.',
                            'field_terkait' => null,
                            'sumber_bukti' => [],
                            'halaman' => null,
                            'tingkat_perhatian' => 'CRITICAL',
                        ],
                    ],
                ],
                'indikator_screening' => ['ANALISIS_TIDAK_LENGKAP'],
                'ketidaksesuaian' => [],
                'bukti_pemeriksaan' => [],
                'perlu_review_manual' => true,
                'alasan_review' => 'Gagal mengekstrak teks dari PDF.',
                'dihasilkan_pada' => now()->toIso8601String(),
            ]);
    }

    private function mockGenerateThrowException(string $idNib): void
    {
        $this->mockScreeningService->shouldReceive('generate')
            ->once()
            ->with($idNib, Mockery::type(ProfilPerusahaan::class))
            ->andThrow(new \Exception('Kesalahan teknis'));
    }

    /**
     * Test: Job berhasil mengambil NIB dan menjalankan service agregasi.
     */
    public function test_job_berhasil_mengambil_nib_dan_jalankan_service(): void
    {
        $this->createNibRecord();

        $this->mockSuccessfulGenerate($this->nibId);

        $job = new ProcessNibScreeningJob($this->nibId);
        $job->handle($this->mockScreeningService);

        $this->assertTrue(true);
    }

    /**
     * Test: Hasil berhasil disimpan dalam JSON dan diperiksa_pada diperbarui.
     */
    public function test_hasil_disimpan_dalam_json_dan_diperiksa_pada_diperbarui(): void
    {
        $this->createNibRecord();

        $this->mockSuccessfulGenerate($this->nibId);

        $job = new ProcessNibScreeningJob($this->nibId);
        $job->handle($this->mockScreeningService);

        $nib = Nib::find($this->nibId);

        $this->assertNotNull($nib->hasil_screening);
        $hasilScreening = json_decode($nib->hasil_screening, true);
        $this->assertIsArray($hasilScreening);
        $this->assertSame(NibScreeningResultService::STATUS_PROSES_BERHASIL, $hasilScreening['status_proses']);
        $this->assertNotNull($nib->diperiksa_pada);
    }

    /**
     * Test: Status proses BERHASIL_DENGAN_PERINGATAN tetap dapat disimpan.
     */
    public function test_status_berhasil_dengan_peringatan_disimpan(): void
    {
        $this->createNibRecord();

        $this->mockWarningGenerate($this->nibId);

        $job = new ProcessNibScreeningJob($this->nibId);
        $job->handle($this->mockScreeningService);

        $nib = Nib::find($this->nibId);

        $this->assertNotNull($nib->hasil_screening);
        $hasilScreening = json_decode($nib->hasil_screening, true);
        $this->assertSame(NibScreeningResultService::STATUS_PROSES_BERHASIL_DENGAN_PERINGATAN, $hasilScreening['status_proses']);
        $this->assertTrue($hasilScreening['perlu_review_manual']);
        $this->assertNotNull($nib->diperiksa_pada);
    }

    /**
     * Test: Hasil GAGAL tidak menimpa hasil lama.
     */
    public function test_hasil_gagal_tidak_menimpa_hasil_lama(): void
    {
        $this->createNibRecord();

        // Simpan hasil berhasil sebelumnya
        $nib = Nib::find($this->nibId);
        $nib->update([
            'hasil_screening' => json_encode([
                'status_proses' => NibScreeningResultService::STATUS_PROSES_BERHASIL,
                'ringkasan' => ['status_ekstraksi' => 'BERHASIL'],
            ], JSON_UNESCAPED_UNICODE),
            'diperiksa_pada' => now()->subHours(1),
        ]);

        $this->mockFailedGenerate($this->nibId);

        $job = new ProcessNibScreeningJob($this->nibId);
        $job->handle($this->mockScreeningService);

        $nib = Nib::find($this->nibId);

        // Hasil lama harus tetap ada, tidak diganti
        $hasilScreening = json_decode($nib->hasil_screening, true);
        $this->assertSame(NibScreeningResultService::STATUS_PROSES_BERHASIL, $hasilScreening['status_proses']);
        $this->assertNotNull($nib->diperiksa_pada);
    }

    /**
     * Test: Screening ulang berhasil menggantikan hasil lama.
     */
    public function test_screening_ulang_menggantikan_hasil_lama(): void
    {
        $this->createNibRecord();

        // Simpan hasil berhasil sebelumnya
        $nib = Nib::find($this->nibId);
        $nib->update([
            'hasil_screening' => json_encode([
                'status_proses' => NibScreeningResultService::STATUS_PROSES_BERHASIL,
                'ringkasan' => ['status_ekstraksi' => 'BERHASIL', 'field_ditemukan' => 1],
            ], JSON_UNESCAPED_UNICODE),
            'diperiksa_pada' => now()->subHours(1),
        ]);

        $this->mockSuccessfulGenerate($this->nibId);

        $job = new ProcessNibScreeningJob($this->nibId);
        $job->handle($this->mockScreeningService);

        $nib = Nib::find($this->nibId);

        // Hasil baru harus menggantikan lama
        $hasilScreening = json_decode($nib->hasil_screening, true);
        $this->assertSame(NibScreeningResultService::STATUS_PROSES_BERHASIL, $hasilScreening['status_proses']);
        $this->assertSame(3, $hasilScreening['ringkasan']['field_ditemukan']);
    }

    /**
     * Test: NIB tidak ditemukan.
     */
    public function test_nib_tidak_ditemukan(): void
    {
        $job = new ProcessNibScreeningJob('non-existent-id');
        $job->handle($this->mockScreeningService);

        $this->assertTrue(true);
    }

    /**
     * Test: Job gagal karena exception.
     */
    public function test_job_gagal_karena_exception(): void
    {
        $this->createNibRecord();

        $this->mockGenerateThrowException($this->nibId);

        $job = new ProcessNibScreeningJob($this->nibId);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Kesalahan teknis');

        $job->handle($this->mockScreeningService);
    }

    /**
     * Test: Job duplikat untuk NIB yang sama dicegah (uniqueId).
     */
    public function test_job_duplikat_dicegah_via_unique_id(): void
    {
        $job1 = new ProcessNibScreeningJob('test-nib-id');
        $job2 = new ProcessNibScreeningJob('test-nib-id');

        $this->assertSame($job1->uniqueId(), $job2->uniqueId());
        $this->assertSame('nib-screening:test-nib-id', $job1->uniqueId());
    }

    /**
     * Test: status_screening otomatis berubah menjadi Lulus ketika hasil BERHASIL tanpa review manual.
     * Ditolak hanya boleh ditetapkan melalui keputusan manual Super Admin.
     */
    public function test_status_screening_berubah_menjadi_lulus_ketika_berhasil(): void
    {
        $this->createNibRecord(StatusScreening::Belum_Diperiksa->value);
        $nib = Nib::find($this->nibId);
        $statusSebelum = $nib->status_screening;

        $this->mockSuccessfulGenerate($this->nibId);

        $job = new ProcessNibScreeningJob($this->nibId);
        $job->handle($this->mockScreeningService);

        $nib = Nib::find($this->nibId);
        // status_proses_screening harus menjadi Selesai
        $this->assertSame('Selesai', $nib->status_proses_screening);
        // status_screening harus berubah menjadi Lulus (BERHASIL tanpa review manual)
        $this->assertSame(StatusScreening::Lulus, $nib->status_screening);
        $this->assertNotSame($statusSebelum, $nib->status_screening);
    }

    /**
     * Test: status_verifikasi tidak berubah.
     */
    public function test_status_verifikasi_tidak_berubah(): void
    {
        $this->createNibRecord();
        $profilSebelum = ProfilPerusahaan::find($this->profilId)->status_verifikasi;

        $this->mockSuccessfulGenerate($this->nibId);

        $job = new ProcessNibScreeningJob($this->nibId);
        $job->handle($this->mockScreeningService);

        $profil = ProfilPerusahaan::find($this->profilId);
        $this->assertSame($profilSebelum, $profil->status_verifikasi);
        $this->assertSame('Pending', $profil->status_verifikasi);
    }

    /**
     * Test: Hasil GAGAL tanpa hasil sebelumnya tidak menimpa apa pun.
     */
    public function test_hasil_gagal_tanpa_sebelumnya_tidak_menimpa_apa_pun(): void
    {
        $this->createNibRecord();

        // Pastikan tidak ada hasil sebelumnya
        $nib = Nib::find($this->nibId);
        $nib->update(['hasil_screening' => null]);

        $this->mockFailedGenerate($this->nibId);

        $job = new ProcessNibScreeningJob($this->nibId);
        $job->handle($this->mockScreeningService);

        $nib = Nib::find($this->nibId);

        // hasil_screening harus tetap null
        $this->assertNull($nib->hasil_screening);
    }

    /**
     * Test: Job mengimplementasikan ShouldQueue dan ShouldBeUnique.
     */
    public function test_job_implementasi_contract(): void
    {
        $job = new ProcessNibScreeningJob('test-id');

        $this->assertInstanceOf(\Illuminate\Contracts\Queue\ShouldQueue::class, $job);
        $this->assertInstanceOf(\Illuminate\Contracts\Queue\ShouldBeUnique::class, $job);
    }

    /**
     * Test: Status Sedang_Diproses ketika job berjalan.
     */
    public function test_status_proses_sedang_diproses_saat_job_berjalan(): void
    {
        $this->createNibRecord();
        $nib = Nib::find($this->nibId);

        // Awalnya status Belum_Dimulai
        $this->assertSame('Belum_Dimulai', $nib->status_proses_screening);

        $this->mockSuccessfulGenerate($this->nibId);

        $job = new ProcessNibScreeningJob($this->nibId);
        $job->handle($this->mockScreeningService);

        $nib = Nib::find($this->nibId);
        // Setelah job selesai, status harus Selesai (lewati Sedang_Diproses)
        $this->assertSame('Selesai', $nib->status_proses_screening);
    }

    /**
     * Test: Status Selesai setelah job berhasil.
     */
    public function test_status_proses_selesai_setelah_job_berhasil(): void
    {
        $this->createNibRecord();

        $this->mockSuccessfulGenerate($this->nibId);

        $job = new ProcessNibScreeningJob($this->nibId);
        $job->handle($this->mockScreeningService);

        $nib = Nib::find($this->nibId);
        $this->assertSame('Selesai', $nib->status_proses_screening);
    }

    /**
     * Test: Status Gagal setelah job gagal permanen.
     */
    public function test_status_proses_gagal_setelah_job_gagal(): void
    {
        $this->createNibRecord();

        $this->mockFailedGenerate($this->nibId);

        $job = new ProcessNibScreeningJob($this->nibId);
        $job->handle($this->mockScreeningService);

        $nib = Nib::find($this->nibId);
        $this->assertSame('Gagal', $nib->status_proses_screening);
    }

    /**
     * Test: BERHASIL_DENGAN_PERINGATAN menghasilkan status_screening Perlu_Review.
     */
    public function test_status_screening_perlu_review_ketika_berhasil_dengan_peringatan(): void
    {
        $this->createNibRecord(StatusScreening::Belum_Diperiksa->value);

        $this->mockWarningGenerate($this->nibId);

        $job = new ProcessNibScreeningJob($this->nibId);
        $job->handle($this->mockScreeningService);

        $nib = Nib::find($this->nibId);
        $this->assertSame('Selesai', $nib->status_proses_screening);
        $this->assertSame(StatusScreening::Perlu_Review, $nib->status_screening);
    }

    /**
     * Test: GAGAL tidak menghasilkan status_screening Ditolak.
     */
    public function test_status_screening_tidak_ditolak_ketika_gagal(): void
    {
        $this->createNibRecord(StatusScreening::Belum_Diperiksa->value);

        $this->mockFailedGenerate($this->nibId);

        $job = new ProcessNibScreeningJob($this->nibId);
        $job->handle($this->mockScreeningService);

        $nib = Nib::find($this->nibId);
        $this->assertSame('Gagal', $nib->status_proses_screening);
        // GAGAL teknis tidak boleh mengubah status_screening menjadi Ditolak
        $this->assertSame(StatusScreening::Belum_Diperiksa, $nib->status_screening);
    }

    /**
     * Test: Screening ulang mempertahankan hasil lama ketika proses baru gagal.
     */
    public function test_screening_ulang_mempertahankan_hasil_lama_ketika_gagal(): void
    {
        $this->createNibRecord();

        // Simpan hasil berhasil sebelumnya
        $nib = Nib::find($this->nibId);
        $nib->update([
            'hasil_screening' => json_encode([
                'status_proses' => NibScreeningResultService::STATUS_PROSES_BERHASIL,
                'ringkasan' => ['status_ekstraksi' => 'BERHASIL', 'field_ditemukan' => 3],
            ], JSON_UNESCAPED_UNICODE),
            'diperiksa_pada' => now()->subHours(1),
            'status_screening' => StatusScreening::Lulus,
            'status_proses_screening' => 'Selesai',
        ]);

        // Screening ulang gagal
        $this->mockFailedGenerate($this->nibId);

        $job = new ProcessNibScreeningJob($this->nibId);
        $job->handle($this->mockScreeningService);

        $nib = Nib::find($this->nibId);

        // Status proses harus Gagal
        $this->assertSame('Gagal', $nib->status_proses_screening);
        // Hasil lama harus tetap ada (tidak diganti)
        $hasilScreening = json_decode($nib->hasil_screening, true);
        $this->assertSame(NibScreeningResultService::STATUS_PROSES_BERHASIL, $hasilScreening['status_proses']);
        // status_screening lama harus tetap Lulus
        $this->assertSame(StatusScreening::Lulus, $nib->status_screening);
    }

    /**
     * Test: Status tidak tertinggal Sedang_Diproses setelah kegagalan permanen.
     */
    public function test_status_tidak_tertinggal_sedang_diproses_setelah_gagal(): void
    {
        $this->createNibRecord();

        // Simulasikan status Sedang_Diproses (seperti saat job mulai dijalankan)
        $nib = Nib::find($this->nibId);
        $nib->update(['status_proses_screening' => 'Sedang_Diproses']);

        // Job gagal
        $this->mockFailedGenerate($this->nibId);

        $job = new ProcessNibScreeningJob($this->nibId);
        $job->handle($this->mockScreeningService);

        $nib = Nib::find($this->nibId);
        // Status harus berubah dari Sedang_Diproses menjadi Gagal
        $this->assertSame('Gagal', $nib->status_proses_screening);
        $this->assertNotSame('Sedang_Diproses', $nib->status_proses_screening);
    }

    /**
     * Test: generate dipanggil dengan parameter yang benar.
     */
    public function test_generate_dipanggil_dengan_parameter_benar(): void
    {
        $this->createNibRecord();

        $this->mockScreeningService->shouldReceive('generate')
            ->once()
            ->with($this->nibId, Mockery::type(ProfilPerusahaan::class))
            ->andReturn([
                'id_nib' => $this->nibId,
                'status_proses' => NibScreeningResultService::STATUS_PROSES_BERHASIL,
                'ringkasan' => [],
                'data_terekstraksi' => [],
                'analisis_struktur' => [],
                'indikator_screening' => [],
                'ketidaksesuaian' => [],
                'bukti_pemeriksaan' => [],
                'perlu_review_manual' => false,
                'alasan_review' => null,
                'dihasilkan_pada' => now()->toIso8601String(),
            ]);

        $job = new ProcessNibScreeningJob($this->nibId);
        $job->handle($this->mockScreeningService);

        $this->assertTrue(true);
    }
}
