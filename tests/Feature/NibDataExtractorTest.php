<?php

namespace Tests\Feature;

use App\Services\Nib\NibDataExtractorService;
use App\Services\Nib\NibOcrService;
use App\Services\Nib\NibPdfExtractorService;
use App\Services\Nib\NibQrDecoderService;
use App\Services\Nib\NibQrUrlValidatorService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Mockery;
use Tests\TestCase;

class NibDataExtractorTest extends TestCase
{
    use RefreshDatabase;
    private NibDataExtractorService $extractor;
    private \Mockery\MockInterface $mockPdfExtractor;
    private \Mockery\MockInterface $mockOcrService;
    private \Mockery\MockInterface $mockQrDecoder;
    private \Mockery\MockInterface $mockUrlValidator;

    private string $testNibId = 'test-nib-id';

    protected function setUp(): void
    {
        parent::setUp();
        $this->assertSame('sqlite', DB::connection()->getDriverName());
        $this->assertSame(':memory:', DB::connection()->getDatabaseName());
        Storage::fake('public');
        Storage::fake('local');

        $this->mockPdfExtractor = Mockery::mock(NibPdfExtractorService::class);
        $this->mockOcrService = Mockery::mock(NibOcrService::class);
        $this->mockQrDecoder = Mockery::mock(NibQrDecoderService::class);
        $this->mockUrlValidator = Mockery::mock(NibQrUrlValidatorService::class);

        $this->extractor = new NibDataExtractorService(
            $this->mockPdfExtractor,
            $this->mockOcrService,
            $this->mockQrDecoder,
            $this->mockUrlValidator
        );

        $this->createNibRecord();
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

protected function tearDown(): void
{
        parent::tearDown();
        Mockery::close();
    }

    /**
     * Test: PDF digital berhasil diekstrak dengan teks lengkap.
     */
    public function test_pdf_digital_berhasil_diextrak(): void
    {
        $this->mockPdfExtractor->shouldReceive('extract')->once()->andReturn([
            'status' => NibPdfExtractorService::STATUS_TEXT_EXTRACTED,
            'page_count' => 1,
            'has_extractable_text' => true,
            'pages' => [
                ['page' => 1, 'text' => "Nomor Induk Berusaha: 1234567890123
Nama Perusahaan: PT Kafe Contoh
Alamat: Jl. Contoh No. 1, Indramayu"],
            ],
            'full_text' => 'Nomor Induk Berusaha: 1234567890123\nNama Perusahaan: PT Kafe Contoh\nAlamat: Jl. Contoh No. 1, Indramayu',
            'error' => null,
        ]);

        $this->mockQrDecoder->shouldReceive('decode')->once()->andReturn([
            'status' => NibQrDecoderService::STATUS_QR_NOT_FOUND,
            'decoded_content' => null,
            'error' => 'QR tidak ditemukan',
        ]);

        $result = $this->extractor->extract($this->testNibId);

        $this->assertSame('BERHASIL', $result['status_ekstraksi']);
        $this->assertEquals($this->testNibId, $result['dokumen']['id_nib']);
        $this->assertEquals(1, $result['dokumen']['total_halaman']);
        $this->assertSame('pdf', $result['dokumen']['sumber_teks']);
        $this->assertFalse($result['perlu_review_manual']);

        $nomorNibField = $this->findField($result['fields'], 'nomor_nib');
        $this->assertSame('FIELD_FOUND', $nomorNibField['status']);
        $this->assertSame('1234567890123', $nomorNibField['normalized_value']);
    }

    /**
     * Test: PDF scan membutuhkan OCR.
     */
    public function test_pdf_scan_memerlukan_ocr(): void
    {
        $this->mockPdfExtractor->shouldReceive('extract')->once()->andReturn([
            'status' => NibPdfExtractorService::STATUS_OCR_REQUIRED,
            'page_count' => 1,
            'has_extractable_text' => false,
            'pages' => [
                ['page' => 1, 'text' => ''],
            ],
            'full_text' => '',
            'error' => null,
        ]);

        $this->mockOcrService->shouldReceive('ocr')->once()->andReturn([
            'status' => NibOcrService::STATUS_OCR_COMPLETED,
            'page_count' => 1,
            'has_extractable_text' => true,
            'pages' => [
                ['page' => 1, 'text' => 'Nomor Induk Berusaha: 9876543210987
Nama Perusahaan: CV Kafe Lain'],
            ],
            'full_text' => 'Nomor Induk Berusaha: 9876543210987\nNama Perusahaan: CV Kafe Lain',
            'error' => null,
        ]);

        $this->mockQrDecoder->shouldReceive('decode')->once()->andReturn([
            'status' => NibQrDecoderService::STATUS_QR_NOT_FOUND,
            'decoded_content' => null,
            'error' => 'QR tidak ditemukan',
        ]);

        $result = $this->extractor->extract($this->testNibId);

        $this->assertSame('BERHASIL', $result['status_ekstraksi']);
        $this->assertSame('ocr', $result['dokumen']['sumber_teks']);

        $nomorNibField = $this->findField($result['fields'], 'nomor_nib');
        $this->assertSame('FIELD_FOUND', $nomorNibField['status']);
        $this->assertSame('9876543210987', $nomorNibField['normalized_value']);
    }

    /**
     * Test: PDF campuran - halaman digital dan halaman scan.
     */
    public function test_pdf_campuran_digital_dan_scan(): void
    {
        $this->mockPdfExtractor->shouldReceive('extract')->once()->andReturn([
            'status' => NibPdfExtractorService::STATUS_TEXT_EXTRACTED,
            'page_count' => 2,
            'has_extractable_text' => true,
            'pages' => [
                ['page' => 1, 'text' => 'Nomor Induk Berusaha: 1112223334444
Nama Perusahaan: PT Kafe Satu'],
                ['page' => 2, 'text' => ''],
            ],
            'full_text' => 'Nomor Induk Berusaha: 1112223334444\nNama Perusahaan: PT Kafe Satu',
            'error' => null,
        ]);

        $this->mockOcrService->shouldReceive('ocr')->once()->andReturn([
            'status' => NibOcrService::STATUS_OCR_COMPLETED,
            'page_count' => 2,
            'has_extractable_text' => true,
            'pages' => [
                ['page' => 1, 'text' => 'Nomor Induk Berusaha: 1112223334444
Nama Perusahaan: PT Kafe Satu'],
                ['page' => 2, 'text' => 'Alamat: Jl. Scan Halaman Dua'],
            ],
            'full_text' => 'Nomor Induk Berusaha: 1112223334444\nNama Perusahaan: PT Kafe Satu\nAlamat: Jl. Scan Halaman Dua',
            'error' => null,
        ]);

        $this->mockQrDecoder->shouldReceive('decode')->once()->andReturn([
            'status' => NibQrDecoderService::STATUS_QR_NOT_FOUND,
            'decoded_content' => null,
            'error' => 'QR tidak ditemukan',
        ]);

        $result = $this->extractor->extract($this->testNibId);

        $this->assertSame('BERHASIL', $result['status_ekstraksi']);
        $this->assertSame('campuran', $result['dokumen']['sumber_teks']);

        $alamatField = $this->findField($result['fields'], 'alamat_perusahaan');
        $this->assertSame('FIELD_FOUND', $alamatField['status']);
        $this->assertSame('Jl. Scan Halaman Dua', $alamatField['normalized_value']);
    }

    /**
     * Test: OCR tidak tersedia tetapi PDF masih memiliki teks.
     */
    public function test_ocr_tidak_tersedia_tetapi_pdf_memiliki_teks(): void
    {
        $this->mockPdfExtractor->shouldReceive('extract')->once()->andReturn([
            'status' => NibPdfExtractorService::STATUS_TEXT_EXTRACTED,
            'page_count' => 1,
            'has_extractable_text' => true,
            'pages' => [
                ['page' => 1, 'text' => 'Nomor Induk Berusaha: 5556667778888'],
            ],
            'full_text' => 'Nomor Induk Berusaha: 5556667778888',
            'error' => null,
        ]);

        $this->mockQrDecoder->shouldReceive('decode')->once()->andReturn([
            'status' => NibQrDecoderService::STATUS_QR_NOT_FOUND,
            'decoded_content' => null,
            'error' => 'QR tidak ditemukan',
        ]);

        $result = $this->extractor->extract($this->testNibId);

        $this->assertSame('BERHASIL', $result['status_ekstraksi']);
        $this->assertSame('pdf', $result['dokumen']['sumber_teks']);

        $nomorNibField = $this->findField($result['fields'], 'nomor_nib');
        $this->assertSame('FIELD_FOUND', $nomorNibField['status']);
        $this->assertSame('5556667778888', $nomorNibField['normalized_value']);
    }

    /**
     * Test: PDF invalid.
     */
    public function test_pdf_invalid(): void
    {
        $this->mockPdfExtractor->shouldReceive('extract')->once()->andReturn([
            'status' => NibPdfExtractorService::STATUS_INVALID_PDF,
            'page_count' => null,
            'has_extractable_text' => null,
            'pages' => null,
            'full_text' => null,
            'error' => 'File bukan PDF yang didukung.',
        ]);

        $result = $this->extractor->extract($this->testNibId);

        $this->assertSame('GAGAL', $result['status_ekstraksi']);
        $this->assertTrue($result['perlu_review_manual']);
        $this->assertNotNull($result['alasan_review']);
    }

    /**
     * Test: Nomor NIB valid 13 digit.
     */
    public function test_nomor_nib_valid_13_digit(): void
    {
        $this->mockPdfExtractor->shouldReceive('extract')->once()->andReturn([
            'status' => NibPdfExtractorService::STATUS_TEXT_EXTRACTED,
            'page_count' => 1,
            'has_extractable_text' => true,
            'pages' => [
                ['page' => 1, 'text' => 'NIB 1234567890123'],
            ],
            'full_text' => 'NIB 1234567890123',
            'error' => null,
        ]);

        $this->mockQrDecoder->shouldReceive('decode')->once()->andReturn([
            'status' => NibQrDecoderService::STATUS_QR_NOT_FOUND,
            'decoded_content' => null,
            'error' => 'QR tidak ditemukan',
        ]);

        $result = $this->extractor->extract($this->testNibId);

        $nomorNibField = $this->findField($result['fields'], 'nomor_nib');
        $this->assertSame('FIELD_FOUND', $nomorNibField['status']);
        $this->assertSame('1234567890123', $nomorNibField['normalized_value']);
        $this->assertSame('VALID', $nomorNibField['validasi']['status']);
    }

    /**
     * Test: Nomor NIB kurang dari 13 digit.
     */
    public function test_nomor_nib_kurang_dari_13_digit(): void
    {
        $this->mockPdfExtractor->shouldReceive('extract')->once()->andReturn([
            'status' => NibPdfExtractorService::STATUS_TEXT_EXTRACTED,
            'page_count' => 1,
            'has_extractable_text' => true,
            'pages' => [
                ['page' => 1, 'text' => 'NIB 123456'],
            ],
            'full_text' => 'NIB 123456',
            'error' => null,
        ]);

        $this->mockQrDecoder->shouldReceive('decode')->once()->andReturn([
            'status' => NibQrDecoderService::STATUS_QR_NOT_FOUND,
            'decoded_content' => null,
            'error' => 'QR tidak ditemukan',
        ]);

        $result = $this->extractor->extract($this->testNibId);

        $nomorNibField = $this->findField($result['fields'], 'nomor_nib');
        $this->assertSame('FIELD_INVALID', $nomorNibField['status']);
        $this->assertSame('INVALID', $nomorNibField['validasi']['status']);
    }

    /**
     * Test: Nomor NIB lebih dari 13 digit.
     */
    public function test_nomor_nib_lebih_dari_13_digit(): void
    {
        $this->mockPdfExtractor->shouldReceive('extract')->once()->andReturn([
            'status' => NibPdfExtractorService::STATUS_TEXT_EXTRACTED,
            'page_count' => 1,
            'has_extractable_text' => true,
            'pages' => [
                ['page' => 1, 'text' => 'NIB 123456789012345'],
            ],
            'full_text' => 'NIB 123456789012345',
            'error' => null,
        ]);

        $this->mockQrDecoder->shouldReceive('decode')->once()->andReturn([
            'status' => NibQrDecoderService::STATUS_QR_NOT_FOUND,
            'decoded_content' => null,
            'error' => 'QR tidak ditemukan',
        ]);

        $result = $this->extractor->extract($this->testNibId);

        $nomorNibField = $this->findField($result['fields'], 'nomor_nib');
        $this->assertSame('FIELD_INVALID', $nomorNibField['status']);
    }

    /**
     * Test: Nomor NIB mengandung karakter OCR ambigu (huruf di antara digit).
     */
    public function test_nomor_nib_mengandung_karakter_ambigu(): void
    {
        $this->mockPdfExtractor->shouldReceive('extract')->once()->andReturn([
            'status' => NibPdfExtractorService::STATUS_TEXT_EXTRACTED,
            'page_count' => 1,
            'has_extractable_text' => true,
            'pages' => [
                ['page' => 1, 'text' => 'NIB 1234O6789012I'],
            ],
            'full_text' => 'NIB 1234O6789012I',
            'error' => null,
        ]);

        $this->mockQrDecoder->shouldReceive('decode')->once()->andReturn([
            'status' => NibQrDecoderService::STATUS_QR_NOT_FOUND,
            'decoded_content' => null,
            'error' => 'QR tidak ditemukan',
        ]);

        $result = $this->extractor->extract($this->testNibId);

        $nomorNibField = $this->findField($result['fields'], 'nomor_nib');
        $this->assertSame('FIELD_INVALID', $nomorNibField['status']);
        // Karakter O dan I tidak diubah secara otomatis
        $this->assertStringContainsString('O', $nomorNibField['bukti'][0]['raw_value']);
        $this->assertStringContainsString('I', $nomorNibField['bukti'][0]['raw_value']);
    }

    /**
     * Test: Nama perusahaan ditemukan.
     */
    public function test_nama_perusahaan_ditemukan(): void
    {
        $this->mockPdfExtractor->shouldReceive('extract')->once()->andReturn([
            'status' => NibPdfExtractorService::STATUS_TEXT_EXTRACTED,
            'page_count' => 1,
            'has_extractable_text' => true,
            'pages' => [
                ['page' => 1, 'text' => 'Nama Perusahaan: PT Kafe Contoh'],
            ],
            'full_text' => 'Nama Perusahaan: PT Kafe Contoh',
            'error' => null,
        ]);

        $this->mockQrDecoder->shouldReceive('decode')->once()->andReturn([
            'status' => NibQrDecoderService::STATUS_QR_NOT_FOUND,
            'decoded_content' => null,
            'error' => 'QR tidak ditemukan',
        ]);

        $result = $this->extractor->extract($this->testNibId);

        $namaField = $this->findField($result['fields'], 'nama_perusahaan');
        $this->assertSame('FIELD_FOUND', $namaField['status']);
        $this->assertSame('PT Kafe Contoh', $namaField['normalized_value']);
    }

    /**
     * Test: Alamat perusahaan ditemukan.
     */
    public function test_alamat_perusahaan_ditemukan(): void
    {
        $this->mockPdfExtractor->shouldReceive('extract')->once()->andReturn([
            'status' => NibPdfExtractorService::STATUS_TEXT_EXTRACTED,
            'page_count' => 1,
            'has_extractable_text' => true,
            'pages' => [
                ['page' => 1, 'text' => 'Alamat: Jl. Contoh No. 1, Indramayu'],
            ],
            'full_text' => 'Alamat: Jl. Contoh No. 1, Indramayu',
            'error' => null,
        ]);

        $this->mockQrDecoder->shouldReceive('decode')->once()->andReturn([
            'status' => NibQrDecoderService::STATUS_QR_NOT_FOUND,
            'decoded_content' => null,
            'error' => 'QR tidak ditemukan',
        ]);

        $result = $this->extractor->extract($this->testNibId);

        $alamatField = $this->findField($result['fields'], 'alamat_perusahaan');
        $this->assertSame('FIELD_FOUND', $alamatField['status']);
        $this->assertSame('Jl. Contoh No. 1, Indramayu', $alamatField['normalized_value']);
    }

    /**
     * Test: Tanggal berdiri tidak ditemukan.
     */
    public function test_tanggal_berdiri_tidak_ditemukan(): void
    {
        $this->mockPdfExtractor->shouldReceive('extract')->once()->andReturn([
            'status' => NibPdfExtractorService::STATUS_TEXT_EXTRACTED,
            'page_count' => 1,
            'has_extractable_text' => true,
            'pages' => [
                ['page' => 1, 'text' => 'Nomor Induk Berusaha: 1234567890123'],
            ],
            'full_text' => 'Nomor Induk Berusaha: 1234567890123',
            'error' => null,
        ]);

        $this->mockQrDecoder->shouldReceive('decode')->once()->andReturn([
            'status' => NibQrDecoderService::STATUS_QR_NOT_FOUND,
            'decoded_content' => null,
            'error' => 'QR tidak ditemukan',
        ]);

        $result = $this->extractor->extract($this->testNibId);

        $tanggalField = $this->findField($result['fields'], 'tanggal_berdiri');
        $this->assertSame('FIELD_NOT_FOUND', $tanggalField['status']);
        $this->assertNull($tanggalField['normalized_value']);
    }

    /**
     * Test: Kecamatan tidak ditemukan.
     */
    public function test_kecamatan_tidak_ditemukan(): void
    {
        $this->mockPdfExtractor->shouldReceive('extract')->once()->andReturn([
            'status' => NibPdfExtractorService::STATUS_TEXT_EXTRACTED,
            'page_count' => 1,
            'has_extractable_text' => true,
            'pages' => [
                ['page' => 1, 'text' => 'Nomor Induk Berusaha: 1234567890123'],
            ],
            'full_text' => 'Nomor Induk Berusaha: 1234567890123',
            'error' => null,
        ]);

        $this->mockQrDecoder->shouldReceive('decode')->once()->andReturn([
            'status' => NibQrDecoderService::STATUS_QR_NOT_FOUND,
            'decoded_content' => null,
            'error' => 'QR tidak ditemukan',
        ]);

        $result = $this->extractor->extract($this->testNibId);

        $kecamatanField = $this->findField($result['fields'], 'kecamatan');
        $this->assertSame('FIELD_NOT_FOUND', $kecamatanField['status']);
        $this->assertNull($kecamatanField['normalized_value']);
    }

    /**
     * Test: QR berisi URL.
     */
    public function test_qr_berisi_url(): void
    {
        $this->mockPdfExtractor->shouldReceive('extract')->once()->andReturn([
            'status' => NibPdfExtractorService::STATUS_TEXT_EXTRACTED,
            'page_count' => 1,
            'has_extractable_text' => true,
            'pages' => [
                ['page' => 1, 'text' => 'Nomor Induk Berusaha: 1234567890123'],
            ],
            'full_text' => 'Nomor Induk Berusaha: 1234567890123',
            'error' => null,
        ]);

        $this->mockQrDecoder->shouldReceive('decode')->once()->andReturn([
            'status' => NibQrDecoderService::STATUS_QR_FOUND,
            'decoded_content' => 'https://oss.go.id/verify/nib/1234567890123',
            'error' => null,
        ]);

        $this->mockUrlValidator->shouldReceive('validate')->once()->andReturn([
            'status' => NibQrUrlValidatorService::STATUS_OSS_URL_VALID,
            'is_valid' => true,
            'is_oss_domain' => true,
            'scheme' => 'https',
            'host' => 'oss.go.id',
            'normalized_url' => 'https://oss.go.id/verify/nib/1234567890123',
            'reason' => 'URL HTTPS valid dengan host OSS terverifikasi.',
        ]);

        $result = $this->extractor->extract($this->testNibId);

        $this->assertTrue($result['qr']['ditemukan']);
        $this->assertSame('url', $result['qr']['jenis']);
        $this->assertSame('https://oss.go.id/verify/nib/1234567890123', $result['qr']['url_validasi']['normalized_url']);
    }

    /**
     * Test: QR berisi teks biasa.
     */
    public function test_qr_berisi_teks_biasa(): void
    {
        $this->mockPdfExtractor->shouldReceive('extract')->once()->andReturn([
            'status' => NibPdfExtractorService::STATUS_TEXT_EXTRACTED,
            'page_count' => 1,
            'has_extractable_text' => true,
            'pages' => [
                ['page' => 1, 'text' => 'Nomor Induk Berusaha: 1234567890123'],
            ],
            'full_text' => 'Nomor Induk Berusaha: 1234567890123',
            'error' => null,
        ]);

        $this->mockQrDecoder->shouldReceive('decode')->once()->andReturn([
            'status' => NibQrDecoderService::STATUS_QR_FOUND,
            'decoded_content' => 'NIB 1234567890123',
            'error' => null,
        ]);

        $this->mockUrlValidator->shouldReceive('validate')->once()->andReturn([
            'status' => NibQrUrlValidatorService::STATUS_NON_URL_CONTENT,
            'is_valid' => false,
            'is_oss_domain' => false,
            'scheme' => null,
            'host' => null,
            'normalized_url' => null,
            'reason' => 'Input tidak menggunakan skema URL, dianggap teks biasa.',
        ]);

        $result = $this->extractor->extract($this->testNibId);

        $this->assertTrue($result['qr']['ditemukan']);
        $this->assertSame('teks', $result['qr']['jenis']);
        $this->assertSame('NIB 1234567890123', $result['qr']['konten']);
    }

    /**
     * Test: QR tidak ditemukan.
     */
    public function test_qr_tidak_ditemukan(): void
    {
        $this->mockPdfExtractor->shouldReceive('extract')->once()->andReturn([
            'status' => NibPdfExtractorService::STATUS_TEXT_EXTRACTED,
            'page_count' => 1,
            'has_extractable_text' => true,
            'pages' => [
                ['page' => 1, 'text' => 'Nomor Induk Berusaha: 1234567890123'],
            ],
            'full_text' => 'Nomor Induk Berusaha: 1234567890123',
            'error' => null,
        ]);

        $this->mockQrDecoder->shouldReceive('decode')->once()->andReturn([
            'status' => NibQrDecoderService::STATUS_QR_NOT_FOUND,
            'decoded_content' => null,
            'error' => 'QR Code tidak ditemukan.',
        ]);

        $result = $this->extractor->extract($this->testNibId);

        $this->assertFalse($result['qr']['ditemukan']);
        $this->assertNull($result['qr']['konten']);
        // Ekstraksi teks tetap berhasil meski QR tidak ditemukan
        $this->assertSame('BERHASIL', $result['status_ekstraksi']);
    }

    /**
     * Test: PDF dan QR menghasilkan nomor NIB yang sama.
     */
    public function test_pdf_dan_qr_nomor_nib_sama(): void
    {
        $this->mockPdfExtractor->shouldReceive('extract')->once()->andReturn([
            'status' => NibPdfExtractorService::STATUS_TEXT_EXTRACTED,
            'page_count' => 1,
            'has_extractable_text' => true,
            'pages' => [
                ['page' => 1, 'text' => 'Nomor Induk Berusaha: 1234567890123'],
            ],
            'full_text' => 'Nomor Induk Berusaha: 1234567890123',
            'error' => null,
        ]);

        $this->mockQrDecoder->shouldReceive('decode')->once()->andReturn([
            'status' => NibQrDecoderService::STATUS_QR_FOUND,
            'decoded_content' => 'NIB 1234567890123',
            'error' => null,
        ]);

        $this->mockUrlValidator->shouldReceive('validate')->once()->andReturn([
            'status' => NibQrUrlValidatorService::STATUS_NON_URL_CONTENT,
            'is_valid' => false,
            'is_oss_domain' => false,
            'scheme' => null,
            'host' => null,
            'normalized_url' => null,
            'reason' => 'Input tidak menggunakan skema URL, dianggap teks biasa.',
        ]);

        $result = $this->extractor->extract($this->testNibId);

        $nomorNibField = $this->findField($result['fields'], 'nomor_nib');
        $this->assertSame('FIELD_FOUND', $nomorNibField['status']);
        $this->assertSame('1234567890123', $nomorNibField['normalized_value']);
        // Harus ada bukti dari kedua sumber (teks dan QR)
        $sumberBukti = array_column($nomorNibField['bukti'], 'sumber');
        $this->assertContains('teks', $sumberBukti);
        $this->assertContains('qr', $sumberBukti);
    }

    /**
     * Test: PDF dan QR menghasilkan nomor NIB berbeda (FIELD_AMBIGUOUS).
     */
    public function test_pdf_dan_qr_nomor_nib_berbeda(): void
    {
        $this->mockPdfExtractor->shouldReceive('extract')->once()->andReturn([
            'status' => NibPdfExtractorService::STATUS_TEXT_EXTRACTED,
            'page_count' => 1,
            'has_extractable_text' => true,
            'pages' => [
                ['page' => 1, 'text' => 'Nomor Induk Berusaha: 1234567890123'],
            ],
            'full_text' => 'Nomor Induk Berusaha: 1234567890123',
            'error' => null,
        ]);

        $this->mockQrDecoder->shouldReceive('decode')->once()->andReturn([
            'status' => NibQrDecoderService::STATUS_QR_FOUND,
            'decoded_content' => 'NIB 9998887776666',
            'error' => null,
        ]);

        $this->mockUrlValidator->shouldReceive('validate')->once()->andReturn([
            'status' => NibQrUrlValidatorService::STATUS_NON_URL_CONTENT,
            'is_valid' => false,
            'is_oss_domain' => false,
            'scheme' => null,
            'host' => null,
            'normalized_url' => null,
            'reason' => 'Input tidak menggunakan skema URL, dianggap teks biasa.',
        ]);

        $result = $this->extractor->extract($this->testNibId);

        $nomorNibField = $this->findField($result['fields'], 'nomor_nib');
        $this->assertSame('FIELD_AMBIGUOUS', $nomorNibField['status']);
        $this->assertSame('AMBIGUOUS', $nomorNibField['validasi']['status']);
        $this->assertTrue($result['perlu_review_manual']);
    }

    /**
     * Test: Field tidak ditemukan sama sekali.
     */
    public function test_field_tidak_ditemukan(): void
    {
        $this->mockPdfExtractor->shouldReceive('extract')->once()->andReturn([
            'status' => NibPdfExtractorService::STATUS_TEXT_EXTRACTED,
            'page_count' => 1,
            'has_extractable_text' => true,
            'pages' => [
                ['page' => 1, 'text' => 'Ini adalah teks acak tanpa informasi NIB.'],
            ],
            'full_text' => 'Ini adalah teks acak tanpa informasi NIB.',
            'error' => null,
        ]);

        $this->mockQrDecoder->shouldReceive('decode')->once()->andReturn([
            'status' => NibQrDecoderService::STATUS_QR_NOT_FOUND,
            'decoded_content' => null,
            'error' => 'QR tidak ditemukan',
        ]);

        $result = $this->extractor->extract($this->testNibId);

        $nomorNibField = $this->findField($result['fields'], 'nomor_nib');
        $this->assertSame('FIELD_NOT_FOUND', $nomorNibField['status']);
        $this->assertNull($nomorNibField['normalized_value']);
    }

    /**
     * Test: Data pembanding tidak tersedia.
     */
    public function test_data_pembanding_tidak_tersedia(): void
    {
        $this->mockPdfExtractor->shouldReceive('extract')->once()->andReturn([
            'status' => NibPdfExtractorService::STATUS_TEXT_EXTRACTED,
            'page_count' => 1,
            'has_extractable_text' => true,
            'pages' => [
                ['page' => 1, 'text' => 'Nomor Induk Berusaha: 1234567890123
Nama Perusahaan: PT Kafe Contoh'],
            ],
            'full_text' => 'Nomor Induk Berusaha: 1234567890123\nNama Perusahaan: PT Kafe Contoh',
            'error' => null,
        ]);

        $this->mockQrDecoder->shouldReceive('decode')->once()->andReturn([
            'status' => NibQrDecoderService::STATUS_QR_NOT_FOUND,
            'decoded_content' => null,
            'error' => 'QR tidak ditemukan',
        ]);

        // Panggil tanpa profilPerusahaan
        $result = $this->extractor->extract($this->testNibId, null);

        $this->assertContains('nama_perusahaan', $result['perbandingan']['field_tidak_dapat_dibandingkan']);
        $this->assertNull($result['perbandingan']['indikator_kemiripan']);
    }

    /**
     * Test: Perbedaan nama atau alamat ditampilkan sebagai indikator, bukan keputusan penolakan.
     */
    public function test_perbedaan_nama_ditampilkan_sebagai_indikator(): void
    {
        $this->mockPdfExtractor->shouldReceive('extract')->once()->andReturn([
            'status' => NibPdfExtractorService::STATUS_TEXT_EXTRACTED,
            'page_count' => 1,
            'has_extractable_text' => true,
            'pages' => [
                ['page' => 1, 'text' => "Nomor Induk Berusaha: 1234567890123
Nama Perusahaan: PT Kafe Lain
Alamat: Jl. Lain No. 2"],
            ],
            'full_text' => 'Nomor Induk Berusaha: 1234567890123\nNama Perusahaan: PT Kafe Lain\nAlamat: Jl. Lain No. 2',
            'error' => null,
        ]);

        $this->mockQrDecoder->shouldReceive('decode')->once()->andReturn([
            'status' => NibQrDecoderService::STATUS_QR_NOT_FOUND,
            'decoded_content' => null,
            'error' => 'QR tidak ditemukan',
        ]);

        // Buat profil perusahaan di database dengan data berbeda
        $profil = \App\Models\ProfilPerusahaan::create([
            'id_pengguna' => 1,
            'nama_perusahaan' => 'PT Kafe Contoh',
            'alamat_perusahaan' => 'Jl. Contoh No. 1',
            'status_verifikasi' => 'Pending',
        ]);

        $result = $this->extractor->extract($this->testNibId, $profil);

        // Harus ada ketidaksesuaian dalam perbandingan
        $this->assertCount(2, $result['perbandingan']['ketidaksesuaian']);
        $this->assertTrue($result['perlu_review_manual']);
        // Tidak boleh ada status penolakan - hanya indikator
        $this->assertArrayNotHasKey('status_penolakan', $result);
        $this->assertArrayNotHasKey('disetujui', $result);
    }

    /**
     * Test: Tidak ada perubahan database akibat proses ekstraksi.
     */
    public function test_tidak_ada_perubahan_database(): void
    {
        $this->mockPdfExtractor->shouldReceive('extract')->once()->andReturn([
            'status' => NibPdfExtractorService::STATUS_TEXT_EXTRACTED,
            'page_count' => 1,
            'has_extractable_text' => true,
            'pages' => [
                ['page' => 1, 'text' => 'Nomor Induk Berusaha: 1234567890123'],
            ],
            'full_text' => 'Nomor Induk Berusaha: 1234567890123',
            'error' => null,
        ]);

        $this->mockQrDecoder->shouldReceive('decode')->once()->andReturn([
            'status' => NibQrDecoderService::STATUS_QR_NOT_FOUND,
            'decoded_content' => null,
            'error' => 'QR tidak ditemukan',
        ]);

        $nibCountBefore = \App\Models\Nib::count();
        $profilCountBefore = \App\Models\ProfilPerusahaan::count();

        $result = $this->extractor->extract($this->testNibId);

        $nibCountAfter = \App\Models\Nib::count();
        $profilCountAfter = \App\Models\ProfilPerusahaan::count();

        $this->assertSame($nibCountBefore, $nibCountAfter);
        $this->assertSame($profilCountBefore, $profilCountAfter);
    }

    /**
     * Test: PDF gagal diekstrak sepenuhnya.
     */
    public function test_pdf_gagal_diextrak(): void
    {
        $this->mockPdfExtractor->shouldReceive('extract')->once()->andReturn([
            'status' => NibPdfExtractorService::STATUS_EXTRACTION_FAILED,
            'page_count' => null,
            'has_extractable_text' => null,
            'pages' => null,
            'full_text' => null,
            'error' => 'Gagal mengekstrak teks dari PDF.',
        ]);

        $result = $this->extractor->extract($this->testNibId);

        $this->assertSame('GAGAL', $result['status_ekstraksi']);
        $this->assertTrue($result['perlu_review_manual']);
        $this->assertNotNull($result['alasan_review']);
    }

    /**
     * Test: NIB tidak ditemukan di database.
     */
    public function test_nib_tidak_ditemukan(): void
    {
        $result = $this->extractor->extract('non-existent-id');

        $this->assertSame('GAGAL', $result['status_ekstraksi']);
        $this->assertTrue($result['perlu_review_manual']);
        $this->assertStringContainsString('tidak ditemukan', $result['alasan_review']);
    }

    /**
     * Helper: Cari field berdasarkan nama.
     */
    private function findField(array $fields, string $namaField): array
    {
        foreach ($fields as $field) {
            if ($field['nama_field'] === $namaField) {
                return $field;
            }
        }

        $this->fail('Field "' . $namaField . '" tidak ditemukan dalam hasil ekstraksi.');
    }
}
