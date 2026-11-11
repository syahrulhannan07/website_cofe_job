<?php

namespace Tests\Feature;

use App\Services\Nib\NibDataExtractorService;
use App\Services\Nib\NibDocumentStructureAnalyzerService;
use App\Services\Nib\NibScreeningResultService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Mockery;
use Tests\TestCase;

class NibScreeningResultTest extends TestCase
{
    use RefreshDatabase;

    private NibScreeningResultService $service;
    private \Mockery\MockInterface $mockDataExtractor;
    private \Mockery\MockInterface $mockStructureAnalyzer;

    private string $testNibId;

    protected function setUp(): void
    {
        parent::setUp();
        $this->assertSame('sqlite', DB::connection()->getDriverName());
        $this->assertSame(':memory:', DB::connection()->getDatabaseName());
        Storage::fake('public');
        Storage::fake('local');

        $this->mockDataExtractor = Mockery::mock(NibDataExtractorService::class);
        $this->mockStructureAnalyzer = Mockery::mock(NibDocumentStructureAnalyzerService::class);

        $this->service = new NibScreeningResultService(
            $this->mockDataExtractor,
            $this->mockStructureAnalyzer
        );

        $this->createNibRecord();
    }

    protected function tearDown(): void
    {
        parent::tearDown();
        Mockery::close();
    }

    private function createNibRecord(): void
    {
        $pengguna = \App\Models\Pengguna::create([
            'nama_pengguna' => 'admin_kafe',
            'email' => 'kafe@example.com',
            'kata_sandi' => bcrypt('password'),
            'peran' => 'Admin_Perusahaan',
            'status_akun' => 'Aktif',
        ]);

        $profil = \App\Models\ProfilPerusahaan::create([
            'id_pengguna' => $pengguna->id_pengguna,
            'nama_perusahaan' => 'PT Kafe Contoh',
            'alamat_perusahaan' => 'Jl. Contoh No. 1, Indramayu',
            'status_verifikasi' => 'Pending',
        ]);

        $nib = \App\Models\Nib::create([
            'id_perusahaan' => $profil->id_perusahaan,
            'dokumen_nib' => 'nib/test.pdf',
            'nomor_nib' => null,
            'status_screening' => \App\Enums\StatusScreening::Belum_Diperiksa,
        ]);

        $this->testNibId = $nib->id_nib;
    }

    /**
     * Test: Ekstraksi dan analisis berhasil.
     */
    public function test_ekstraksi_dan_analisis_berhasil(): void
    {
        $this->mockDataExtractor->shouldReceive('extract')->once()->andReturn([
            'status_ekstraksi' => 'BERHASIL',
            'dokumen' => [
                'id_nib' => $this->testNibId,
                'total_halaman' => 1,
                'sumber_teks' => 'pdf',
            ],
            'fields' => [
                [
                    'nama_field' => 'nomor_nib',
                    'status' => 'FIELD_FOUND',
                    'normalized_value' => '1234567890123',
                    'validasi' => ['status' => 'VALID', 'reason' => null],
                    'bukti' => [
                        ['sumber' => 'teks', 'raw_value' => '1234567890123', 'normalized_value' => '1234567890123', 'halaman' => 1, 'bukti_teks' => 'NIB: 1234567890123'],
                    ],
                    'nilai_alternatif' => [],
                    'catatan' => null,
                ],
                [
                    'nama_field' => 'nama_perusahaan',
                    'status' => 'FIELD_FOUND',
                    'normalized_value' => 'PT Kafe Contoh',
                    'validasi' => ['status' => 'VALID', 'reason' => null],
                    'bukti' => [],
                    'nilai_alternatif' => [],
                    'catatan' => null,
                ],
                [
                    'nama_field' => 'alamat_perusahaan',
                    'status' => 'FIELD_FOUND',
                    'normalized_value' => 'Jl. Contoh No. 1',
                    'validasi' => ['status' => 'VALID', 'reason' => null],
                    'bukti' => [],
                    'nilai_alternatif' => [],
                    'catatan' => null,
                ],
            ],
            'qr' => [
                'ditemukan' => false,
                'konten' => null,
                'jenis' => null,
                'url_validasi' => null,
            ],
            'perbandingan' => [
                'field_dibandingkan' => ['nomor_nib', 'nama_perusahaan', 'alamat_perusahaan'],
                'indikator_kemiripan' => null,
                'ketidaksesuaian' => [],
                'field_tidak_dapat_dibandingkan' => [],
            ],
            'perlu_review_manual' => false,
            'alasan_review' => null,
        ]);

        $this->mockStructureAnalyzer->shouldReceive('analyze')->once()->andReturn([
            'status_analisis' => 'ANALISIS_LENGKAP',
            'karakteristik_dokumen' => [
                'id_nib' => $this->testNibId,
                'total_halaman' => 1,
                'halaman_dengan_teks' => 1,
                'halaman_kosong' => 0,
                'halaman_detail' => [],
                'qr_ditemukan' => false,
                'sumber_ekstraksi' => 'pdf',
                'status_ekstraksi_asli' => 'BERHASIL',
            ],
            'indikator_struktur' => ['INFORMASI_LENGKAP'],
            'indikator_konsistensi' => [],
            'temuan' => [
                [
                    'jenis_temuan' => 'NIB_DITEMUKAN',
                    'deskripsi' => 'Nomor NIB berhasil diekstrak.',
                    'field_terkait' => 'nomor_nib',
                    'sumber_bukti' => ['teks'],
                    'halaman' => 1,
                    'tingkat_perhatian' => 'INFO',
                ],
            ],
            'perlu_review_manual' => false,
            'alasan_review' => null,
        ]);

        $result = $this->service->generate($this->testNibId);

        $this->assertEquals($this->testNibId, $result['id_nib']);
        $this->assertSame('BERHASIL', $result['status_proses']);
        $this->assertNotNull($result['dihasilkan_pada']);
        $this->assertFalse($result['perlu_review_manual']);
        $this->assertNull($result['alasan_review']);

        // Ringkasan
        $this->assertSame('BERHASIL', $result['ringkasan']['status_ekstraksi']);
        $this->assertSame('ANALISIS_LENGKAP', $result['ringkasan']['status_analisis']);
        $this->assertSame(3, $result['ringkasan']['total_field']);
        $this->assertSame(3, $result['ringkasan']['field_ditemukan']);
        $this->assertEquals(100, $result['ringkasan']['persentase_kelengkapan']);
        $this->assertFalse($result['ringkasan']['qr_ditemukan']);

        // Data terdieksi
        $this->assertCount(3, $result['data_terekstraksi']['fields']);
        $this->assertFalse($result['data_terekstraksi']['qr']['ditemukan']);

        // Analisis struktur
        $this->assertSame('BERHASIL', $result['analisis_struktur']['karakteristik_dokumen']['status_ekstraksi_asli']);
        $this->assertContains('INFORMASI_LENGKAP', $result['analisis_struktur']['indikator_struktur']);

        // Tidak ada keputusan otomatis
        $this->assertArrayNotHasKey('status_lulus', $result);
        $this->assertArrayNotHasKey('status_ditolak', $result);
    }

    /**
     * Test: Hasil berhasil dengan peringatan.
     */
    public function test_berhasil_dengan_peringatan(): void
    {
        $this->mockDataExtractor->shouldReceive('extract')->once()->andReturn([
            'status_ekstraksi' => 'BERHASIL',
            'dokumen' => [
                'id_nib' => $this->testNibId,
                'total_halaman' => 1,
                'sumber_teks' => 'pdf',
            ],
            'fields' => [
                [
                    'nama_field' => 'nomor_nib',
                    'status' => 'FIELD_FOUND',
                    'normalized_value' => '1234567890123',
                    'validasi' => ['status' => 'VALID', 'reason' => null],
                    'bukti' => [],
                    'nilai_alternatif' => [],
                    'catatan' => null,
                ],
                [
                    'nama_field' => 'nama_perusahaan',
                    'status' => 'FIELD_NOT_FOUND',
                    'normalized_value' => null,
                    'validasi' => ['status' => 'UNKNOWN', 'reason' => null],
                    'bukti' => [],
                    'nilai_alternatif' => [],
                    'catatan' => null,
                ],
                [
                    'nama_field' => 'alamat_perusahaan',
                    'status' => 'FIELD_FOUND',
                    'normalized_value' => 'Jl. Contoh No. 1',
                    'validasi' => ['status' => 'VALID', 'reason' => null],
                    'bukti' => [],
                    'nilai_alternatif' => [],
                    'catatan' => null,
                ],
            ],
            'qr' => [
                'ditemukan' => false,
                'konten' => null,
                'jenis' => null,
                'url_validasi' => null,
            ],
            'perbandingan' => [
                'field_dibandingkan' => [],
                'indikator_kemiripan' => null,
                'ketidaksesuaian' => [],
                'field_tidak_dapat_dibandingkan' => [],
            ],
            'perlu_review_manual' => true,
            'alasan_review' => 'Nama perusahaan tidak ditemukan.',
        ]);

        $this->mockStructureAnalyzer->shouldReceive('analyze')->once()->andReturn([
            'status_analisis' => 'ANALISIS_LENGKAP',
            'karakteristik_dokumen' => [
                'id_nib' => $this->testNibId,
                'total_halaman' => 1,
                'halaman_dengan_teks' => 1,
                'halaman_kosong' => 0,
                'halaman_detail' => [],
                'qr_ditemukan' => false,
                'sumber_ekstraksi' => 'pdf',
                'status_ekstraksi_asli' => 'BERHASIL',
            ],
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
            'perlu_review_manual' => true,
            'alasan_review' => 'Nama perusahaan tidak ditemukan.',
        ]);

        $result = $this->service->generate($this->testNibId);

        $this->assertSame('BERHASIL_DENGAN_PERINGATAN', $result['status_proses']);
        $this->assertTrue($result['perlu_review_manual']);
        $this->assertNotNull($result['alasan_review']);
        $this->assertSame(1, $result['ringkasan']['field_tidak_ditemukan']);
    }

    /**
     * Test: Ekstraksi gagal.
     */
    public function test_ekstraksi_gagal(): void
    {
        $this->mockDataExtractor->shouldReceive('extract')->once()->andReturn([
            'status_ekstraksi' => 'GAGAL',
            'dokumen' => [
                'id_nib' => $this->testNibId,
                'total_halaman' => null,
                'sumber_teks' => 'tidak_tersedia',
            ],
            'fields' => [],
            'qr' => [
                'ditemukan' => false,
                'konten' => null,
                'jenis' => null,
                'url_validasi' => null,
            ],
            'perbandingan' => [
                'field_dibandingkan' => [],
                'indikator_kemiripan' => null,
                'ketidaksesuaian' => [],
                'field_tidak_dapat_dibandingkan' => [],
            ],
            'perlu_review_manual' => true,
            'alasan_review' => 'Gagal mengekstrak teks dari PDF.',
        ]);

        $this->mockStructureAnalyzer->shouldReceive('analyze')->once()->andReturn([
            'status_analisis' => 'ANALISIS_TIDAK_LENGKAP',
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
            'perlu_review_manual' => true,
            'alasan_review' => 'Gagal mengekstrak teks dari PDF.',
        ]);

        $result = $this->service->generate($this->testNibId);

        $this->assertSame('GAGAL', $result['status_proses']);
        $this->assertTrue($result['perlu_review_manual']);
        $this->assertSame(0, $result['ringkasan']['total_field']);
        $this->assertSame(1, $result['ringkasan']['temuan_critical']);
    }

    /**
     * Test: Konflik nomor NIB antara PDF dan QR.
     */
    public function test_konflik_nomor_nib(): void
    {
        $this->mockDataExtractor->shouldReceive('extract')->once()->andReturn([
            'status_ekstraksi' => 'AMBIGUOUS',
            'dokumen' => [
                'id_nib' => $this->testNibId,
                'total_halaman' => 1,
                'sumber_teks' => 'campuran',
            ],
            'fields' => [
                [
                    'nama_field' => 'nomor_nib',
                    'status' => 'FIELD_AMBIGUOUS',
                    'normalized_value' => '1234567890123',
                    'validasi' => ['status' => 'AMBIGUOUS', 'reason' => 'Ditemukan lebih dari satu kandidat nilai yang berbeda.'],
                    'bukti' => [
                        ['sumber' => 'teks', 'raw_value' => 'NIB 1234567890123', 'normalized_value' => '1234567890123', 'halaman' => 1, 'bukti_teks' => 'NIB: 1234567890123'],
                        ['sumber' => 'qr', 'raw_value' => 'NIB 9998887776666', 'normalized_value' => '9998887776666', 'halaman' => null, 'bukti_teks' => 'NIB 9998887776666'],
                    ],
                    'nilai_alternatif' => [
                        ['sumber' => 'qr', 'raw_value' => 'NIB 9998887776666', 'normalized_value' => '9998887776666', 'halaman' => null, 'bukti_teks' => 'NIB 9998887776666'],
                    ],
                    'catatan' => 'Nilai ambigu antara sumber berbeda.',
                ],
                [
                    'nama_field' => 'nama_perusahaan',
                    'status' => 'FIELD_FOUND',
                    'normalized_value' => 'PT Kafe Contoh',
                    'validasi' => ['status' => 'VALID', 'reason' => null],
                    'bukti' => [],
                    'nilai_alternatif' => [],
                    'catatan' => null,
                ],
                [
                    'nama_field' => 'alamat_perusahaan',
                    'status' => 'FIELD_FOUND',
                    'normalized_value' => 'Jl. Contoh No. 1',
                    'validasi' => ['status' => 'VALID', 'reason' => null],
                    'bukti' => [],
                    'nilai_alternatif' => [],
                    'catatan' => null,
                ],
            ],
            'qr' => [
                'ditemukan' => true,
                'konten' => 'NIB 9998887776666',
                'jenis' => 'teks',
                'url_validasi' => null,
            ],
            'perbandingan' => [
                'field_dibandingkan' => [],
                'indikator_kemiripan' => null,
                'ketidaksesuaian' => [],
                'field_tidak_dapat_dibandingkan' => [],
            ],
            'perlu_review_manual' => true,
            'alasan_review' => 'Nomor NIB ambigu.',
        ]);

        $this->mockStructureAnalyzer->shouldReceive('analyze')->once()->andReturn([
            'status_analisis' => 'ANALISIS_LENGKAP',
            'karakteristik_dokumen' => [
                'id_nib' => $this->testNibId,
                'total_halaman' => 1,
                'halaman_dengan_teks' => 1,
                'halaman_kosong' => 0,
                'halaman_detail' => [],
                'qr_ditemukan' => true,
                'sumber_ekstraksi' => 'campuran',
                'status_ekstraksi_asli' => 'AMBIGUOUS',
            ],
            'indikator_struktur' => ['PERLU_REVIEW', 'QR_DITEMUKAN'],
            'indikator_konsistensi' => ['DITEMUKAN_KETIDAKSESUAIAN'],
            'temuan' => [
                [
                    'jenis_temuan' => 'NIB_KONFLIK_SUMBER',
                    'deskripsi' => 'Ditemukan lebih dari satu nilai nomor NIB dari sumber berbeda.',
                    'field_terkait' => 'nomor_nib',
                    'sumber_bukti' => ['teks', 'qr'],
                    'halaman' => 1,
                    'tingkat_perhatian' => 'CRITICAL',
                ],
            ],
            'perlu_review_manual' => true,
            'alasan_review' => 'Nomor NIB ambigu.',
        ]);

        $result = $this->service->generate($this->testNibId);

        $this->assertSame('BERHASIL_DENGAN_PERINGATAN', $result['status_proses']);
        $this->assertTrue($result['perlu_review_manual']);
        $this->assertContains('DITEMUKAN_KETIDAKSESUAIAN', $result['indikator_screening']);
        $this->assertSame(1, $result['ringkasan']['field_ambigu']);
        $this->assertSame(1, $result['ringkasan']['temuan_critical']);

        // Verifikasi tidak ada duplikasi temuan
        $temuanJenis = array_column($result['analisis_struktur']['temuan'], 'jenis_temuan');
        $this->assertCount(count(array_unique($temuanJenis)), $temuanJenis);
    }

    /**
     * Test: Informasi perusahaan tidak lengkap.
     */
    public function test_informasi_perusahaan_tidak_lengkap(): void
    {
        $this->mockDataExtractor->shouldReceive('extract')->once()->andReturn([
            'status_ekstraksi' => 'BERHASIL',
            'dokumen' => [
                'id_nib' => $this->testNibId,
                'total_halaman' => 1,
                'sumber_teks' => 'pdf',
            ],
            'fields' => [
                [
                    'nama_field' => 'nomor_nib',
                    'status' => 'FIELD_NOT_FOUND',
                    'normalized_value' => null,
                    'validasi' => ['status' => 'UNKNOWN', 'reason' => null],
                    'bukti' => [],
                    'nilai_alternatif' => [],
                    'catatan' => null,
                ],
                [
                    'nama_field' => 'nama_perusahaan',
                    'status' => 'FIELD_NOT_FOUND',
                    'normalized_value' => null,
                    'validasi' => ['status' => 'UNKNOWN', 'reason' => null],
                    'bukti' => [],
                    'nilai_alternatif' => [],
                    'catatan' => null,
                ],
                [
                    'nama_field' => 'alamat_perusahaan',
                    'status' => 'FIELD_NOT_FOUND',
                    'normalized_value' => null,
                    'validasi' => ['status' => 'UNKNOWN', 'reason' => null],
                    'bukti' => [],
                    'nilai_alternatif' => [],
                    'catatan' => null,
                ],
            ],
            'qr' => [
                'ditemukan' => false,
                'konten' => null,
                'jenis' => null,
                'url_validasi' => null,
            ],
            'perbandingan' => [
                'field_dibandingkan' => [],
                'indikator_kemiripan' => null,
                'ketidaksesuaian' => [],
                'field_tidak_dapat_dibandingkan' => [],
            ],
            'perlu_review_manual' => true,
            'alasan_review' => 'Tidak ada informasi yang cukup.',
        ]);

        $this->mockStructureAnalyzer->shouldReceive('analyze')->once()->andReturn([
            'status_analisis' => 'ANALISIS_LENGKAP',
            'karakteristik_dokumen' => [
                'id_nib' => $this->testNibId,
                'total_halaman' => 1,
                'halaman_dengan_teks' => 0,
                'halaman_kosong' => 1,
                'halaman_detail' => [],
                'qr_ditemukan' => false,
                'sumber_ekstraksi' => 'pdf',
                'status_ekstraksi_asli' => 'BERHASIL',
            ],
            'indikator_struktur' => ['INFORMASI_TIDAK_LENGKAP'],
            'indikator_konsistensi' => [],
            'temuan' => [
                [
                    'jenis_temuan' => 'NIB_TIDAK_DITEMUKAN',
                    'deskripsi' => 'Nomor NIB tidak ditemukan.',
                    'field_terkait' => 'nomor_nib',
                    'sumber_bukti' => [],
                    'halaman' => null,
                    'tingkat_perhatian' => 'WARNING',
                ],
                [
                    'jenis_temuan' => 'NAMA_PERUSAHAAN_TIDAK_DITEMUKAN',
                    'deskripsi' => 'Nama perusahaan tidak ditemukan.',
                    'field_terkait' => 'nama_perusahaan',
                    'sumber_bukti' => [],
                    'halaman' => null,
                    'tingkat_perhatian' => 'WARNING',
                ],
                [
                    'jenis_temuan' => 'ALAMAT_TIDAK_DITEMUKAN',
                    'deskripsi' => 'Alamat tidak ditemukan.',
                    'field_terkait' => 'alamat_perusahaan',
                    'sumber_bukti' => [],
                    'halaman' => null,
                    'tingkat_perhatian' => 'WARNING',
                ],
                [
                    'jenis_temuan' => 'INFORMASI_TIDAK_LENGKAP',
                    'deskripsi' => 'Beberapa informasi wajib tidak ditemukan.',
                    'field_terkait' => null,
                    'sumber_bukti' => [],
                    'halaman' => null,
                    'tingkat_perhatian' => 'WARNING',
                ],
            ],
            'perlu_review_manual' => true,
            'alasan_review' => 'Tidak ada informasi yang cukup.',
        ]);

        $result = $this->service->generate($this->testNibId);

        $this->assertSame('BERHASIL_DENGAN_PERINGATAN', $result['status_proses']);
        $this->assertTrue($result['perlu_review_manual']);
        $this->assertSame(3, $result['ringkasan']['field_tidak_ditemukan']);
        $this->assertSame(0, $result['ringkasan']['field_ditemukan']);
        $this->assertEquals(0, $result['ringkasan']['persentase_kelengkapan']);
    }

    /**
     * Test: QR tidak ditemukan.
     */
    public function test_qr_tidak_ditemukan(): void
    {
        $this->mockDataExtractor->shouldReceive('extract')->once()->andReturn([
            'status_ekstraksi' => 'BERHASIL',
            'dokumen' => [
                'id_nib' => $this->testNibId,
                'total_halaman' => 1,
                'sumber_teks' => 'pdf',
            ],
            'fields' => [
                [
                    'nama_field' => 'nomor_nib',
                    'status' => 'FIELD_FOUND',
                    'normalized_value' => '1234567890123',
                    'validasi' => ['status' => 'VALID', 'reason' => null],
                    'bukti' => [],
                    'nilai_alternatif' => [],
                    'catatan' => null,
                ],
                [
                    'nama_field' => 'nama_perusahaan',
                    'status' => 'FIELD_FOUND',
                    'normalized_value' => 'PT Kafe Contoh',
                    'validasi' => ['status' => 'VALID', 'reason' => null],
                    'bukti' => [],
                    'nilai_alternatif' => [],
                    'catatan' => null,
                ],
                [
                    'nama_field' => 'alamat_perusahaan',
                    'status' => 'FIELD_FOUND',
                    'normalized_value' => 'Jl. Contoh No. 1',
                    'validasi' => ['status' => 'VALID', 'reason' => null],
                    'bukti' => [],
                    'nilai_alternatif' => [],
                    'catatan' => null,
                ],
            ],
            'qr' => [
                'ditemukan' => false,
                'konten' => null,
                'jenis' => null,
                'url_validasi' => null,
            ],
            'perbandingan' => [
                'field_dibandingkan' => [],
                'indikator_kemiripan' => null,
                'ketidaksesuaian' => [],
                'field_tidak_dapat_dibandingkan' => [],
            ],
            'perlu_review_manual' => false,
            'alasan_review' => null,
        ]);

        $this->mockStructureAnalyzer->shouldReceive('analyze')->once()->andReturn([
            'status_analisis' => 'ANALISIS_LENGKAP',
            'karakteristik_dokumen' => [
                'id_nib' => $this->testNibId,
                'total_halaman' => 1,
                'halaman_dengan_teks' => 1,
                'halaman_kosong' => 0,
                'halaman_detail' => [],
                'qr_ditemukan' => false,
                'sumber_ekstraksi' => 'pdf',
                'status_ekstraksi_asli' => 'BERHASIL',
            ],
            'indikator_struktur' => ['INFORMASI_LENGKAP'],
            'indikator_konsistensi' => [],
            'temuan' => [
                [
                    'jenis_temuan' => 'QR_TIDAK_DITEMUKAN',
                    'deskripsi' => 'QR Code tidak ditemukan dalam dokumen.',
                    'field_terkait' => null,
                    'sumber_bukti' => [],
                    'halaman' => null,
                    'tingkat_perhatian' => 'INFO',
                ],
            ],
            'perlu_review_manual' => false,
            'alasan_review' => null,
        ]);

        $result = $this->service->generate($this->testNibId);

        $this->assertSame('BERHASIL', $result['status_proses']);
        $this->assertFalse($result['ringkasan']['qr_ditemukan']);
        $this->assertSame('INFO', $result['analisis_struktur']['temuan'][0]['tingkat_perhatian']);
    }

    /**
     * Test: Ketidaksesuaian dengan profil perusahaan.
     */
    public function test_ketidaksesuaian_dengan_profil_perusahaan(): void
    {
        $this->mockDataExtractor->shouldReceive('extract')->once()->andReturn([
            'status_ekstraksi' => 'BERHASIL',
            'dokumen' => [
                'id_nib' => $this->testNibId,
                'total_halaman' => 1,
                'sumber_teks' => 'pdf',
            ],
            'fields' => [
                [
                    'nama_field' => 'nomor_nib',
                    'status' => 'FIELD_FOUND',
                    'normalized_value' => '1234567890123',
                    'validasi' => ['status' => 'VALID', 'reason' => null],
                    'bukti' => [],
                    'nilai_alternatif' => [],
                    'catatan' => null,
                ],
                [
                    'nama_field' => 'nama_perusahaan',
                    'status' => 'FIELD_FOUND',
                    'normalized_value' => 'PT Kafe Lain',
                    'validasi' => ['status' => 'VALID', 'reason' => null],
                    'bukti' => [],
                    'nilai_alternatif' => [],
                    'catatan' => null,
                ],
                [
                    'nama_field' => 'alamat_perusahaan',
                    'status' => 'FIELD_FOUND',
                    'normalized_value' => 'Jl. Lain No. 2',
                    'validasi' => ['status' => 'VALID', 'reason' => null],
                    'bukti' => [],
                    'nilai_alternatif' => [],
                    'catatan' => null,
                ],
            ],
            'qr' => [
                'ditemukan' => false,
                'konten' => null,
                'jenis' => null,
                'url_validasi' => null,
            ],
            'perbandingan' => [
                'field_dibandingkan' => ['nama_perusahaan', 'alamat_perusahaan'],
                'indikator_kemiripan' => null,
                'ketidaksesuaian' => [
                    [
                        'nama_field' => 'nama_perusahaan',
                        'nilai_dokumen' => 'PT Kafe Lain',
                        'nilai_database' => 'PT Kafe Contoh',
                    ],
                    [
                        'nama_field' => 'alamat_perusahaan',
                        'nilai_dokumen' => 'Jl. Lain No. 2',
                        'nilai_database' => 'Jl. Contoh No. 1',
                    ],
                ],
                'field_tidak_dapat_dibandingkan' => [],
            ],
            'perlu_review_manual' => true,
            'alasan_review' => 'Terdapat ketidaksesuaian data.',
        ]);

        $this->mockStructureAnalyzer->shouldReceive('analyze')->once()->andReturn([
            'status_analisis' => 'ANALISIS_LENGKAP',
            'karakteristik_dokumen' => [
                'id_nib' => $this->testNibId,
                'total_halaman' => 1,
                'halaman_dengan_teks' => 1,
                'halaman_kosong' => 0,
                'halaman_detail' => [],
                'qr_ditemukan' => false,
                'sumber_ekstraksi' => 'pdf',
                'status_ekstraksi_asli' => 'BERHASIL',
            ],
            'indikator_struktur' => ['INFORMASI_LENGKAP'],
            'indikator_konsistensi' => ['DITEMUKAN_KETIDAKSESUAIAN'],
            'temuan' => [
                [
                    'jenis_temuan' => 'KETIDAKSESUAIAN_INFORMASI',
                    'deskripsi' => 'Ditemukan ketidaksesuaian informasi.',
                    'field_terkait' => null,
                    'sumber_bukti' => [],
                    'halaman' => null,
                    'tingkat_perhatian' => 'CRITICAL',
                ],
            ],
            'perlu_review_manual' => true,
            'alasan_review' => 'Terdapat ketidaksesuaian data.',
        ]);

        $result = $this->service->generate($this->testNibId, \App\Models\ProfilPerusahaan::first());

        $this->assertSame('BERHASIL_DENGAN_PERINGATAN', $result['status_proses']);
        $this->assertTrue($result['perlu_review_manual']);
        $this->assertCount(2, $result['ketidaksesuaian']);
        $this->assertSame('PT Kafe Lain', $result['ketidaksesuaian'][0]['nilai_dokumen']);
        $this->assertSame('PT Kafe Contoh', $result['ketidaksesuaian'][0]['nilai_database']);
    }

    /**
     * Test: Review manual diperlukan.
     */
    public function test_review_manual_diperlukan(): void
    {
        $this->mockDataExtractor->shouldReceive('extract')->once()->andReturn([
            'status_ekstraksi' => 'BERHASIL',
            'dokumen' => [
                'id_nib' => $this->testNibId,
                'total_halaman' => 1,
                'sumber_teks' => 'pdf',
            ],
            'fields' => [
                [
                    'nama_field' => 'nomor_nib',
                    'status' => 'FIELD_INVALID',
                    'normalized_value' => null,
                    'validasi' => ['status' => 'INVALID', 'reason' => 'Format tidak valid.'],
                    'bukti' => [],
                    'nilai_alternatif' => [],
                    'catatan' => null,
                ],
                [
                    'nama_field' => 'nama_perusahaan',
                    'status' => 'FIELD_FOUND',
                    'normalized_value' => 'PT Kafe Contoh',
                    'validasi' => ['status' => 'VALID', 'reason' => null],
                    'bukti' => [],
                    'nilai_alternatif' => [],
                    'catatan' => null,
                ],
                [
                    'nama_field' => 'alamat_perusahaan',
                    'status' => 'FIELD_FOUND',
                    'normalized_value' => 'Jl. Contoh No. 1',
                    'validasi' => ['status' => 'VALID', 'reason' => null],
                    'bukti' => [],
                    'nilai_alternatif' => [],
                    'catatan' => null,
                ],
            ],
            'qr' => [
                'ditemukan' => false,
                'konten' => null,
                'jenis' => null,
                'url_validasi' => null,
            ],
            'perbandingan' => [
                'field_dibandingkan' => [],
                'indikator_kemiripan' => null,
                'ketidaksesuaian' => [],
                'field_tidak_dapat_dibandingkan' => [],
            ],
            'perlu_review_manual' => true,
            'alasan_review' => 'Format nomor NIB tidak valid.',
        ]);

        $this->mockStructureAnalyzer->shouldReceive('analyze')->once()->andReturn([
            'status_analisis' => 'ANALISIS_LENGKAP',
            'karakteristik_dokumen' => [
                'id_nib' => $this->testNibId,
                'total_halaman' => 1,
                'halaman_dengan_teks' => 1,
                'halaman_kosong' => 0,
                'halaman_detail' => [],
                'qr_ditemukan' => false,
                'sumber_ekstraksi' => 'pdf',
                'status_ekstraksi_asli' => 'BERHASIL',
            ],
            'indikator_struktur' => ['INFORMASI_TIDAK_LENGKAP'],
            'indikator_konsistensi' => ['NIB_FORMAT_TIDAK_VALID'],
            'temuan' => [
                [
                    'jenis_temuan' => 'NIB_FORMAT_TIDAK_VALID',
                    'deskripsi' => 'Format nomor NIB tidak valid.',
                    'field_terkait' => 'nomor_nib',
                    'sumber_bukti' => [],
                    'halaman' => null,
                    'tingkat_perhatian' => 'WARNING',
                ],
            ],
            'perlu_review_manual' => true,
            'alasan_review' => 'Format nomor NIB tidak valid.',
        ]);

        $result = $this->service->generate($this->testNibId);

        $this->assertSame('BERHASIL_DENGAN_PERINGATAN', $result['status_proses']);
        $this->assertTrue($result['perlu_review_manual']);
        $this->assertNotNull($result['alasan_review']);
        $this->assertSame(1, $result['ringkasan']['field_invalid']);
    }

    /**
     * Test: Tidak ada keputusan otomatis Lulus atau Ditolak.
     */
    public function test_tidak_ada_keputusan_otomatis(): void
    {
        $this->mockDataExtractor->shouldReceive('extract')->once()->andReturn([
            'status_ekstraksi' => 'BERHASIL',
            'dokumen' => [
                'id_nib' => $this->testNibId,
                'total_halaman' => 1,
                'sumber_teks' => 'pdf',
            ],
            'fields' => [
                [
                    'nama_field' => 'nomor_nib',
                    'status' => 'FIELD_FOUND',
                    'normalized_value' => '1234567890123',
                    'validasi' => ['status' => 'VALID', 'reason' => null],
                    'bukti' => [],
                    'nilai_alternatif' => [],
                    'catatan' => null,
                ],
                [
                    'nama_field' => 'nama_perusahaan',
                    'status' => 'FIELD_FOUND',
                    'normalized_value' => 'PT Kafe Contoh',
                    'validasi' => ['status' => 'VALID', 'reason' => null],
                    'bukti' => [],
                    'nilai_alternatif' => [],
                    'catatan' => null,
                ],
                [
                    'nama_field' => 'alamat_perusahaan',
                    'status' => 'FIELD_FOUND',
                    'normalized_value' => 'Jl. Contoh No. 1',
                    'validasi' => ['status' => 'VALID', 'reason' => null],
                    'bukti' => [],
                    'nilai_alternatif' => [],
                    'catatan' => null,
                ],
            ],
            'qr' => [
                'ditemukan' => true,
                'konten' => 'https://oss.go.id/verify/nib/1234567890123',
                'jenis' => 'url',
                'url_validasi' => [
                    'status' => 'OSS_URL_VALID',
                    'is_valid' => true,
                    'is_oss_domain' => true,
                    'scheme' => 'https',
                    'host' => 'oss.go.id',
                    'normalized_url' => 'https://oss.go.id/verify/nib/1234567890123',
                    'reason' => 'URL HTTPS valid dengan host OSS terverifikasi.',
                ],
            ],
            'perbandingan' => [
                'field_dibandingkan' => [],
                'indikator_kemiripan' => null,
                'ketidaksesuaian' => [],
                'field_tidak_dapat_dibandingkan' => [],
            ],
            'perlu_review_manual' => false,
            'alasan_review' => null,
        ]);

        $this->mockStructureAnalyzer->shouldReceive('analyze')->once()->andReturn([
            'status_analisis' => 'ANALISIS_LENGKAP',
            'karakteristik_dokumen' => [
                'id_nib' => $this->testNibId,
                'total_halaman' => 1,
                'halaman_dengan_teks' => 1,
                'halaman_kosong' => 0,
                'halaman_detail' => [],
                'qr_ditemukan' => true,
                'sumber_ekstraksi' => 'pdf',
                'status_ekstraksi_asli' => 'BERHASIL',
            ],
            'indikator_struktur' => ['INFORMASI_LENGKAP', 'QR_DITEMUKAN'],
            'indikator_konsistensi' => [],
            'temuan' => [
                [
                    'jenis_temuan' => 'NIB_DITEMUKAN',
                    'deskripsi' => 'Nomor NIB berhasil diekstrak.',
                    'field_terkait' => 'nomor_nib',
                    'sumber_bukti' => ['teks'],
                    'halaman' => 1,
                    'tingkat_perhatian' => 'INFO',
                ],
                [
                    'jenis_temuan' => 'QR_URL_OSS_VALID',
                    'deskripsi' => 'URL QR mengarah ke domain OSS terverifikasi.',
                    'field_terkait' => null,
                    'sumber_bukti' => ['qr_url_validator'],
                    'halaman' => null,
                    'tingkat_perhatian' => 'INFO',
                ],
            ],
            'perlu_review_manual' => false,
            'alasan_review' => null,
        ]);

        $result = $this->service->generate($this->testNibId);

        $this->assertSame('BERHASIL', $result['status_proses']);
        $this->assertArrayNotHasKey('status_lulus', $result);
        $this->assertArrayNotHasKey('status_ditolak', $result);
        $this->assertArrayNotHasKey('keputusan', $result);
        $this->assertArrayNotHasKey('rekomendasi', $result);
        $this->assertArrayNotHasKey('keaslian_dokumen', $result);
    }

    /**
     * Test: Tidak ada perubahan database.
     */
    public function test_tidak_ada_perubahan_database(): void
    {
        $this->mockDataExtractor->shouldReceive('extract')->once()->andReturn([
            'status_ekstraksi' => 'BERHASIL',
            'dokumen' => [
                'id_nib' => $this->testNibId,
                'total_halaman' => 1,
                'sumber_teks' => 'pdf',
            ],
            'fields' => [],
            'qr' => ['ditemukan' => false, 'konten' => null, 'jenis' => null, 'url_validasi' => null],
            'perbandingan' => ['field_dibandingkan' => [], 'indikator_kemiripan' => null, 'ketidaksesuaian' => [], 'field_tidak_dapat_dibandingkan' => []],
            'perlu_review_manual' => false,
            'alasan_review' => null,
        ]);

        $this->mockStructureAnalyzer->shouldReceive('analyze')->once()->andReturn([
            'status_analisis' => 'ANALISIS_LENGKAP',
            'karakteristik_dokumen' => [],
            'indikator_struktur' => [],
            'indikator_konsistensi' => [],
            'temuan' => [],
            'perlu_review_manual' => false,
            'alasan_review' => null,
        ]);

        $nibCountBefore = \App\Models\Nib::count();
        $profilCountBefore = \App\Models\ProfilPerusahaan::count();

        $result = $this->service->generate($this->testNibId);

        $nibCountAfter = \App\Models\Nib::count();
        $profilCountAfter = \App\Models\ProfilPerusahaan::count();

        $this->assertSame($nibCountBefore, $nibCountAfter);
        $this->assertSame($profilCountBefore, $profilCountAfter);
    }

    /**
     * Test: Temuan tidak terduplikasi.
     */
    public function test_temuan_tidak_terduplikasi(): void
    {
        $this->mockDataExtractor->shouldReceive('extract')->once()->andReturn([
            'status_ekstraksi' => 'BERHASIL',
            'dokumen' => [
                'id_nib' => $this->testNibId,
                'total_halaman' => 1,
                'sumber_teks' => 'pdf',
            ],
            'fields' => [
                [
                    'nama_field' => 'nomor_nib',
                    'status' => 'FIELD_FOUND',
                    'normalized_value' => '1234567890123',
                    'validasi' => ['status' => 'VALID', 'reason' => null],
                    'bukti' => [
                        ['sumber' => 'teks', 'raw_value' => '1234567890123', 'normalized_value' => '1234567890123', 'halaman' => 1, 'bukti_teks' => 'NIB: 1234567890123'],
                    ],
                    'nilai_alternatif' => [],
                    'catatan' => null,
                ],
                [
                    'nama_field' => 'nama_perusahaan',
                    'status' => 'FIELD_FOUND',
                    'normalized_value' => 'PT Kafe Contoh',
                    'validasi' => ['status' => 'VALID', 'reason' => null],
                    'bukti' => [],
                    'nilai_alternatif' => [],
                    'catatan' => null,
                ],
                [
                    'nama_field' => 'alamat_perusahaan',
                    'status' => 'FIELD_FOUND',
                    'normalized_value' => 'Jl. Contoh No. 1',
                    'validasi' => ['status' => 'VALID', 'reason' => null],
                    'bukti' => [],
                    'nilai_alternatif' => [],
                    'catatan' => null,
                ],
            ],
            'qr' => [
                'ditemukan' => true,
                'konten' => 'NIB 1234567890123',
                'jenis' => 'teks',
                'url_validasi' => null,
            ],
            'perbandingan' => [
                'field_dibandingkan' => [],
                'indikator_kemiripan' => null,
                'ketidaksesuaian' => [],
                'field_tidak_dapat_dibandingkan' => [],
            ],
            'perlu_review_manual' => false,
            'alasan_review' => null,
        ]);

        $this->mockStructureAnalyzer->shouldReceive('analyze')->once()->andReturn([
            'status_analisis' => 'ANALISIS_LENGKAP',
            'karakteristik_dokumen' => [
                'id_nib' => $this->testNibId,
                'total_halaman' => 1,
                'halaman_dengan_teks' => 1,
                'halaman_kosong' => 0,
                'halaman_detail' => [],
                'qr_ditemukan' => true,
                'sumber_ekstraksi' => 'pdf',
                'status_ekstraksi_asli' => 'BERHASIL',
            ],
            'indikator_struktur' => ['INFORMASI_LENGKAP', 'QR_DITEMUKAN'],
            'indikator_konsistensi' => [],
            'temuan' => [
                [
                    'jenis_temuan' => 'NIB_DITEMUKAN',
                    'deskripsi' => 'Nomor NIB berhasil diekstrak.',
                    'field_terkait' => 'nomor_nib',
                    'sumber_bukti' => ['teks'],
                    'halaman' => 1,
                    'tingkat_perhatian' => 'INFO',
                ],
                [
                    'jenis_temuan' => 'QR_DITEMUKAN',
                    'deskripsi' => 'QR Code ditemukan.',
                    'field_terkait' => null,
                    'sumber_bukti' => ['qr'],
                    'halaman' => null,
                    'tingkat_perhatian' => 'INFO',
                ],
            ],
            'perlu_review_manual' => false,
            'alasan_review' => null,
        ]);

        $result = $this->service->generate($this->testNibId);

        // Verifikasi tidak ada duplikasi indikator screening
        $indikatorUnique = array_unique($result['indikator_screening']);
        $this->assertCount(count($result['indikator_screening']), $indikatorUnique);

        // Verifikasi bukti tidak terduplikasi
        $buktiKeys = array_map(function($b) {
            return $b['sumber'] . ':' . ($b['raw_value'] ?? '');
        }, $result['bukti_pemeriksaan']);
        $this->assertCount(count(array_unique($buktiKeys)), $buktiKeys);
    }

    /**
     * Test: NIB tidak ditemukan di database.
     */
    public function test_nib_tidak_ditemukan(): void
    {
        $result = $this->service->generate('non-existent-id');

        $this->assertSame('GAGAL', $result['status_proses']);
        $this->assertTrue($result['perlu_review_manual']);
        $this->assertStringContainsString('tidak ditemukan', $result['alasan_review']);
    }

    /**
     * Test: Output memiliki semua kunci yang diharapkan.
     */
    public function test_output_memiliki_semua_kunci(): void
    {
        $this->mockDataExtractor->shouldReceive('extract')->once()->andReturn([
            'status_ekstraksi' => 'BERHASIL',
            'dokumen' => [
                'id_nib' => $this->testNibId,
                'total_halaman' => 1,
                'sumber_teks' => 'pdf',
            ],
            'fields' => [
                [
                    'nama_field' => 'nomor_nib',
                    'status' => 'FIELD_FOUND',
                    'normalized_value' => '1234567890123',
                    'validasi' => ['status' => 'VALID', 'reason' => null],
                    'bukti' => [],
                    'nilai_alternatif' => [],
                    'catatan' => null,
                ],
                [
                    'nama_field' => 'nama_perusahaan',
                    'status' => 'FIELD_FOUND',
                    'normalized_value' => 'PT Kafe Contoh',
                    'validasi' => ['status' => 'VALID', 'reason' => null],
                    'bukti' => [],
                    'nilai_alternatif' => [],
                    'catatan' => null,
                ],
                [
                    'nama_field' => 'alamat_perusahaan',
                    'status' => 'FIELD_FOUND',
                    'normalized_value' => 'Jl. Contoh No. 1',
                    'validasi' => ['status' => 'VALID', 'reason' => null],
                    'bukti' => [],
                    'nilai_alternatif' => [],
                    'catatan' => null,
                ],
            ],
            'qr' => ['ditemukan' => false, 'konten' => null, 'jenis' => null, 'url_validasi' => null],
            'perbandingan' => ['field_dibandingkan' => [], 'indikator_kemiripan' => null, 'ketidaksesuaian' => [], 'field_tidak_dapat_dibandingkan' => []],
            'perlu_review_manual' => false,
            'alasan_review' => null,
        ]);

        $this->mockStructureAnalyzer->shouldReceive('analyze')->once()->andReturn([
            'status_analisis' => 'ANALISIS_LENGKAP',
            'karakteristik_dokumen' => [],
            'indikator_struktur' => [],
            'indikator_konsistensi' => [],
            'temuan' => [],
            'perlu_review_manual' => false,
            'alasan_review' => null,
        ]);

        $result = $this->service->generate($this->testNibId);

        $expectedKeys = [
            'id_nib',
            'status_proses',
            'ringkasan',
            'data_terekstraksi',
            'analisis_struktur',
            'indikator_screening',
            'ketidaksesuaian',
            'bukti_pemeriksaan',
            'perlu_review_manual',
            'alasan_review',
            'dihasilkan_pada',
        ];

        foreach ($expectedKeys as $key) {
            $this->assertArrayHasKey($key, $result, 'Kunci "' . $key . '" harus ada dalam output.');
        }

        $ringkasanKeys = [
            'status_ekstraksi', 'status_analisis', 'total_field', 'field_ditemukan',
            'field_tidak_ditemukan', 'field_ambigu', 'field_invalid', 'persentase_kelengkapan',
            'qr_ditemukan', 'qr_jenis', 'total_temuan', 'temuan_critical', 'temuan_warning',
            'total_halaman', 'sumber_ekstraksi',
        ];

        foreach ($ringkasanKeys as $key) {
            $this->assertArrayHasKey($key, $result['ringkasan'], 'Kunci ringkasan "' . $key . '" harus ada.');
        }
    }
}
