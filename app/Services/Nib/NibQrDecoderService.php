<?php

namespace App\Services\Nib;

use App\Models\Nib;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\Process\Exception\ProcessTimeoutException;
use Symfony\Component\Process\Process;
use Zxing\QrReader;

/**
 * Dekode QR Code dari dokumen NIB (PDF, JPEG, atau PNG) menggunakan
 * khanamiryan/qrcode-detector-decoder (Zxing\QrReader).
 *
 * Tanggung jawab hanya membaca isi QR Code. Tidak melakukan:
 * - Validasi URL OSS atau keaslian dokumen
 * - HTTP request / DNS lookup berdasarkan isi QR
 * - Structural comparison, analisis kemiripan, keputusan screening
 * - Penyimpanan hasil ke Nib.hasil_screening
 *
 * Service terpisah dari NibPdfExtractorService dan NibOcrService.
 */
class NibQrDecoderService
{
    public const STATUS_QR_FOUND = 'QR_FOUND';
    public const STATUS_QR_NOT_FOUND = 'QR_NOT_FOUND';
    public const STATUS_QR_UNREADABLE = 'QR_UNREADABLE';
    public const STATUS_INVALID_DOCUMENT = 'INVALID_DOCUMENT';
    public const STATUS_QR_FAILED = 'QR_FAILED';
    public const STATUS_QR_UNAVAILABLE = 'QR_UNAVAILABLE';

    private const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
    private const MAX_PAGE_COUNT = 50;
    private const STORAGE_DISK = 'local';

    // Resolusi rendering 200 DPI: cukup jelas untuk deteksi QR Code cetak
    // sambil mengontrol ukuran berkas gambir sementara dan memori.
    private const DPI = 200;

    private const BIN_PDFINFO = 'pdfinfo';
    private const BIN_PDFTOTPM = 'pdftoppm';

    private const PDFINFO_TIMEOUT = 60;
    private const RENDER_TIMEOUT = 300;

    /**
     * Dekode QR Code dari dokumen NIB yang dimiloki oleh record NIB.
     *
     * @param  string $id_nib  Primary key record NIB (bukan path file sembarang)
     * @return array{
     *     status: string,
     *     page_count: int|null,
     *     qr_found: bool|null,
     *     decoded_content: string|null,
     *     page_number: int|null,
     *     error: string|null
     * }
     */
    public function decode(string $id_nib): array
    {
        $tempDir = null;

        try {
            $nib = Nib::where('id_nib', $id_nib)->first();

            if (!$nib) {
                return $this->failedResult('Record NIB tidak ditemukan.', null, null);
            }

            $path = $nib->dokumen_nib ?? null;

            if (!$path) {
                return $this->failedResult('Dokumen NIB tidak tersedia.', null, null);
            }

            if (!Storage::disk(self::STORAGE_DISK)->exists($path)) {
                return $this->failedResult('Berkas dokumen NIB tidak ditemukan di private storage.', null, null);
            }

            $fileSize = Storage::disk(self::STORAGE_DISK)->size($path);
            if ($fileSize === false || $fileSize > self::MAX_FILE_SIZE_BYTES) {
                return $this->failedResult('File terlalu besar untuk diproses.', null, null);
            }

            $fileContents = Storage::disk(self::STORAGE_DISK)->get($path);

            if ($fileContents === false) {
                return $this->failedResult('Gagal membaca berkas dari private storage.', null, null);
            }

            $format = $this->detectFormat($fileContents);

            if ($format === null) {
                return $this->invalidDocumentResult('Format dokumen tidak didukung (PDF, JPEG, atau PNG).');
            }

            if (!$this->qrDecoderAvailable()) {
                return $this->unavailableResult('Decoder QR Code atau dukungan gambir (GD/Imagick) tidak tersedia.');
            }

            if ($format === 'pdf') {
                if (!$this->binaryAvailable(self::BIN_PDFINFO) || !$this->binaryAvailable(self::BIN_PDFTOTPM)) {
                    return $this->unavailableResult('Binary Poppler (pdfinfo/pdftoppm) tidak tersedia untuk PDF.');
                }

                $tempDir = $this->createTempDir();
                $inputPath = $tempDir . DIRECTORY_SEPARATOR . 'source.pdf';
                file_put_contents($inputPath, $fileContents);

                $pageCount = $this->countPages($inputPath);

                if ($pageCount === null || $pageCount === 0) {
                    return $this->invalidDocumentResult('PDF tidak memiliki halaman atau tidak dapat dibaca.');
                }

                if ($pageCount > self::MAX_PAGE_COUNT) {
                    return $this->failedResult('PDF melebihi batas jumlah halaman yang dapat diproses.', null, null);
                }

                $images = $this->renderPages($inputPath, $tempDir);

                if (count($images) === 0) {
                    return $this->unreadableResult('Tidak ada halaman yang berhasil dirender.', $pageCount);
                }

                $unreadable = false;

                foreach ($images as $index => $imagePath) {
                    $pageNumber = $index + 1;
                    $imageBytes = @file_get_contents($imagePath);

                    if ($imageBytes === false) {
                        $unreadable = true;
                        continue;
                    }

                    $decoded = $this->decodeImageBlob($imageBytes);

                    if ($decoded['found']) {
                        return [
                            'status' => self::STATUS_QR_FOUND,
                            'page_count' => $pageCount,
                            'qr_found' => true,
                            'decoded_content' => $decoded['content'],
                            'page_number' => $pageNumber,
                            'error' => null,
                        ];
                    }

                    if ($decoded['unreadable']) {
                        $unreadable = true;
                    }
                }

                if ($unreadable) {
                    return $this->unreadableResult('Salah satu halaman tidak dapat dibaca oleh decoder QR.', $pageCount);
                }

                return [
                    'status' => self::STATUS_QR_NOT_FOUND,
                    'page_count' => $pageCount,
                    'qr_found' => false,
                    'decoded_content' => null,
                    'page_number' => null,
                    'error' => null,
                ];
            }

            // JPEG / PNG: proses langsung sebagai satu halaman.
            $decoded = $this->decodeImageBlob($fileContents);

            if ($decoded['found']) {
                return [
                    'status' => self::STATUS_QR_FOUND,
                    'page_count' => 1,
                    'qr_found' => true,
                    'decoded_content' => $decoded['content'],
                    'page_number' => 1,
                    'error' => null,
                ];
            }

            if ($decoded['unreadable']) {
                return $this->unreadableResult('Gambir tidak dapat dibaca oleh decoder QR.', 1);
            }

            return [
                'status' => self::STATUS_QR_NOT_FOUND,
                'page_count' => 1,
                'qr_found' => false,
                'decoded_content' => null,
                'page_number' => null,
                'error' => null,
            ];
        } catch (ProcessTimeoutException $e) {
            Log::error('NIB QR decode timeout', [
                'id_nib' => $id_nib,
                'error' => $e->getMessage(),
            ]);

            return $this->failedResult('Proses decoding QR melebihi batas waktu.', null, null);
        } catch (\Throwable $e) {
            Log::error('NIB QR decode failed', [
                'id_nib' => $id_nib,
                'error' => $e->getMessage(),
            ]);

            return $this->failedResult('Proses decoding QR gagal.', null, null);
        } finally {
            $this->cleanupTempDir($tempDir);
        }
    }

    /**
     * Deteksi format dokumen berdasarkan magic bytes (isi file), bukan ekstensi.
     */
    private function detectFormat(string $contents): ?string
    {
        if (str_starts_with($contents, '%PDF-')) {
            return 'pdf';
        }

        if (str_starts_with($contents, "\xFF\xD8\xFF")) {
            return 'jpeg';
        }

        if (str_starts_with($contents, "\x89PNG\r\n\x1a\n")) {
            return 'png';
        }

        return null;
    }

    /**
     * Periksa ketersediaan class decoder QR dan dukungan gambir (GD atau Imagick).
     */
    private function qrDecoderAvailable(): bool
    {
        if (!class_exists(QrReader::class)) {
            return false;
        }

        return extension_loaded('gd') || extension_loaded('imagick');
    }

    /**
     * Periksa ketersediaan binary eksternal (nama binary dikodekan konstan).
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
     * Render setiap halaman PDF menjadi gambir PNG (200 DPI) via pdftoppm.
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
     * Decode QR pada satu berkas gambir (blob PNG/JPEG) menggunakan Zxing\QrReader.
     *
     * @return array{found: bool, content: string|null, unreadable: bool}
     */
    private function decodeImageBlob(string $imageBytes): array
    {
        try {
            $reader = new QrReader($imageBytes, QrReader::SOURCE_TYPE_BLOB, false);
            $reader->decode();

            $result = $reader->getResult();

            if ($result !== false && $result !== null && method_exists($result, 'getText')) {
                $content = $result->getText();

                if ($content !== null && $content !== '') {
                    return ['found' => true, 'content' => $content, 'unreadable' => false];
                }
            }

            return ['found' => false, 'content' => null, 'unreadable' => false];
        } catch (\InvalidArgumentException $e) {
            // Gambir rusak atau format tidak dikenali imagecreatefromstring
            return ['found' => false, 'content' => null, 'unreadable' => true];
        } catch (\Throwable $e) {
            return ['found' => false, 'content' => null, 'unreadable' => true];
        }
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
        $dir = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'cafe_nib_qr_' . uniqid('', true);

        @mkdir($dir, 0700, true);

        return $dir;
    }

    /**
     * Bersihkan direktori sementara dan seluruh isinya dalam kondisi sukses
     * maupun gagal/exception.
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

    private function failedResult(string $error, ?int $pageCount, ?bool $qrFound): array
    {
        return [
            'status' => self::STATUS_QR_FAILED,
            'page_count' => $pageCount,
            'qr_found' => $qrFound,
            'decoded_content' => null,
            'page_number' => null,
            'error' => $error,
        ];
    }

    private function invalidDocumentResult(string $error): array
    {
        return [
            'status' => self::STATUS_INVALID_DOCUMENT,
            'page_count' => null,
            'qr_found' => null,
            'decoded_content' => null,
            'page_number' => null,
            'error' => $error,
        ];
    }

    private function unavailableResult(string $error): array
    {
        return [
            'status' => self::STATUS_QR_UNAVAILABLE,
            'page_count' => null,
            'qr_found' => null,
            'decoded_content' => null,
            'page_number' => null,
            'error' => $error,
        ];
    }

    private function unreadableResult(string $error, ?int $pageCount): array
    {
        return [
            'status' => self::STATUS_QR_UNREADABLE,
            'page_count' => $pageCount,
            'qr_found' => false,
            'decoded_content' => null,
            'page_number' => null,
            'error' => $error,
        ];
    }
}
