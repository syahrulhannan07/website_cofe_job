<?php

namespace Tests\Feature;

use App\Models\Nib;
use App\Models\Pengguna;
use App\Models\ProfilPerusahaan;
use App\Services\Nib\NibQrDecoderService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class NibQrDecoderTest extends TestCase
{
    use RefreshDatabase;

    private NibQrDecoderService $decoder;

    protected function setUp(): void
    {
        parent::setUp();
        $this->assertSame('sqlite', DB::connection()->getDriverName());
        $this->assertSame(':memory:', DB::connection()->getDatabaseName());
        Storage::fake('public');
        Storage::fake('local');
        $this->decoder = new NibQrDecoderService();
    }

    private function qrEnvironmentAvailable(): bool
    {
        return class_exists(\Zxing\QrReader::class)
            && (extension_loaded('gd') || extension_loaded('imagick'));
    }

    private function popplerAvailable(): bool
    {
        $cmd = PHP_OS_FAMILY === 'Windows' ? 'where' : 'which';
        $null = PHP_OS_FAMILY === 'Windows' ? '2>nul' : '2>/dev/null';

        foreach (['pdftoppm', 'pdfinfo'] as $binary) {
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

    private function setupNibWithFile(string $contents, string $filename): array
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
        Storage::disk('local')->put($path, $contents);

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

    /** @test */
    public function qr_valid_pada_gambar_png(): void
    {
        if (!$this->qrEnvironmentAvailable()) {
            $this->markTestSkipped('Decoder QR Code (Zxing\QrReader + GD/Imagick) tidak tersedia di host ini.');
        }

        $contents = file_get_contents($this->fixturePath('qr_text.png'));
        $data = $this->setupNibWithFile($contents, 'qr.png');

        $result = $this->decoder->decode($data['nib']->id_nib);

        $this->assertEquals('QR_FOUND', $result['status']);
        $this->assertTrue($result['qr_found']);
        $this->assertEquals(1, $result['page_count']);
        $this->assertEquals(1, $result['page_number']);
        $this->assertEquals('NIB 1234567890123', $result['decoded_content']);
        $this->assertNull($result['error']);
    }

    /** @test */
    public function qr_valid_pada_gambar_jpeg(): void
    {
        if (!$this->qrEnvironmentAvailable()) {
            $this->markTestSkipped('Decoder QR Code tidak tersedia di host ini.');
        }

        $contents = file_get_contents($this->fixturePath('qr_text.jpeg'));
        $data = $this->setupNibWithFile($contents, 'qr.jpeg');

        $result = $this->decoder->decode($data['nib']->id_nib);

        $this->assertEquals('QR_FOUND', $result['status']);
        $this->assertTrue($result['qr_found']);
        $this->assertEquals(1, $result['page_count']);
        $this->assertEquals(1, $result['page_number']);
        $this->assertEquals('NIB 1234567890123', $result['decoded_content']);
        $this->assertNull($result['error']);
    }

    /** @test */
    public function qr_valid_pada_pdf_halaman_pertama(): void
    {
        if (!$this->qrEnvironmentAvailable()) {
            $this->markTestSkipped('Decoder QR Code tidak tersedia di host ini.');
        }

        if (!$this->popplerAvailable()) {
            // Poppler tidak tersedia: decode PDF harus menghasilkan QR_UNAVAILABLE.
            $contents = file_get_contents($this->fixturePath('qr_page1.pdf'));
            $data = $this->setupNibWithFile($contents, 'qr_page1.pdf');

            $result = $this->decoder->decode($data['nib']->id_nib);

            $this->assertEquals('QR_UNAVAILABLE', $result['status']);
            $this->assertNotNull($result['error']);

            $this->markTestSkipped('Poppler (pdftoppm/pdfinfo) tidak tersedia di host ini; uji penuh decoding PDF di container aplikasi.');
        }

        $contents = file_get_contents($this->fixturePath('qr_page1.pdf'));
        $data = $this->setupNibWithFile($contents, 'qr_page1.pdf');

        $result = $this->decoder->decode($data['nib']->id_nib);

        $this->assertEquals('QR_FOUND', $result['status']);
        $this->assertTrue($result['qr_found']);
        $this->assertEquals(1, $result['page_count']);
        $this->assertEquals(1, $result['page_number']);
        $this->assertEquals('NIB 1234567890123', $result['decoded_content']);
        $this->assertNull($result['error']);
    }

    /** @test */
    public function qr_valid_pada_pdf_halaman_selain_pertama(): void
    {
        if (!$this->qrEnvironmentAvailable()) {
            $this->markTestSkipped('Decoder QR Code tidak tersedia di host ini.');
        }

        if (!$this->popplerAvailable()) {
            $this->markTestSkipped('Poppler tidak tersedia di host ini; uji PDF di container aplikasi.');
        }

        $contents = file_get_contents($this->fixturePath('qr_page2.pdf'));
        $data = $this->setupNibWithFile($contents, 'qr_page2.pdf');

        $result = $this->decoder->decode($data['nib']->id_nib);

        $this->assertEquals('QR_FOUND', $result['status']);
        $this->assertTrue($result['qr_found']);
        $this->assertEquals(2, $result['page_count']);
        $this->assertEquals(2, $result['page_number']);
        $this->assertEquals('NIB 1234567890123', $result['decoded_content']);
        $this->assertNull($result['error']);
    }

    /** @test */
    public function qr_pdf_multipage_qr_pada_halaman_dua(): void
    {
        if (!$this->qrEnvironmentAvailable()) {
            $this->markTestSkipped('Decoder QR Code tidak tersedia di host ini.');
        }

        if (!$this->popplerAvailable()) {
            $this->markTestSkipped('Poppler tidak tersedia di host ini; uji PDF di container aplikasi.');
        }

        $contents = file_get_contents($this->fixturePath('qr_multipage.pdf'));
        $data = $this->setupNibWithFile($contents, 'qr_multipage.pdf');

        $result = $this->decoder->decode($data['nib']->id_nib);

        $this->assertEquals('QR_FOUND', $result['status']);
        $this->assertTrue($result['qr_found']);
        $this->assertEquals(3, $result['page_count']);
        $this->assertEquals(2, $result['page_number']);
        $this->assertEquals('NIB 1234567890123', $result['decoded_content']);
        $this->assertNull($result['error']);
    }

    /** @test */
    public function dokumen_valid_tanpa_qr_menghasilkan_qr_not_found(): void
    {
        if (!$this->qrEnvironmentAvailable()) {
            $this->markTestSkipped('Decoder QR Code tidak tersedia di host ini.');
        }

        $contents = file_get_contents($this->fixturePath('no_qr.png'));
        $data = $this->setupNibWithFile($contents, 'no_qr.png');

        $result = $this->decoder->decode($data['nib']->id_nib);

        $this->assertEquals('QR_NOT_FOUND', $result['status']);
        $this->assertFalse($result['qr_found']);
        $this->assertEquals(1, $result['page_count']);
        $this->assertNull($result['page_number']);
        $this->assertNull($result['decoded_content']);
        $this->assertNull($result['error']);
    }

    /** @test */
    public function gambir_rusak_menghasilkan_qr_unreadable(): void
    {
        if (!$this->qrEnvironmentAvailable()) {
            $this->markTestSkipped('Decoder QR Code tidak tersedia di host ini.');
        }

        $contents = file_get_contents($this->fixturePath('corrupt_png.png'));
        $data = $this->setupNibWithFile($contents, 'corrupt_png.png');

        $result = $this->decoder->decode($data['nib']->id_nib);

        $this->assertEquals('QR_UNREADABLE', $result['status']);
        $this->assertFalse($result['qr_found']);
        $this->assertNull($result['decoded_content']);
        $this->assertNull($result['page_number']);
        $this->assertNotNull($result['error']);
    }

    /** @test */
    public function format_dokumen_tidak_didukung_ditolak(): void
    {
        if (!$this->qrEnvironmentAvailable()) {
            $this->markTestSkipped('Decoder QR Code tidak tersedia di host ini.');
        }

        $data = $this->setupNibWithFile('ini bukan dokumen gambir atau PDF', 'malicious.exe');

        $result = $this->decoder->decode($data['nib']->id_nib);

        $this->assertEquals('INVALID_DOCUMENT', $result['status']);
        $this->assertNull($result['qr_found']);
        $this->assertNull($result['decoded_content']);
        $this->assertNotNull($result['error']);
    }

    /** @test */
    public function record_nib_tidak_ditemukan(): void
    {
        if (!$this->qrEnvironmentAvailable()) {
            $this->markTestSkipped('Decoder QR Code tidak tersedia di host ini.');
        }

        $result = $this->decoder->decode('999999');

        $this->assertEquals('QR_FAILED', $result['status']);
        $this->assertNotNull($result['error']);
        $this->assertStringContainsString('tidak ditemukan', $result['error']);
    }

    /** @test */
    public function berkas_tidak_ada_di_storage(): void
    {
        if (!$this->qrEnvironmentAvailable()) {
            $this->markTestSkipped('Decoder QR Code tidak tersedia di host ini.');
        }

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
            'dokumen_nib' => 'nib/nonexistent.pdf',
        ]);

        $result = $this->decoder->decode($nib->id_nib);

        $this->assertEquals('QR_FAILED', $result['status']);
        $this->assertNotNull($result['error']);
    }

    /** @test */
    public function berkas_melebihi_5mb_ditolak(): void
    {
        if (!$this->qrEnvironmentAvailable()) {
            $this->markTestSkipped('Decoder QR Code tidak tersedia di host ini.');
        }

        $largeContent = str_repeat('A', 6 * 1024 * 1024);
        $data = $this->setupNibWithFile($largeContent, 'large.pdf');

        $result = $this->decoder->decode($data['nib']->id_nib);

        $this->assertEquals('QR_FAILED', $result['status']);
        $this->assertNotNull($result['error']);
        $this->assertStringContainsString('terlalu besar', $result['error']);
    }

    /** @test */
    public function qr_berisi_teks_biasa_bukan_url(): void
    {
        if (!$this->qrEnvironmentAvailable()) {
            $this->markTestSkipped('Decoder QR Code tidak tersedia di host ini.');
        }

        $contents = file_get_contents($this->fixturePath('qr_text.png'));
        $data = $this->setupNibWithFile($contents, 'qr_plain.png');

        $result = $this->decoder->decode($data['nib']->id_nib);

        $this->assertEquals('QR_FOUND', $result['status']);
        $this->assertTrue($result['qr_found']);
        $this->assertEquals('NIB 1234567890123', $result['decoded_content']);
        $this->assertFalse(str_starts_with($result['decoded_content'], 'http'));
        $this->assertNull($result['error']);
    }

    /** @test */
    public function qr_berisi_url_tetapi_url_tidak_diakses(): void
    {
        if (!$this->qrEnvironmentAvailable()) {
            $this->markTestSkipped('Decoder QR Code tidak tersedia di host ini.');
        }

        $contents = file_get_contents($this->fixturePath('qr_url.png'));
        $data = $this->setupNibWithFile($contents, 'qr_url.png');

        $result = $this->decoder->decode($data['nib']->id_nib);

        $this->assertEquals('QR_FOUND', $result['status']);
        $this->assertTrue($result['qr_found']);
        $this->assertStringStartsWith('https://', $result['decoded_content']);
        $this->assertStringContainsString('oss.example.com', $result['decoded_content']);
        // Service hanya membaca isi QR, tidak melakukan HTTP request ke URL tersebut.
        $this->assertNull($result['error']);
    }

    /** @test */
    public function file_sementara_dibersihkan_setelah_proses_berhasil(): void
    {
        if (!$this->qrEnvironmentAvailable()) {
            $this->markTestSkipped('Decoder QR Code tidak tersedia di host ini; uji cleanup di container aplikasi.');
        }

        $tempDirBefore = count(glob(sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'cafe_nib_qr_*'));

        $contents = file_get_contents($this->fixturePath('qr_text.png'));
        $data = $this->setupNibWithFile($contents, 'cleanup_success.png');

        $this->decoder->decode($data['nib']->id_nib);

        $tempDirAfter = count(glob(sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'cafe_nib_qr_*'));
        $this->assertEquals($tempDirBefore, $tempDirAfter);
    }

    /** @test */
    public function file_sementara_dibersihkan_setelah_proses_gagal(): void
    {
        if (!$this->qrEnvironmentAvailable()) {
            $this->markTestSkipped('Decoder QR Code tidak tersedia di host ini; uji cleanup di container aplikasi.');
        }

        $tempDirBefore = count(glob(sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'cafe_nib_qr_*'));

        // Dokumen PDF valid tapi rusak sehingga render gagal -> exception, cleanup tetap berjalan.
        $brokenPdf = "%PDF-1.4\n" . str_repeat('A', 5000) . "\n%%EOF";
        $data = $this->setupNibWithFile($brokenPdf, 'cleanup_fail.pdf');

        $this->decoder->decode($data['nib']->id_nib);

        $tempDirAfter = count(glob(sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'cafe_nib_qr_*'));
        $this->assertEquals($tempDirBefore, $tempDirAfter);
    }

    /** @test */
    public function berkas_asli_tidak_berubah_setelah_decode(): void
    {
        if (!$this->qrEnvironmentAvailable()) {
            $this->markTestSkipped('Decoder QR Code tidak tersedia di host ini.');
        }

        $contents = file_get_contents($this->fixturePath('qr_text.png'));
        $data = $this->setupNibWithFile($contents, 'original.png');

        $contentBefore = Storage::disk('local')->get($data['path']);

        $this->decoder->decode($data['nib']->id_nib);

        $contentAfter = Storage::disk('local')->get($data['path']);
        $this->assertEquals($contentBefore, $contentAfter);
    }
}
