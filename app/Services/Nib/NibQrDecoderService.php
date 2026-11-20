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

    // Alias konseptual (tetap konsisten dengan status yang ada).
    public const STATUS_QR_DECODE_ERROR = self::STATUS_QR_FAILED;

    private const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
    private const MAX_PAGE_COUNT = 50;
    private const STORAGE_DISK = 'local';

    private const PDFINFO_TIMEOUT = 60;
    private const RENDER_TIMEOUT = 300;
    private const PDFIMAGES_TIMEOUT = 120;

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
     *     error: string|null,
     *     decode_method: string|null,
     *     render_dpi: int|null
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
                $pdfinfoBin = config('nib.pdfinfo_path', 'pdfinfo');
                $pdftoppmBin = config('nib.pdftoppm_path', 'pdftoppm');

                if (!$this->binaryAvailable($pdfinfoBin) || !$this->binaryAvailable($pdftoppmBin)) {
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

                // Pra-pindai gambar tertanam: QR OSS sering disimpan sebagai
                // gambar terpisah sehingga jauh lebih cepat dan akurat dibaca
                // langsung tanpa merender seluruh halaman.
                $embeddedResult = $this->decodeEmbeddedImages($inputPath, $pageCount);

                if ($embeddedResult !== null) {
                    return $embeddedResult;
                }

                $baseDpi = (int) config('nib.dpi', 200);
                $fallbackDpis = (array) config('nib.qr_dpi_fallbacks', [300]);

                $unreadable = false;

                // Pass 1: resolusi awal.
                $images = $this->renderPages($inputPath, $tempDir, $baseDpi);

                if (count($images) === 0) {
                    Log::warning('NIB QR decode: No images rendered', ['id_nib' => $id_nib]);
                    return $this->unreadableResult('Tidak ada halaman yang berhasil dirender.', $pageCount);
                }

                Log::info('NIB QR decode: Rendering successful', [
                    'id_nib' => $id_nib,
                    'count' => count($images),
                    'dpi' => $baseDpi,
                ]);

                $result = $this->scanRenderedPages($images, $pageCount, $baseDpi, $unreadable);

                if ($result !== null) {
                    return $result;
                }

                // Pass fallback: resolusi lebih tinggi (hanya jika belum ditemukan).
                foreach ($fallbackDpis as $fallbackDpi) {
                    $fallbackDpi = (int) $fallbackDpi;
                    if ($fallbackDpi <= 0 || $fallbackDpi === $baseDpi) {
                        continue;
                    }

                    // Render ulang ke direktori terpisah agar tidak menimpa.
                    $fallbackDir = $this->createTempDir();
                    try {
                        $fallbackInput = $fallbackDir . DIRECTORY_SEPARATOR . 'source.pdf';
                        file_put_contents($fallbackInput, $fileContents);
                        $fallbackImages = $this->renderPages($fallbackInput, $fallbackDir, $fallbackDpi);

                        if (count($fallbackImages) === 0) {
                            continue;
                        }

                        $fallbackUnreadable = false;
                        $fallbackResult = $this->scanRenderedPages(
                            $fallbackImages,
                            $pageCount,
                            $fallbackDpi,
                            $fallbackUnreadable
                        );

                        if ($fallbackResult !== null) {
                            return $fallbackResult;
                        }

                        if ($fallbackUnreadable) {
                            $unreadable = true;
                        }
                    } finally {
                        $this->cleanupTempDir($fallbackDir);
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
                    'decode_method' => null,
                    'render_dpi' => $baseDpi,
                ];
            }

            // JPEG / PNG: proses langsung sebagai satu halaman.
            $decoded = $this->decodeImageBytesWithVariants($fileContents, 0, 'original_blob');

            if ($decoded['found']) {
                return [
                    'status' => self::STATUS_QR_FOUND,
                    'page_count' => 1,
                    'qr_found' => true,
                    'decoded_content' => $decoded['content'],
                    'page_number' => 1,
                    'error' => null,
                    'decode_method' => $decoded['method'],
                    'render_dpi' => null,
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
                'decode_method' => null,
                'render_dpi' => null,
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
     * Pindai daftar gambar yang sudah dirender; kembalikan hasil QR_FOUND jika ditemukan.
     *
     * @param  list<string> $images
     * @return array|null  Hasil QR_FOUND atau null jika tidak ditemukan
     */
    private function scanRenderedPages(array $images, int $pageCount, int $dpi, bool &$unreadable): ?array
    {
        foreach ($images as $index => $imagePath) {
            $pageNumber = $index + 1;
            $imageBytes = @file_get_contents($imagePath);

            if ($imageBytes === false) {
                $unreadable = true;
                continue;
            }

            $decoded = $this->decodeImageBytesWithVariants($imageBytes, $dpi, 'page_render');

            if ($decoded['found']) {
                Log::info('NIB QR decode: QR found', [
                    'id_nib' => null,
                    'page' => $pageNumber,
                    'method' => $decoded['method'],
                    'dpi' => $dpi,
                ]);
                return [
                    'status' => self::STATUS_QR_FOUND,
                    'page_count' => $pageCount,
                    'qr_found' => true,
                    'decoded_content' => $decoded['content'],
                    'page_number' => $pageNumber,
                    'error' => null,
                    'decode_method' => $decoded['method'],
                    'render_dpi' => $dpi,
                ];
            }

            if ($decoded['unreadable']) {
                $unreadable = true;
            }
        }

        return null;
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
     * Periksa ketersediaan binary eksternal (mendukung path absolut Windows/Linux).
     */
    private function binaryAvailable(string $binary): bool
    {
        if (file_exists($binary) && is_file($binary)) {
            return is_executable($binary) || PHP_OS_FAMILY === 'Windows';
        }

        $cmd = PHP_OS_FAMILY === 'Windows'
            ? "where " . escapeshellarg($binary) . " 2>nul"
            : "which " . escapeshellarg($binary) . " 2>/dev/null";

        $output = shell_exec($cmd);

        return is_string($output) && trim($output) !== '';
    }

    /**
     * Hitung jumlah halaman PDF menggunakan pdfinfo.
     */
    private function countPages(string $pdfPath): ?int
    {
        $pdfinfoBin = config('nib.pdfinfo_path', 'pdfinfo');
        $process = new Process([$pdfinfoBin, $pdfPath]);
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
     * Render halaman PDF menjadi gambir PNG pada DPI tertentu via pdftoppm.
     *
     * @return list<string> daftar path gambir terurut berdasarkan nomor halaman
     */
    private function renderPages(string $pdfPath, string $tempDir, int $dpi): array
    {
        $prefix = $tempDir . DIRECTORY_SEPARATOR . 'page';
        $pdftoppmBin = config('nib.pdftoppm_path', 'pdftoppm');

        $process = new Process([
            $pdftoppmBin,
            '-r', (string) $dpi,
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
     * Pra-pindai gambar tertanam pada PDF via pdfimages, lalu decode QR dari
     * setiap gambar. Mengembalikan hasil QR_FOUND atau null bila tidak ada.
     */
    private function decodeEmbeddedImages(string $pdfPath, int $pageCount): ?array
    {
        $pdfimagesBin = $this->resolvePdfimagesBinary();

        if (!$this->binaryAvailable($pdfimagesBin)) {
            return null;
        }

        $maxImages = (int) config('nib.qr_embedded_max_images', 10);
        $tempDir = $this->createTempDir();

        try {
            $prefix = $tempDir . DIRECTORY_SEPARATOR . 'emb';

            $process = new Process([
                $pdfimagesBin,
                '-png',
                '-p',
                $pdfPath,
                $prefix,
            ]);
            $process->setTimeout(self::PDFIMAGES_TIMEOUT);
            $process->run();

            if (!$process->isSuccessful()) {
                return null;
            }

            $files = glob($tempDir . DIRECTORY_SEPARATOR . 'emb-*.png') ?: [];

            if ($maxImages > 0) {
                $files = array_slice($files, 0, $maxImages);
            }

            foreach ($files as $file) {
                $imageBytes = @file_get_contents($file);

                if ($imageBytes === false) {
                    continue;
                }

                $decoded = $this->decodeEmbeddedImageBytes($imageBytes);

                if ($decoded['found']) {
                    return [
                        'status' => self::STATUS_QR_FOUND,
                        'page_count' => $pageCount,
                        'qr_found' => true,
                        'decoded_content' => $decoded['content'],
                        'page_number' => $this->embeddedImagePageNumber($file),
                        'error' => null,
                        'decode_method' => $decoded['method'],
                        'render_dpi' => null,
                    ];
                }
            }

            return null;
        } catch (\Throwable $e) {
            Log::warning('NIB QR decode: embedded image extraction failed', [
                'error' => $e->getMessage(),
            ]);

            return null;
        } finally {
            $this->cleanupTempDir($tempDir);
        }
    }

    /**
     * Tentukan path binary pdfimages. Jika tidak dikonfigurasi eksplisit,
     * turunkan dari direktori pdftoppm agar tetap satu paket Poppler.
     */
    private function resolvePdfimagesBinary(): string
    {
        $configured = (string) config('nib.pdfimages_path', 'pdfimages');

        if ($this->binaryAvailable($configured)) {
            return $configured;
        }

        $pdftoppm = (string) config('nib.pdftoppm_path', 'pdftoppm');
        $directory = dirname($pdftoppm);

        if ($directory !== '.' && $directory !== '') {
            $candidate = $directory . DIRECTORY_SEPARATOR . 'pdfimages'
                . (PHP_OS_FAMILY === 'Windows' ? '.exe' : '');

            if ($this->binaryAvailable($candidate)) {
                return $candidate;
            }
        }

        return $configured;
    }

    /**
     * Decode QR dari satu gambar tertanam dengan strategi ringan (tanpa
     * rotasi/region) karena QR tertanam umumnya bersih dan berorientasi tegak.
     *
     * @return array{found: bool, content: string|null, unreadable: bool, method: string|null}
     */
    private function decodeEmbeddedImageBytes(string $imageBytes): array
    {
        $gd = @imagecreatefromstring($imageBytes);

        if ($gd === false) {
            return ['found' => false, 'content' => null, 'unreadable' => true, 'method' => null];
        }

        $scaled = null;
        $width = imagesx($gd);
        $height = imagesy($gd);
        $maxPixels = (int) config('nib.qr_max_pixels', 4000000);

        if ($maxPixels > 0 && ($width * $height) > $maxPixels) {
            $ratio = sqrt($maxPixels / ($width * $height));
            $newWidth = max(1, (int) floor($width * $ratio));
            $newHeight = max(1, (int) floor($height * $ratio));
            $candidate = imagescale($gd, $newWidth, $newHeight, IMG_BICUBIC);

            if ($candidate !== false) {
                $scaled = $candidate;
            }
        }

        $work = $scaled ?? $gd;

        try {
            $result = $this->decodeGdImage($work, 0, 'embedded_image:original');
            if ($result['found']) {
                return $result;
            }

            $gray = $this->toGrayscale($work);
            $result = $this->decodeGdImage($gray, 0, 'embedded_image:grayscale');
            imagedestroy($gray);
            if ($result['found']) {
                return $result;
            }

            $threshold = $this->toGrayscale($work);
            @imagefilter($threshold, IMG_FILTER_CONTRAST, -100);
            $result = $this->decodeGdImage($threshold, 0, 'embedded_image:threshold');
            imagedestroy($threshold);
            if ($result['found']) {
                return $result;
            }

            $w = imagesx($work);
            $h = imagesy($work);

            if ($w <= 400 && $h <= 400) {
                $factor = max(2, (int) config('nib.qr_upscale_factor', 2));
                $upscaled = imagescale($work, $w * $factor, $h * $factor, IMG_BICUBIC);

                if ($upscaled !== false) {
                    $result = $this->decodeGdImage($upscaled, 0, 'embedded_image:upscale_' . $factor . 'x');
                    imagedestroy($upscaled);
                    if ($result['found']) {
                        return $result;
                    }
                }
            }

            return ['found' => false, 'content' => null, 'unreadable' => false, 'method' => null];
        } finally {
            if ($scaled !== null) {
                imagedestroy($scaled);
            }
            imagedestroy($gd);
        }
    }

    /**
     * Decode QR pada satu blob gambir dengan strategi bertahap:
     * asli -> preprocessing -> candidate regions.
     *
     * @return array{found: bool, content: string|null, unreadable: bool, method: string|null}
     */
    private function decodeImageBytesWithVariants(string $imageBytes, int $dpi, string $baseMethod): array
    {
        $gd = @imagecreatefromstring($imageBytes);

        if ($gd === false) {
            return ['found' => false, 'content' => null, 'unreadable' => true, 'method' => null];
        }

        $scaled = null;
        $maxPixels = (int) config('nib.qr_max_pixels', 4000000);

        if ($maxPixels > 0) {
            $width = imagesx($gd);
            $height = imagesy($gd);
            $pixels = $width * $height;

            if ($pixels > $maxPixels) {
                $ratio = sqrt($maxPixels / $pixels);
                $newWidth = max(1, (int) floor($width * $ratio));
                $newHeight = max(1, (int) floor($height * $ratio));
                $candidate = imagescale($gd, $newWidth, $newHeight, IMG_BICUBIC);

                if ($candidate !== false) {
                    $scaled = $candidate;
                }
            }
        }

        $work = $scaled ?? $gd;
        $deadline = $this->pageDeadline((int) config('nib.qr_page_time_budget', 120));

        try {
            return $this->decodeGdWithVariants($work, $dpi, $baseMethod, $deadline);
        } finally {
            if ($scaled !== null) {
                imagedestroy($scaled);
            }
            imagedestroy($gd);
        }
    }

    /**
     * Tentukan batas waktu decode untuk satu halaman/gambar.
     */
    private function pageDeadline(int $seconds): ?float
    {
        return $seconds > 0 ? microtime(true) + $seconds : null;
    }

    /**
     * Apakah anggaran waktu decode sudah habis.
     */
    private function timeBudgetExceeded(?float $deadline): bool
    {
        return $deadline !== null && microtime(true) >= $deadline;
    }

    /**
     * Strategi decoding bertahap pada GD image.
     */
    private function decodeGdWithVariants(\GdImage $base, int $dpi, string $baseMethod, ?float $deadline = null): array
    {
        $unreadable = false;

        // 1. Asli
        $r = $this->decodeGdImage($base, $dpi, $baseMethod . ':original');
        if ($r['found']) {
            return $r;
        }
        if ($r['unreadable']) {
            $unreadable = true;
        }

        $w = imagesx($base);
        $h = imagesy($base);

        if ($this->timeBudgetExceeded($deadline)) {
            return ['found' => false, 'content' => null, 'unreadable' => $unreadable, 'method' => null];
        }

        // 2. Grayscale
        $gray = $this->toGrayscale($base);
        $r = $this->decodeGdImage($gray, $dpi, $baseMethod . ':grayscale');
        imagedestroy($gray);
        if ($r['found']) {
            return $r;
        }
        if ($r['unreadable']) {
            $unreadable = true;
        }

        if ($this->timeBudgetExceeded($deadline)) {
            return ['found' => false, 'content' => null, 'unreadable' => $unreadable, 'method' => null];
        }

        // 3. Peningkatan kontras
        $contrast = $this->toGrayscale($base);
        @imagefilter($contrast, IMG_FILTER_CONTRAST, -40);
        $r = $this->decodeGdImage($contrast, $dpi, $baseMethod . ':contrast');
        imagedestroy($contrast);
        if ($r['found']) {
            return $r;
        }
        if ($r['unreadable']) {
            $unreadable = true;
        }

        if ($this->timeBudgetExceeded($deadline)) {
            return ['found' => false, 'content' => null, 'unreadable' => $unreadable, 'method' => null];
        }

        // 4. Threshold binarization (kontras ekstrem, cepat)
        $thrImg = $this->toGrayscale($base);
        @imagefilter($thrImg, IMG_FILTER_CONTRAST, -100);
        $r = $this->decodeGdImage($thrImg, $dpi, $baseMethod . ':threshold');
        imagedestroy($thrImg);
        if ($r['found']) {
            return $r;
        }
        if ($r['unreadable']) {
            $unreadable = true;
        }

        if ($this->timeBudgetExceeded($deadline)) {
            return ['found' => false, 'content' => null, 'unreadable' => $unreadable, 'method' => null];
        }

        // 5. Pembesaran (upscale) dengan interpolasi - hanya pada gambar kecil
        //    untuk menghindari pemborosan memori pada halaman penuh.
        if ($w <= 800 && $h <= 800) {
            $factor = (int) config('nib.qr_upscale_factor', 2);
            if ($factor < 2) {
                $factor = 2;
            }
            $upscaled = imagescale($base, $w * $factor, $h * $factor, IMG_BICUBIC);
            if ($upscaled !== false) {
                $r = $this->decodeGdImage($upscaled, $dpi, $baseMethod . ':upscale_' . $factor . 'x');
                if ($r['found']) {
                    imagedestroy($upscaled);
                    return $r;
                }
                if ($r['unreadable']) {
                    $unreadable = true;
                }
                imagedestroy($upscaled);
            }
        }

        if ($this->timeBudgetExceeded($deadline)) {
            return ['found' => false, 'content' => null, 'unreadable' => $unreadable, 'method' => null];
        }

        // 6. Rotasi (orientasi) - coba 90/180/270
        foreach ([90, 180, 270] as $angle) {
            $rotated = imagerotate($base, $angle, 0);
            if ($rotated !== false) {
                $r = $this->decodeGdImage($rotated, $dpi, $baseMethod . ':rotate_' . $angle);
                imagedestroy($rotated);
                if ($r['found']) {
                    return $r;
                }
                if ($r['unreadable']) {
                    $unreadable = true;
                }
            }
        }

        if ($this->timeBudgetExceeded($deadline)) {
            return ['found' => false, 'content' => null, 'unreadable' => $unreadable, 'method' => null];
        }

        // 7. Candidate regions (grid dengan overlap) pada gambar asli + grayscale
        $regionResult = $this->decodeCandidateRegions($base, $dpi, $baseMethod, $deadline);
        if ($regionResult !== null && $regionResult['found']) {
            return $regionResult;
        }
        if ($regionResult !== null && $regionResult['unreadable']) {
            $unreadable = true;
        }

        return [
            'found' => false,
            'content' => null,
            'unreadable' => $unreadable,
            'method' => null,
        ];
    }

    /**
     * Decode candidate regions (grid) dari gambar.
     */
    private function decodeCandidateRegions(\GdImage $base, int $dpi, string $baseMethod, ?float $deadline = null): ?array
    {
        $w = imagesx($base);
        $h = imagesy($base);

        // Grid 3x3 dengan overlap; setiap region cukup besar untuk memuat QR.
        $cols = 2;
        $rows = 2;
        $overlap = 0.4;

        $tileW = (int) ceil($w / $cols * (1 + $overlap));
        $tileH = (int) ceil($h / $rows * (1 + $overlap));
        $stepX = (int) floor($w / $cols);
        $stepY = (int) floor($h / $rows);
        if ($stepX < 1) { $stepX = 1; }
        if ($stepY < 1) { $stepY = 1; }

        $unreadable = false;

        for ($ri = 0; $ri < $rows; $ri++) {
            for ($ci = 0; $ci < $cols; $ci++) {
                $x = $ci * $stepX;
                $y = $ri * $stepY;
                $x2 = min($w, $x + $tileW);
                $y2 = min($h, $y + $tileH);
                $rw = $x2 - $x;
                $rh = $y2 - $y;
                if ($rw < 40 || $rh < 40) {
                    continue;
                }

                if ($this->timeBudgetExceeded($deadline)) {
                    return $unreadable
                        ? ['found' => false, 'content' => null, 'unreadable' => true, 'method' => null]
                        : null;
                }

                $crop = imagecreatetruecolor($rw, $rh);
                imagecopy($crop, $base, 0, 0, $x, $y, $rw, $rh);

                // Margin sudah tercakup oleh region yang cukup besar; decode.
                $r = $this->decodeGdImage($crop, $dpi, $baseMethod . ':region');
                if ($r['found']) {
                    imagedestroy($crop);
                    return $r;
                }
                if ($r['unreadable']) {
                    $unreadable = true;
                }

                // (region preprocessing dihilangkan untuk menjaga performa;
                //  full-page preprocessing sudah mencakup kasus kontras rendah)

                imagedestroy($crop);
            }
        }

        return $unreadable
            ? ['found' => false, 'content' => null, 'unreadable' => true, 'method' => null]
            : null;
    }

    /**
     * Decode satu GD image dengan Zxing.
     *
     * @return array{found: bool, content: string|null, unreadable: bool, method: string|null}
     */
    private function decodeGdImage(\GdImage $gd, int $dpi, string $method): array
    {
        try {
            $reader = new QrReader($gd, QrReader::SOURCE_TYPE_RESOURCE, false);
            $reader->decode();

            $result = $reader->getResult();

            if ($result !== false && $result !== null && method_exists($result, 'getText')) {
                $content = $result->getText();

                if ($content !== null && $content !== '') {
                    return ['found' => true, 'content' => $content, 'unreadable' => false, 'method' => $method];
                }
            }

            return ['found' => false, 'content' => null, 'unreadable' => false, 'method' => null];
        } catch (\InvalidArgumentException $e) {
            return ['found' => false, 'content' => null, 'unreadable' => true, 'method' => null];
        } catch (\Throwable $e) {
            return ['found' => false, 'content' => null, 'unreadable' => true, 'method' => null];
        }
    }

    /**
     * Konversi GD image ke grayscale (clone baru).
     */
    private function toGrayscale(\GdImage $src): \GdImage
    {
        $w = imagesx($src);
        $h = imagesy($src);
        $dst = imagecreatetruecolor($w, $h);
        imagecopy($dst, $src, 0, 0, 0, 0, $w, $h);
        @imagefilter($dst, IMG_FILTER_GRAYSCALE);
        return $dst;
    }

    /**
     * Binarisasi (threshold) GD image.
     */
    private function thresholdImage(\GdImage $src, int $threshold): \GdImage
    {
        $w = imagesx($src);
        $h = imagesy($src);
        $gray = $this->toGrayscale($src);

        for ($y = 0; $y < $h; $y++) {
            for ($x = 0; $x < $w; $x++) {
                $rgb = imagecolorat($gray, $x, $y);
                $r = ($rgb >> 16) & 0xFF;
                $g = ($rgb >> 8) & 0xFF;
                $b = $rgb & 0xFF;
                $lum = (int) round(($r + $g + $b) / 3);
                $color = $lum >= $threshold ? 0xFFFFFF : 0x000000;
                imagesetpixel($gray, $x, $y, $color);
            }
        }

        return $gray;
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
     * Ekstrak nomor halaman dari nama file hasil pdfimages -p (emb-001-003.png).
     */
    private function embeddedImagePageNumber(string $path): int
    {
        $basename = basename($path);

        if (preg_match('/emb-(\d+)-\d+\.png$/i', $basename, $matches)) {
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
            'decode_method' => null,
            'render_dpi' => null,
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
            'decode_method' => null,
            'render_dpi' => null,
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
            'decode_method' => null,
            'render_dpi' => null,
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
            'decode_method' => null,
            'render_dpi' => null,
        ];
    }
}
