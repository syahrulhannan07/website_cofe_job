<?php

namespace App\Services\Nib;

use App\Models\Nib;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\Process\Exception\ProcessTimeoutException;
use Symfony\Component\Process\Process;

/**
 * OCR untuk dokumen NIB (PDF scan atau PDF tanpa teks yang dapat diekstrak)
 * menggunakan Tesseract OCR + Poppler.
 *
 * Tanggung jawab terpisah dari NibPdfExtractorService.
 * Hanya melakukan pembacaan teks via OCR dan mengembalikan kontrak hasil.
 *
 * Tidak melakukan:
 * - QR decoding
 * - Validasi URL/OSS
 * - Structural comparison
 * - Analisis kemiripan dokumen
 * - Keputusan status screening (Lulus/Ditolak/Perlu_Review)
 * - Penyimpanan hasil ke Nib.hasil_screening
 */
class NibOcrService
{
    public const STATUS_OCR_COMPLETED = 'OCR_COMPLETED';
    public const STATUS_OCR_EMPTY = 'OCR_EMPTY';
    public const STATUS_INVALID_PDF = 'INVALID_PDF';
    public const STATUS_OCR_FAILED = 'OCR_FAILED';
    public const STATUS_OCR_UNAVAILABLE = 'OCR_UNAVAILABLE';

    private const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
    private const MAX_PAGE_COUNT = 50;
    private const STORAGE_DISK = 'local';

    // Resolusi rendering 200 DPI: cukup untuk membaca teks dokumen scan
    // administratif sambil tetap mengontrol ukuran gambar sementara dan memori.
    private const DPI = 200;

    private const TESSERACT_LANG = 'ind';
    // PSM 3 = fully automatic page segmentation, cocok untuk dokumen administrasi
    // berupa formulir/berkas dengan tata letak bervariasi.
    private const TESSERACT_PSM = 3;

    private const BIN_PDFINFO = 'pdfinfo';
    private const BIN_PDFTOTPM = 'pdftoppm';
    private const BIN_TESSERACT = 'tesseract';

    private const PDFINFO_TIMEOUT = 60;
    private const RENDER_TIMEOUT = 300;
    private const OCR_TIMEOUT_PER_PAGE = 120;
    private const TESSERACT_LIST_LANGS_TIMEOUT = 30;

    /**
     * Jalankan OCR pada dokumen NIB yang dimiloki oleh record NIB.
     *
     * @param  string $id_nib  Primary key record NIB (bukan path file sembarang)
     * @return array{
     *     status: string,
     *     page_count: int|null,
     *     has_extractable_text: bool|null,
     *     pages: list<array{page: int, text: string}>|null,
     *     full_text: string|null,
     *     error: string|null
     * }
     */
    public function ocr(string $id_nib): array
    {
        $tempDir = null;

        try {
            $nib = Nib::where('id_nib', $id_nib)->first();

            if (!$nib) {
                return $this->failedResult('Record NIB tidak ditemukan.');
            }

            $path = $nib->dokumen_nib ?? null;

            if (!$path) {
                return $this->failedResult('Dokumen NIB tidak tersedia.');
            }

            if (!Storage::disk(self::STORAGE_DISK)->exists($path)) {
                return $this->failedResult('Berkas dokumen NIB tidak ditemukan di private storage.');
            }

            $fileSize = Storage::disk(self::STORAGE_DISK)->size($path);
            if ($fileSize === false || $fileSize > self::MAX_FILE_SIZE_BYTES) {
                return $this->failedResult('File terlalu besar untuk diproses.');
            }

            $fileContents = Storage::disk(self::STORAGE_DISK)->get($path);

            if ($fileContents === false) {
                return $this->failedResult('Gagal membaca berkas dari private storage.');
            }

            if (!str_starts_with($fileContents, '%PDF-')) {
                return $this->invalidPdfResult('File bukan PDF yang didukung.');
            }

            // Ketersediaan binary dan model bahasa dicek sebelum Membuat file sementara.
            if (!$this->binaryAvailable(self::BIN_PDFINFO) || !$this->binaryAvailable(self::BIN_PDFTOTPM)) {
                return $this->unavailableResult('Binary Poppler (pdfinfo/pdftoppm) tidak tersedia.');
            }

            if (!$this->binaryAvailable(self::BIN_TESSERACT)) {
                return $this->unavailableResult('Binary Tesseract tidak tersedia.');
            }

            if (!$this->tesseractLanguageAvailable(self::TESSERACT_LANG)) {
                return $this->unavailableResult('Model bahasa Tesseract ' . self::TESSERACT_LANG . ' tidak tersedia.');
            }

            $tempDir = $this->createTempDir();

            $inputPath = $tempDir . DIRECTORY_SEPARATOR . 'source.pdf';
            file_put_contents($inputPath, $fileContents);

            $pageCount = $this->countPages($inputPath);

            if ($pageCount === null || $pageCount === 0) {
                return $this->invalidPdfResult('PDF tidak memiliki halaman atau tidak dapat dibaca.');
            }

            if ($pageCount > self::MAX_PAGE_COUNT) {
                return $this->failedResult('PDF melebihi batas jumlah halaman yang dapat diproses.');
            }

            $images = $this->renderPages($inputPath, $tempDir);

            if (count($images) === 0) {
                return $this->ocrFailedResult('Tidak ada halaman yang berhasil dirender.');
            }

            $pages = [];
            $fullTextParts = [];
            $hasText = false;

            foreach ($images as $index => $imagePath) {
                $pageNumber = $index + 1;
                $text = $this->ocrPage($imagePath);

                if (trim($text) !== '') {
                    $hasText = true;
                }

                $pages[] = [
                    'page' => $pageNumber,
                    'text' => $text,
                ];

                $fullTextParts[] = $text;
            }

            $fullText = implode("\n", $fullTextParts);

            if ($hasText) {
                return [
                    'status' => self::STATUS_OCR_COMPLETED,
                    'page_count' => $pageCount,
                    'has_extractable_text' => true,
                    'pages' => $pages,
                    'full_text' => $fullText,
                    'error' => null,
                ];
            }

            return [
                'status' => self::STATUS_OCR_EMPTY,
                'page_count' => $pageCount,
                'has_extractable_text' => false,
                'pages' => $pages,
                'full_text' => '',
                'error' => null,
            ];
        } catch (ProcessTimeoutException $e) {
            Log::error('NIB OCR timeout', [
                'id_nib' => $id_nib,
                'error' => $e->getMessage(),
            ]);

            return $this->ocrFailedResult('Proses OCR melebihi batas waktu.');
        } catch (\Throwable $e) {
            Log::error('NIB OCR failed', [
                'id_nib' => $id_nib,
                'error' => $e->getMessage(),
            ]);

            return $this->failedResult('Proses OCR gagal.');
        } finally {
            $this->cleanupTempDir($tempDir);
        }
    }

    /**
     * Periksa ketersediaan binary eksternal (nama binary dikodekan konstan,
     * bukan berasal dari input pengguna).
     */
    private function binaryAvailable(string $binary): bool
    {
        $cmd = PHP_OS_FAMILY === 'Windows'
            ? "where {$binary} 2>nul"
            : "which {$binary} 2>/dev/null";

        $output = shell_exec($cmd);

        return is_string($output) && trim($output) !== '';
    }

    /**
     * Periksa apakah model bahasa Tesseract tersedia.
     */
    private function tesseractLanguageAvailable(string $lang): bool
    {
        $process = new Process([self::BIN_TESSERACT, '--list-langs']);
        $process->setTimeout(self::TESSERACT_LIST_LANGS_TIMEOUT);
        $process->run();

        if (!$process->isSuccessful()) {
            return false;
        }

        foreach (explode("\n", $process->getOutput()) as $line) {
            if (trim($line) === $lang) {
                return true;
            }
        }

        return false;
    }

    /**
     * Hitung jumlah halaman PDF menggunakan pdfinfo.
     */
    private function countPages(string $pdfPath): ?int
    {
        $process = new Process([self::BIN_PDFINFO, $pdfPath]);
        $process->setTimeout(self::PDFINFO_TIMEOUT);
        $process->run();

        if (!$process->isSuccessful()) {
            return null;
        }

        if (preg_match('/Pages:\s*(\d+)/i', $process->getOutput(), $matches)) {
            return (int) $matches[1];
        }

        return null;
    }

    /**
     * Render setiap halaman PDF menjadi gambar PNG (200 DPI) via pdftoppm.
     *
     * @return list<string> daftar path gambir terurut berdasarkan nomor halaman
     */
    private function renderPages(string $pdfPath, string $tempDir): array
    {
        $prefix = $tempDir . DIRECTORY_SEPARATOR . 'page';

        $process = new Process([
            self::BIN_PDFTOTPM,
            '-r', (string) self::DPI,
            '-png',
            $pdfPath,
            $prefix,
        ]);
        $process->setTimeout(self::RENDER_TIMEOUT);
        $process->run();

        if (!$process->isSuccessful()) {
            throw new \RuntimeException('pdftoppm gagal: ' . $process->getErrorOutput());
        }

        $files = glob($tempDir . DIRECTORY_SEPARATOR . 'page-*.png');
        $files = $files ?: [];

        usort($files, fn(string $a, string $b) => $this->imagePageNumber($a) <=> $this->imagePageNumber($b));

        return array_values($files);
    }

    /**
     * Jalankan Tesseract OCR pada satu halaman gambir.
     */
    private function ocrPage(string $imagePath): string
    {
        $process = new Process([
            self::BIN_TESSERACT,
            $imagePath,
            'stdout',
            '-l', self::TESSERACT_LANG,
            '--psm', (string) self::TESSERACT_PSM,
        ]);
        $process->setTimeout(self::OCR_TIMEOUT_PER_PAGE);
        $process->run();

        if (!$process->isSuccessful()) {
            return '';
        }

        return $process->getOutput();
    }

    /**
     * Ekstrak nomor halaman dari nama file gambir hasil pdftoppm (page-N.png).
     */
    private function imagePageNumber(string $path): int
    {
        $basename = basename($path);

        if (preg_match('/page-(\d+)\.png$/i', $basename, $matches)) {
            return (int) $matches[1];
        }

        return 0;
    }

    /**
     * Buat direktori sementara yang aman dan unik (bukan dari nama file pengguna).
     */
    private function createTempDir(): string
    {
        $dir = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'cafe_nib_ocr_' . uniqid('', true);

        @mkdir($dir, 0700, true);

        return $dir;
    }

    /**
     * Bersihkan direktori sementara dan seluruh isinya, baik saat sukses
     * maupun saat gagal/exception.
     */
    private function cleanupTempDir(?string $dir): void
    {
        if (!$dir || !is_dir($dir)) {
            return;
        }

        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($dir, \RecursiveDirectoryIterator::SKIP_DOTS),
            \RecursiveIteratorIterator::CHILD_FIRST
        );

        foreach ($iterator as $file) {
            if ($file->isDir()) {
                @rmdir($file->getPathname());
            } else {
                @unlink($file->getPathname());
            }
        }

        @rmdir($dir);
    }

    private function failedResult(string $error): array
    {
        return [
            'status' => self::STATUS_OCR_FAILED,
            'page_count' => null,
            'has_extractable_text' => null,
            'pages' => null,
            'full_text' => null,
            'error' => $error,
        ];
    }

    private function ocrFailedResult(string $error): array
    {
        return [
            'status' => self::STATUS_OCR_FAILED,
            'page_count' => null,
            'has_extractable_text' => null,
            'pages' => null,
            'full_text' => null,
            'error' => $error,
        ];
    }

    private function invalidPdfResult(string $error): array
    {
        return [
            'status' => self::STATUS_INVALID_PDF,
            'page_count' => null,
            'has_extractable_text' => null,
            'pages' => null,
            'full_text' => null,
            'error' => $error,
        ];
    }

    private function unavailableResult(string $error): array
    {
        return [
            'status' => self::STATUS_OCR_UNAVAILABLE,
            'page_count' => null,
            'has_extractable_text' => null,
            'pages' => null,
            'full_text' => null,
            'error' => $error,
        ];
    }
}
