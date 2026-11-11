<?php

namespace Tests\Feature;

use App\Models\Nib;
use App\Models\Pengguna;
use App\Models\ProfilPerusahaan;
use App\Services\Nib\NibPdfExtractorService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class NibPdfExtractorTest extends TestCase
{
    use RefreshDatabase;

    private NibPdfExtractorService $extractor;

    protected function setUp(): void
    {
        parent::setUp();
        $this->assertSame('sqlite', DB::connection()->getDriverName());
        $this->assertSame(':memory:', DB::connection()->getDatabaseName());
        Storage::fake('public');
        Storage::fake('local');
        $this->extractor = new NibPdfExtractorService();
    }

    /**
     * Buat PDF digital sederhana dengan teks yang dapat diekstrak.
     */
    private function createValidPdf(string $text): string
    {
        $contentStream = 'BT /F1 12 Tf 72 712 Td (' . addslashes($text) . ") Tj ET";
        $contentLength = strlen($contentStream);

        $offsets = [];
        $pdf = "%PDF-1.4\n";

        // Object 1: Catalog
        $offsets[1] = strlen($pdf);
        $pdf .= "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n";

        // Object 2: Pages
        $offsets[2] = strlen($pdf);
        $pdf .= "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n";

        // Object 3: Page
        $offsets[3] = strlen($pdf);
        $pdf .= "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n";

        // Object 4: Content stream
        $offsets[4] = strlen($pdf);
        $pdf .= "4 0 obj\n<< /Length $contentLength >>\nstream\n$contentStream\nendstream\nendobj\n";

        // Xref
        $xrefOffset = strlen($pdf);
        $pdf .= "xref\n";
        $pdf .= "0 5\n";
        $pdf .= "0000000000 65535 f \n";
        foreach ($offsets as $objNum => $offset) {
            $pdf .= sprintf("%010d 00000 n \n", $offset);
        }

        // Trailer
        $pdf .= "trailer\n";
        $pdf .= "<< /Size 5 /Root 1 0 R >>\n";
        $pdf .= "startxref\n";
        $pdf .= $xrefOffset . "\n";
        $pdf .= "%%EOF\n";

        return $pdf;
    }

    /**
     * Buat record NIB dengan file PDF di private storage.
     */
    private function setupNibWithPdf(string $pdfContent, string $filename = 'test.pdf'): array
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

        $profilPerusahaan = ProfilPerusahaan::create([
            'id_pengguna' => $pengguna->id_pengguna,
            'nama_perusahaan' => 'Kafe Uji',
            'alamat_perusahaan' => 'Jl. Uji No. 1, Indramayu',
            'status_verifikasi' => 'Pending',
            'dokumen_izin' => 'legalitas/izin.pdf',
        ]);

        // Simpan file PDF ke private storage (local disk)
        $path = 'nib/' . $filename;
        Storage::disk('local')->put($path, $pdfContent);

        $nib = Nib::create([
            'id_perusahaan' => $profilPerusahaan->id_perusahaan,
            'dokumen_nib' => $path,
            'status_screening' => \App\Enums\StatusScreening::Belum_Diperiksa,
        ]);

        return [
            'nib' => $nib,
            'path' => $path,
            'profilPerusahaan' => $profilPerusahaan,
        ];
    }

    /** @test */
    public function pdf_digital_berhasil_diextrak(): void
    {
        $pdfContent = $this->createValidPdf('Nomor NIB 1234567890123 - CV Kafe Contoh');
        $data = $this->setupNibWithPdf($pdfContent, 'valid.pdf');

        $result = $this->extractor->extract($data['nib']->id_nib);

        $this->assertEquals('TEXT_EXTRACTED', $result['status']);
        $this->assertTrue($result['has_extractable_text']);
        $this->assertNotNull($result['page_count']);
        $this->assertGreaterThan(0, $result['page_count']);
        $this->assertNotNull($result['pages']);
        $this->assertCount($result['page_count'], $result['pages']);
        $this->assertNotNull($result['full_text']);
        $this->assertStringContainsString('Nomor NIB 1234567890123', $result['full_text']);
        $this->assertNull($result['error']);
    }

    /** @test */
    public function seluruh_halaman_pdf_diproses(): void
    {
        // Buat PDF dengan 2 halaman
        $pdfContent = $this->createMultiPagePdf([
            'Halaman 1 - Nomor NIB 1234567890123',
            'Halaman 2 - Nama Perusahaan CV Kafe Contoh',
        ]);
        $data = $this->setupNibWithPdf($pdfContent, 'multipage.pdf');

        $result = $this->extractor->extract($data['nib']->id_nib);

        $this->assertEquals('TEXT_EXTRACTED', $result['status']);
        $this->assertEquals(2, $result['page_count']);
        $this->assertCount(2, $result['pages']);
        $pageNumbers = array_column($result['pages'], 'page');
        // Page numbers may be 0-based or 1-based depending on parser; just check they're sequential
        $this->assertEquals(count($pageNumbers), count(array_unique($pageNumbers)));
        $this->assertGreaterThanOrEqual(0, min($pageNumbers));
        $this->assertStringContainsString('Halaman 1', $result['pages'][0]['text']);
        $this->assertStringContainsString('Halaman 2', $result['pages'][1]['text']);
    }

    /** @test */
    public function pdf_tanpa_teks_dikenali_sebagai_ocr_required(): void
    {
        // PDF valid tetapi tidak memiliki teks yang dapat diekstrak (kosong)
        $pdfContent = $this->createValidPdf('');
        $data = $this->setupNibWithPdf($pdfContent, 'empty_text.pdf');

        $result = $this->extractor->extract($data['nib']->id_nib);

        // PDF kosong (tanpa teks) -> OCR_REQUIRED karena PDF valid tapi tidak ada teks
        $this->assertEquals('OCR_REQUIRED', $result['status']);
        $this->assertFalse($result['has_extractable_text']);
        $this->assertNull($result['error']);
    }

    /** @test */
    public function pdf_kosong_ditangani_dengan_benar(): void
    {
        $pdfContent = $this->createValidPdf('');
        $data = $this->setupNibWithPdf($pdfContent, 'empty.pdf');

        $result = $this->extractor->extract($data['nib']->id_nib);

        $this->assertEquals('OCR_REQUIRED', $result['status']);
        $this->assertFalse($result['has_extractable_text']);
        $this->assertNull($result['error']);
    }

    /** @test */
    public function file_bukan_pdf_ditolak(): void
    {
        $data = $this->setupNibWithPdf('This is not a PDF file', 'not_a_pdf.pdf');

        $result = $this->extractor->extract($data['nib']->id_nib);

        $this->assertEquals('INVALID_PDF', $result['status']);
        $this->assertNotNull($result['error']);
        $this->assertStringContainsString('bukan PDF', $result['error']);
    }

    /** @test */
    public function pdf_rusak_menghasilkan_invalid_pdf_atau_error(): void
    {
        // File yang dimulai dengan %PDF- tetapi struktur rusak
        $pdfContent = "%PDF-1.4\nini bukan struktur pdf yang valid\n%%EOF";
        $data = $this->setupNibWithPdf($pdfContent, 'corrupt.pdf');

        $result = $this->extractor->extract($data['nib']->id_nib);

        // Bisa berupa INVALID_PDF atau EXTRACTION_FAILED tergantung pada parser
        $this->assertContains($result['status'], ['INVALID_PDF', 'EXTRACTION_FAILED']);
        $this->assertNotNull($result['error']);
    }

    /** @test */
    public function dokumen_tidak_ditemukan_menghasilkan_error(): void
    {
        $result = $this->extractor->extract('999999');

        $this->assertEquals('EXTRACTION_FAILED', $result['status']);
        $this->assertNotNull($result['error']);
        $this->assertStringContainsString('tidak ditemukan', $result['error']);
    }

    /** @test */
    public function file_diambil_dari_private_storage_bukan_public(): void
    {
        $pdfContent = $this->createValidPdf('Test private storage');
        $data = $this->setupNibWithPdf($pdfContent, 'private_test.pdf');

        // File harus ada di local (private) storage
        $this->assertTrue(Storage::disk('local')->exists($data['path']));

        // File tidak boleh ada di public storage
        $this->assertFalse(Storage::disk('public')->exists($data['path']));

        $result = $this->extractor->extract($data['nib']->id_nib);
        $this->assertEquals('TEXT_EXTRACTED', $result['status']);
    }

    /** @test */
    public function kegagalan_parser_tidak_menyebabkan_aplikasi_crash(): void
    {
        // Buat file yang akan menyebabkan parser melempar exception
        $pdfContent = "%PDF-1.4\n" . str_repeat('A', 100000) . "\n%%EOF";
        $data = $this->setupNibWithPdf($pdfContent, 'problematic.pdf');

        $result = $this->extractor->extract($data['nib']->id_nib);

        // Tidak boleh melempar exception ke luar
        $this->assertArrayHasKey('status', $result);
        $this->assertContains($result['status'], ['TEXT_EXTRACTED', 'OCR_REQUIRED', 'INVALID_PDF', 'EXTRACTION_FAILED']);
    }

    /** @test */
    public function file_asli_tidak_berubah_setelah_ekstraksi(): void
    {
        $pdfContent = $this->createValidPdf('Original content must remain');
        $data = $this->setupNibWithPdf($pdfContent, 'original.pdf');

        $contentBefore = Storage::disk('local')->get($data['path']);

        $this->extractor->extract($data['nib']->id_nib);

        $contentAfter = Storage::disk('local')->get($data['path']);
        $this->assertEquals($contentBefore, $contentAfter);
    }

    /** @test */
    public function pdf_melebihi_batas_ukuran_ditangani_dengan_aman(): void
    {
        // Buat file yang melebihi 5MB
        $largeContent = str_repeat('A', 6 * 1024 * 1024); // 6MB
        $pdfContent = "%PDF-1.4\n" . $largeContent . "\n%%EOF";
        $data = $this->setupNibWithPdf($pdfContent, 'large.pdf');

        $result = $this->extractor->extract($data['nib']->id_nib);

        $this->assertEquals('EXTRACTION_FAILED', $result['status']);
        $this->assertNotNull($result['error']);
    }

    /**
     * Buat PDF multi-halaman.
     */
    private function createMultiPagePdf(array $pageTexts): string
    {
        $offsets = [];
        $pdf = "%PDF-1.4\n";

        // Object 1: Catalog
        $offsets[1] = strlen($pdf);
        $pdf .= "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n";

        // Object 2: Pages (written after pages are created, so we know the kids)
        $pageObjectNumbers = [];
        $objNum = 3;
        foreach ($pageTexts as $index => $text) {
            // Page object
            $offsets[$objNum] = strlen($pdf);
            $pageObjectNumbers[] = $objNum;
            $contentObjNum = $objNum + 1;
            $pdf .= "$objNum 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents $contentObjNum 0 R >>\nendobj\n";
            $objNum++;

            // Content stream
            $contentStream = 'BT /F1 12 Tf 72 712 Td (' . addslashes($text) . ") Tj ET";
            $contentLength = strlen($contentStream);
            $offsets[$objNum] = strlen($pdf);
            $pdf .= "$objNum 0 obj\n<< /Length $contentLength >>\nstream\n$contentStream\nendstream\nendobj\n";
            $objNum++;
        }

        // Build kids references using actual page object numbers
        $kids = implode(' ', array_map(fn($num) => "$num 0 R", $pageObjectNumbers));

        // Write Pages object now that we know the kids
        $offsets[2] = strlen($pdf);
        $pdf .= "2 0 obj\n<< /Type /Pages /Kids [$kids] /Count " . count($pageTexts) . " >>\nendobj\n";

        // Xref
        $xrefOffset = strlen($pdf);
        $totalObjects = $objNum; // includes object 0
        $pdf .= "xref\n";
        $pdf .= "0 $totalObjects\n";
        $pdf .= "0000000000 65535 f \n";
        for ($i = 1; $i < $totalObjects; $i++) {
            $offset = $offsets[$i] ?? 0;
            $pdf .= sprintf("%010d 00000 n \n", $offset);
        }

        // Trailer
        $pdf .= "trailer\n";
        $pdf .= "<< /Size $totalObjects /Root 1 0 R >>\n";
        $pdf .= "startxref\n";
        $pdf .= $xrefOffset . "\n";
        $pdf .= "%%EOF\n";

        return $pdf;
    }
}
