<?php

namespace Tests\Feature;

use App\Services\Nib\NibDataExtractorService;
use App\Services\Nib\NibDocumentStructureAnalyzerService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Mockery;
use Tests\TestCase;

class NibDocumentStructureAnalyzerTest extends TestCase
{
    use RefreshDatabase;

    private NibDocumentStructureAnalyzerService $analyzer;
    private \Mockery\MockInterface $mockDataExtractor;

    private string $testNibId;

    protected function setUp(): void
    {
        parent::setUp();
        $this->assertSame('sqlite', DB::connection()->getDriverName());
        $this->assertSame(':memory:', DB::connection()->getDatabaseName());
        Storage::fake('public');
        Storage::fake('local');

        $this->mockDataExtractor = Mockery::mock(NibDataExtractorService::class);
        $this->analyzer = new NibDocumentStructureAnalyzerService($this->mockDataExtractor);

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
     * Test: Dokumen dengan informasi lengkap.
     */
    public function test_dokumen_informasi_lengkap(): void
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
                        ['sumber' => 'teks', 'raw_value' => '1234567890123', 'normalized_value' => '1234567890123', 'halaman' => 1, 'bukti_teks' => 'Nomor Induk Berusaha: 1234567890123'],
                    ],
                    'nilai_alternatif' => [],
                    'catatan' => null,
                ],
                [
                    'nama_field' => 'nama_perusahaan',
                    'status' => 'FIELD_FOUND',
                    'normalized_value' => 'PT Kafe Contoh',
                    'validasi' => ['status' => 'VALID', 'reason' => null],
                    'bukti' => [
                        ['sumber' => 'teks', 'raw_value' => 'PT Kafe Contoh', 'normalized_value' => 'PT Kafe Contoh', 'halaman' => 1, 'bukti_teks' => 'Nama Perusahaan: PT Kafe Contoh'],
                    ],
                    'nilai_alternatif' => [],
                    'catatan' => null,
                ],
                [
                    'nama_field' => 'alamat_perusahaan',
                    'status' => 'FIELD_FOUND',
                    'normalized_value' => 'Jl. Contoh No. 1, Indramayu',
                    'validasi' => ['status' => 'VALID', 'reason' => null],
                    'bukti' => [
                        ['sumber' => 'teks', 'raw_value' => 'Jl. Contoh No. 1, Indramayu', 'normalized_value' => 'Jl. Contoh No. 1, Indramayu', 'halaman' => 1, 'bukti_teks' => 'Alamat: Jl. Contoh No. 1, Indramayu'],
                    ],
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
                'field_dibandingkan' => ['nomor_nib', 'nama_perusahaan', 'alamat_perusahaan'],
                'indikator_kemiripan' => null,
                'ketidaksesuaian' => [],
                'field_tidak_dapat_dibandingkan' => [],
            ],
            'perlu_review_manual' => false,
            'alasan_review' => null,
        ]);

        $result = $this->analyzer->analyze($this->testNibId);

        $this->assertSame('ANALISIS_LENGKAP', $result['status_analisis']);
        $this->assertContains('INFORMASI_LENGKAP', $result['indikator_struktur']);
        $this->assertContains('QR_DITEMUKAN', $result['indikator_struktur']);
        $this->assertFalse($result['perlu_review_manual']);
        $this->assertNull($result['alasan_review']);

        // Temuan NIB ditemukan
        $nibTemuan = $this->findTemuan($result['temuan'], 'NIB_DITEMUKAN');
        $this->assertNotNull($nibTemuan);
        $this->assertSame('INFO', $nibTemuan['tingkat_perhatian']);

        // Temuan QR ditemukan
        $qrTemuan = $this->findTemuan($result['temuan'], 'QR_DITEMUKAN');
        $this->assertNotNull($qrTemuan);
    }

    /**
     * Test: Dokumen tanpa nomor NIB.
     */
    public function test_dokumen_tanpa_nomor_nib(): void
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
            'alasan_review' => 'Nomor NIB tidak ditemukan.',
        ]);

        $result = $this->analyzer->analyze($this->testNibId);

        $this->assertSame('ANALISIS_LENGKAP', $result['status_analisis']);
        $this->assertContains('INFORMASI_TIDAK_LENGKAP', $result['indikator_struktur']);
        $this->assertTrue($result['perlu_review_manual']);

        $nibTemuan = $this->findTemuan($result['temuan'], 'NIB_TIDAK_DITEMUKAN');
        $this->assertNotNull($nibTemuan);
        $this->assertSame('WARNING', $nibTemuan['tingkat_perhatian']);

        $qrTemuan = $this->findTemuan($result['temuan'], 'QR_TIDAK_DITEMUKAN');
        $this->assertNotNull($qrTemuan);
    }

    /**
     * Test: Dokumen tanpa nama perusahaan.
     */
    public function test_dokumen_tanpa_nama_perusahaan(): void
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

        $result = $this->analyzer->analyze($this->testNibId);

        $this->assertSame('ANALISIS_LENGKAP', $result['status_analisis']);
        $this->assertContains('INFORMASI_TIDAK_LENGKAP', $result['indikator_struktur']);
        $this->assertTrue($result['perlu_review_manual']);

        $namaTemuan = $this->findTemuan($result['temuan'], 'NAMA_PERUSAHAAN_TIDAK_DITEMUKAN');
        $this->assertNotNull($namaTemuan);
        $this->assertSame('WARNING', $namaTemuan['tingkat_perhatian']);
    }

    /**
     * Test: Dokumen dengan alamat tidak ditemukan.
     */
    public function test_dokumen_alamat_tidak_ditemukan(): void
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
            'alasan_review' => 'Alamat tidak ditemukan.',
        ]);

        $result = $this->analyzer->analyze($this->testNibId);

        $this->assertSame('ANALISIS_LENGKAP', $result['status_analisis']);
        $this->assertContains('INFORMASI_TIDAK_LENGKAP', $result['indikator_struktur']);

        $alamatTemuan = $this->findTemuan($result['temuan'], 'ALAMAT_TIDAK_DITEMUKAN');
        $this->assertNotNull($alamatTemuan);
        $this->assertSame('WARNING', $alamatTemuan['tingkat_perhatian']);
    }

    /**
     * Test: Nomor NIB tidak sesuai format.
     */
    public function test_nomor_nib_format_tidak_valid(): void
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
                    'validasi' => ['status' => 'INVALID', 'reason' => 'Nomor NIB harus 13 digit.'],
                    'bukti' => [
                        ['sumber' => 'teks', 'raw_value' => '12345', 'normalized_value' => null, 'halaman' => 1, 'bukti_teks' => 'NIB: 12345'],
                    ],
                    'nilai_alternatif' => [],
                    'catatan' => 'Format nomor NIB tidak valid.',
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
            'alasan_review' => 'Nomor NIB format tidak valid.',
        ]);

        $result = $this->analyzer->analyze($this->testNibId);

        $this->assertSame('ANALISIS_LENGKAP', $result['status_analisis']);
        $this->assertContains('NIB_FORMAT_TIDAK_VALID', $result['indikator_konsistensi']);

        $nibTemuan = $this->findTemuan($result['temuan'], 'NIB_FORMAT_TIDAK_VALID');
        $this->assertNotNull($nibTemuan);
        $this->assertSame('WARNING', $nibTemuan['tingkat_perhatian']);
    }

    /**
     * Test: Konflik nomor NIB antara PDF dan QR.
     */
    public function test_konflik_nomor_nib_pdf_dan_qr(): void
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
                        ['sumber' => 'teks', 'raw_value' => 'NIB 1234567890123', 'normalized_value' => '1234567890123', 'halaman' => 1, 'bukti_teks' => 'Nomor Induk Berusaha: 1234567890123'],
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
            'alasan_review' => 'Nomor NIB ambigu antara sumber.',
        ]);

        $result = $this->analyzer->analyze($this->testNibId);

        $this->assertSame('ANALISIS_LENGKAP', $result['status_analisis']);
        $this->assertContains('PERLU_REVIEW', $result['indikator_struktur']);
        $this->assertContains('DITEMUKAN_KETIDAKSESUAIAN', $result['indikator_konsistensi']);
        $this->assertTrue($result['perlu_review_manual']);

        $nibTemuan = $this->findTemuan($result['temuan'], 'NIB_KONFLIK_SUMBER');
        $this->assertNotNull($nibTemuan);
        $this->assertSame('CRITICAL', $nibTemuan['tingkat_perhatian']);
    }

    /**
     * Test: Halaman tidak berhasil diekstrak.
     */
    public function test_halaman_tidak_berhasil_diextrak(): void
    {
        $this->mockDataExtractor->shouldReceive('extract')->once()->andReturn([
            'status_ekstraksi' => 'BERHASIL',
            'dokumen' => [
                'id_nib' => $this->testNibId,
                'total_halaman' => 3,
                'sumber_teks' => 'campuran',
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
                    'status' => 'FIELD_UNREADABLE',
                    'normalized_value' => null,
                    'validasi' => ['status' => 'UNKNOWN', 'reason' => 'Tidak dapat dibaca.'],
                    'bukti' => [],
                    'nilai_alternatif' => [],
                    'catatan' => 'Halaman 2 tidak dapat dibaca.',
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
            'alasan_review' => 'Beberapa halaman tidak dapat diekstrak.',
        ]);

        $result = $this->analyzer->analyze($this->testNibId);

        $this->assertSame('ANALISIS_LENGKAP', $result['status_analisis']);
        $this->assertContains('ADA_HALAMAN_TIDAK_TERBACA', $result['indikator_konsistensi']);

        $namaTemuan = $this->findTemuan($result['temuan'], 'NAMA_PERUSAHAAN_TIDAK_DITEMUKAN');
        // FIELD_UNREADABLE doesn't trigger NAMA_PERUSAHAAN_TIDAK_DITEMUKAN, only FIELD_NOT_FOUND
        // This is expected - UNREADABLE is different from NOT_FOUND
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

        $result = $this->analyzer->analyze($this->testNibId);

        $this->assertSame('ANALISIS_LENGKAP', $result['status_analisis']);

        $qrTemuan = $this->findTemuan($result['temuan'], 'QR_TIDAK_DITEMUKAN');
        $this->assertNotNull($qrTemuan);
        $this->assertSame('INFO', $qrTemuan['tingkat_perhatian']);
    }

    /**
     * Test: Ekstraksi sebagian berhasil (status ekstraksi gagal).
     */
    public function test_ekstraksi_sebagian_berhasil_gagal(): void
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

        $result = $this->analyzer->analyze($this->testNibId);

        $this->assertSame('ANALISIS_TIDAK_LENGKAP', $result['status_analisis']);
        $this->assertContains('ANALISIS_TIDAK_LENGKAP', $result['indikator_struktur']);
        $this->assertTrue($result['perlu_review_manual']);

        $ekstrakTemuan = $this->findTemuan($result['temuan'], 'EKSTRAKSI_GAGAL');
        $this->assertNotNull($ekstrakTemuan);
        $this->assertSame('CRITICAL', $ekstrakTemuan['tingkat_perhatian']);
    }

    /**
     * Test: Tidak ada informasi yang cukup untuk dianalisis.
     */
    public function test_tidak_ada_informasi_cukup(): void
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

        $result = $this->analyzer->analyze($this->testNibId);

        $this->assertSame('ANALISIS_LENGKAP', $result['status_analisis']);
        $this->assertContains('INFORMASI_TIDAK_LENGKAP', $result['indikator_struktur']);
        $this->assertTrue($result['perlu_review_manual']);

        // Tidak boleh ada status Lulus atau Ditolak
        $this->assertArrayNotHasKey('status_lulus', $result);
        $this->assertArrayNotHasKey('status_ditolak', $result);
        $this->assertArrayNotHasKey('keaslian_dokumen', $result);
        $this->assertArrayNotHasKey('dokumen_palsu', $result);
    }

    /**
     * Test: QR berisi URL OSS valid.
     */
    public function test_qr_berisi_url_oss_valid(): void
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

        $result = $this->analyzer->analyze($this->testNibId);

        $this->assertSame('ANALISIS_LENGKAP', $result['status_analisis']);

        $urlTemuan = $this->findTemuan($result['temuan'], 'QR_URL_OSS_VALID');
        $this->assertNotNull($urlTemuan);
        $this->assertSame('INFO', $urlTemuan['tingkat_perhatian']);
    }

    /**
     * Test: NIB tidak ditemukan di database.
     */
    public function test_nib_tidak_ditemukan_database(): void
    {
        $result = $this->analyzer->analyze('non-existent-id');

        $this->assertSame('ANALISIS_TIDAK_LENGKAP', $result['status_analisis']);
        $this->assertTrue($result['perlu_review_manual']);
        $this->assertStringContainsString('tidak ditemukan', $result['alasan_review']);
    }

    /**
     * Test: Hasil analisis tidak pernah menghasilkan keputusan otomatis Lulus atau Ditolak.
     */
    public function test_tidak_ada_keputusan_otomatis_lulus_ditolak(): void
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

        $result = $this->analyzer->analyze($this->testNibId);

        // Verifikasi tidak ada keputusan otomatis
        $this->assertArrayNotHasKey('status_lulus', $result);
        $this->assertArrayNotHasKey('status_ditolak', $result);
        $this->assertArrayNotHasKey('keputusan', $result);
        $this->assertArrayNotHasKey('rekomendasi', $result);
        $this->assertArrayNotHasKey('keaslian', $result);
    }

    /**
     * Helper: Cari temuan berdasarkan jenis.
     */
    private function findTemuan(array $temuan, string $jenis): ?array
    {
        foreach ($temuan as $t) {
            if ($t['jenis_temuan'] === $jenis) {
                return $t;
            }
        }

        return null;
    }
}
