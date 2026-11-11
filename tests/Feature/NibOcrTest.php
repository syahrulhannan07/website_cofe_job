<?php

namespace Tests\Feature;

use App\Models\Nib;
use App\Models\Pengguna;
use App\Models\ProfilPerusahaan;
use App\Services\Nib\NibOcrService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class NibOcrTest extends TestCase
{
    use RefreshDatabase;

    private NibOcrService $ocr;

    protected function setUp(): void
    {
        parent::setUp();
        $this->assertSame('sqlite', DB::connection()->getDriverName());
        $this->assertSame(':memory:', DB::connection()->getDatabaseName());
        Storage::fake('public');
        Storage::fake('local');
        $this->ocr = new NibOcrService();
    }

    private function ocrEnvironmentAvailable(): bool
    {
        $cmd = PHP_OS_FAMILY === 'Windows' ? 'where' : 'which';
        $null = PHP_OS_FAMILY === 'Windows' ? '2>nul' : '2>/dev/null';

        foreach (['pdftoppm', 'pdfinfo', 'tesseract'] as $binary) {
            $output = shell_exec("$cmd $binary $null");
            if (!is_string($output) || trim($output) === '') {
                return false;
            }
        }

        return true;
    }

    private function fixturePath(string $name): string
    {
        return __DIR__ . '/../fixtures/pdf/' . $name;
    }

    private function setupNibWithPdf(string $pdfContent, string $filename = 'test.pdf'): array
    {
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
        ]);

        $path = 'nib/' . $filename;
        Storage::disk('local')->put($path, $pdfContent);

        $nib = Nib::create([
            'id_perusahaan' => $profilPerusahaan->id_perusahaan,
            'dokumen_nib' => $path,
        ]);

        return [
            'nib' => $nib,
            'path' => $path,
            'profilPerusahaan' => $profilPerusahaan,
        ];
    }

    private function createValidPdfWithPageCount(int $count): string
    {
        $offsets = [];
        $pdf = "%PDF-1.4\n";

        $offsets[1] = strlen($pdf);
        $pdf .= "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n";

        $pageObjs = [];
        $objNum = 3;

        for ($i = 0; $i < $count; $i++) {
            $contentObjNum = $objNum + 1;
            $pageObjs[] = $objNum;

            $offsets[$objNum] = strlen($pdf);
            $pdf .= sprintf(
                "%d 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents %d 0 R >>\nendobj\n",
                $objNum,
                $contentObjNum
            );
            $objNum++;

            $contentStream = "BT /F1 12 Tf 72 712 Td ( ) Tj ET";
            $contentLength = strlen($contentStream);
            $offsets[$objNum] = strlen($pdf);
            $pdf .= sprintf(
                "%d 0 obj\n<< /Length %d >>\nstream\n%s\nendstream\nendobj\n",
                $objNum,
                $contentLength,
                $contentStream
            );
            $objNum++;
        }

        $kids = implode(' ', array_map(fn($n) => "$n 0 R", $pageObjs));
        $offsets[2] = strlen($pdf);
        $pdf .= sprintf("2 0 obj\n<< /Type /Pages /Kids [%s] /Count %d >>\nendobj\n", $kids, $count);

        $xrefOffset = strlen($pdf);
        $totalObjects = $objNum;
        $pdf .= "xref\n";
        $pdf .= "0 $totalObjects\n";
        $pdf .= "0000000000 65535 f \n";
        for ($i = 1; $i < $totalObjects; $i++) {
            $pdf .= sprintf("%010d 00000 n \n", $offsets[$i] ?? 0);
        }

        $pdf .= "trailer\n";
        $pdf .= sprintf("<< /Size %d /Root 1 0 R >>\n", $totalObjects);
        $pdf .= "startxref\n";
        $pdf .= $xrefOffset . "\n";
        $pdf .= "%%EOF\n";

        return $pdf;
    }

    /** @test */
    public function ocr_pdf_scan_berhasil(): void
    {
        if (!$this->ocrEnvironmentAvailable()) {
            $this->markTestSkipped('Binary OCR (poppler/tesseract) tidak tersedia di host ini; uji integrasi dijalankan di container aplikasi.');
        }

        $pdfContent = file_get_contents($this->fixturePath('scanned_3_page.pdf'));
        $data = $this->setupNibWithPdf($pdfContent, 'scanned.pdf');

        $result = $this->ocr->ocr($data['nib']->id_nib);

        $this->assertEquals('OCR_COMPLETED', $result['status']);
        $this->assertEquals(3, $result['page_count']);
        $this->assertTrue($result['has_extractable_text']);
        $this->assertCount(3, $result['pages']);
        $this->assertNotNull($result['full_text']);
        $this->assertNotEmpty($result['full_text']);
        $this->assertNull($result['error']);

        $pageNumbers = array_column($result['pages'], 'page');
        $this->assertEquals([1, 2, 3], $pageNumbers);
    }

    /** @test */
    public function ocr_hasil_per_halaman(): void
    {
        if (!$this->ocrEnvironmentAvailable()) {
            $this->markTestSkipped('Binary OCR tidak tersedia di host ini.');
        }

        $pdfContent = file_get_contents($this->fixturePath('scanned_3_page.pdf'));
        $data = $this->setupNibWithPdf($pdfContent, 'per_halaman.pdf');

        $result = $this->ocr->ocr($data['nib']->id_nib);

        $this->assertEquals('OCR_COMPLETED', $result['status']);
        $this->assertCount(3, $result['pages']);
        foreach ($result['pages'] as $page) {
            $this->assertArrayHasKey('page', $page);
            $this->assertArrayHasKey('text', $page);
            $this->assertIsInt($page['page']);
            $this->assertIsString($page['text']);
        }
    }

    /** @test */
    public function ocr_multi_page_memproses_semua_halaman(): void
    {
        if (!$this->ocrEnvironmentAvailable()) {
            $this->markTestSkipped('Binary OCR tidak tersedia di host ini.');
        }

        $pdfContent = file_get_contents($this->fixturePath('scanned_2_page.pdf'));
        $data = $this->setupNibWithPdf($pdfContent, 'multipage.pdf');

        $result = $this->ocr->ocr($data['nib']->id_nib);

        $this->assertEquals('OCR_COMPLETED', $result['status']);
        $this->assertEquals(2, $result['page_count']);
        $this->assertCount(2, $result['pages']);
        $this->assertEquals([1, 2], array_column($result['pages'], 'page'));
    }

    /** @test */
    public function ocr_hasil_kosong_menghasilkan_ocr_empty(): void
    {
        if (!$this->ocrEnvironmentAvailable()) {
            $this->markTestSkipped('Binary OCR tidak tersedia di host ini.');
        }

        $pdfContent = file_get_contents($this->fixturePath('scanned_1_page.pdf'));
        $data = $this->setupNibWithPdf($pdfContent, 'blank.pdf');

        $result = $this->ocr->ocr($data['nib']->id_nib);

        $this->assertEquals('OCR_EMPTY', $result['status']);
        $this->assertFalse($result['has_extractable_text']);
        $this->assertEquals('', $result['full_text']);
        $this->assertNull($result['error']);
    }

    /** @test */
    public function pdf_bukan_pdf_ditolak_sebagai_invalid_pdf(): void
    {
        $data = $this->setupNibWithPdf('This is not a PDF file', 'not_a_pdf.pdf');

        $result = $this->ocr->ocr($data['nib']->id_nib);

        $this->assertEquals('INVALID_PDF', $result['status']);
        $this->assertNotNull($result['error']);
        $this->assertStringContainsString('bukan PDF', $result['error']);
    }

    /** @test */
    public function dokumen_nib_tidak_ditemukan(): void
    {
        $result = $this->ocr->ocr('999999');

        $this->assertEquals('OCR_FAILED', $result['status']);
        $this->assertNotNull($result['error']);
        $this->assertStringContainsString('tidak ditemukan', $result['error']);
    }

    /** @test */
    public function dokumen_tidak_tersedia(): void
    {
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

        $nib = Nib::create([
            'id_perusahaan' => $perusahaan->id_perusahaan,
            'dokumen_nib' => null,
        ]);

        $result = $this->ocr->ocr($nib->id_nib);

        $this->assertEquals('OCR_FAILED', $result['status']);
        $this->assertNotNull($result['error']);
    }

    /** @test */
    public function file_diambil_dari_private_storage_local_bukan_public(): void
    {
        $pdfContent = file_get_contents($this->fixturePath('scanned_3_page.pdf'));
        $data = $this->setupNibWithPdf($pdfContent, 'private_storage.pdf');

        $this->assertTrue(Storage::disk('local')->exists($data['path']));
        $this->assertFalse(Storage::disk('public')->exists($data['path']));

        if (!$this->ocrEnvironmentAvailable()) {
            $this->markTestSkipped('Binary OCR tidak tersedia di host ini.');
        }

        $result = $this->ocr->ocr($data['nib']->id_nib);
        $this->assertEquals('OCR_COMPLETED', $result['status']);
    }

    /** @test */
    public function file_melebihi_5mb_ditolak(): void
    {
        $largeContent = "%PDF-1.4\n" . str_repeat('A', 6 * 1024 * 1024) . "\n%%EOF";
        $data = $this->setupNibWithPdf($largeContent, 'large.pdf');

        $result = $this->ocr->ocr($data['nib']->id_nib);

        $this->assertEquals('OCR_FAILED', $result['status']);
        $this->assertNotNull($result['error']);
        $this->assertStringContainsString('terlalu besar', $result['error']);
    }

    /** @test */
    public function pdf_melebihi_50_halaman_ditolak(): void
    {
        if (!$this->ocrEnvironmentAvailable()) {
            $this->markTestSkipped('Validasi jumlah halaman membutuhkan pdfinfo (Poppler), yang tidak tersedia di host ini; uji di container aplikasi.');
        }

        $pdfContent = $this->createValidPdfWithPageCount(51);
        $data = $this->setupNibWithPdf($pdfContent, 'many_pages.pdf');

        $result = $this->ocr->ocr($data['nib']->id_nib);

        $this->assertEquals('OCR_FAILED', $result['status']);
        $this->assertNotNull($result['error']);
        $this->assertStringContainsString('halaman', $result['error']);
    }

    /** @test */
    public function populer_atau_tesseract_tidak_tersedia_menghasilkan_ocr_unavailable(): void
    {
        $pdfContent = file_get_contents($this->fixturePath('scanned_3_page.pdf'));
        $data = $this->setupNibWithPdf($pdfContent, 'unavailable.pdf');

        $result = $this->ocr->ocr($data['nib']->id_nib);

        if (!$this->ocrEnvironmentAvailable()) {
            $this->assertEquals('OCR_UNAVAILABLE', $result['status']);
            $this->assertNotNull($result['error']);
        } else {
            $this->markTestSkipped('Binary OCR tersedia; tidak dapat mensimulasikan ketiadaan binary di host ini.');
        }
    }

    /** @test */
    public function kegagalan_ocr_tidak_menyebabkan_aplikasi_crash(): void
    {
        $pdfContent = "%PDF-1.4\n" . str_repeat('A', 50000) . "\n%%EOF";
        $data = $this->setupNibWithPdf($pdfContent, 'problematic.pdf');

        $result = $this->ocr->ocr($data['nib']->id_nib);

        $this->assertArrayHasKey('status', $result);
        $this->assertContains(
            $result['status'],
            ['OCR_COMPLETED', 'OCR_EMPTY', 'INVALID_PDF', 'OCR_FAILED', 'OCR_UNAVAILABLE']
        );
        $this->assertArrayHasKey('error', $result);
    }

    /** @test */
    public function file_sementara_dibersihkan_setelah_proses_sukses(): void
    {
        if (!$this->ocrEnvironmentAvailable()) {
            $this->markTestSkipped('Binary OCR tidak tersedia di host ini; uji cleanup di container aplikasi.');
        }

        $tempDirBefore = count(glob(sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'cafe_nib_ocr_*'));

        $pdfContent = file_get_contents($this->fixturePath('scanned_3_page.pdf'));
        $data = $this->setupNibWithPdf($pdfContent, 'cleanup_success.pdf');

        $this->ocr->ocr($data['nib']->id_nib);

        $tempDirAfter = count(glob(sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'cafe_nib_ocr_*'));
        $this->assertEquals($tempDirBefore, $tempDirAfter);
    }

    /** @test */
    public function file_sementara_dibersihkan_setelah_proses_gagal(): void
    {
        if (!$this->ocrEnvironmentAvailable()) {
            $this->markTestSkipped('Binary OCR tidak tersedia di host ini; uji cleanup di container aplikasi.');
        }

        $tempDirBefore = count(glob(sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'cafe_nib_ocr_*'));

        $pdfContent = file_get_contents($this->fixturePath('scanned_3_page.pdf'));
        $data = $this->setupNibWithPdf($pdfContent, 'cleanup_fail.pdf');

        // Paksa gagal render dengan memberikan file yang header-nya PDF tapi rusak
        // sehingga pdfinfo berhasil namun konten tidak bisa dirender.
        $brokenPdf = "%PDF-1.4\n" . str_repeat('A', 5000) . "\n%%EOF";
        Storage::disk('local')->put($data['path'], $brokenPdf);

        $this->ocr->ocr($data['nib']->id_nib);

        $tempDirAfter = count(glob(sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'cafe_nib_ocr_*'));
        $this->assertEquals($tempDirBefore, $tempDirAfter);
    }

    /** @test */
    public function file_asli_tidak_berubah_setelah_ocr(): void
    {
        $pdfContent = file_get_contents($this->fixturePath('scanned_3_page.pdf'));
        $data = $this->setupNibWithPdf($pdfContent, 'original.pdf');

        $contentBefore = Storage::disk('local')->get($data['path']);

        $this->ocr->ocr($data['nib']->id_nib);

        $contentAfter = Storage::disk('local')->get($data['path']);
        $this->assertEquals($contentBefore, $contentAfter);
    }
}
