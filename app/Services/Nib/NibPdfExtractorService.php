<?php

namespace App\Services\Nib;

use App\Models\Nib;
use Illuminate\Support\Facades\Storage;
use Smalot\PdfParser\Parser;

/**
 * Ekstraksi teks dari dokumen NIB (PDF digital) yang disimpan di private storage.
 *
 * Komponen ini hanya bertanggung jawab atas ekstraksi teks PDF dan klasifikasi
 * hasil ekstraksi. Tidak melakukan OCR, QR decoding, validasi URL OSS,
 * structural comparison, atau keputusan status screening.
 */
class NibPdfExtractorService
{
    /**
     * Status ekstraksi yang可能.
     */
    public const STATUS_TEXT_EXTRACTED = 'TEXT_EXTRACTED';
    public const STATUS_OCR_REQUIRED = 'OCR_REQUIRED';
    public const STATUS_INVALID_PDF = 'INVALID_PDF';
    public const STATUS_EXTRACTION_FAILED = 'EXTRACTION_FAILED';

    /**
     * Ukuran maksimal file PDF yang dapat diproses (5 MB).
     */
    private const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

    /**
     * Jumlah maksimal halaman yang dapat diproses.
     */
    private const MAX_PAGE_COUNT = 50;

    /**
     * Disk penyimpanan yang digunakan untuk dokumen NIB privat.
     */
    private const STORAGE_DISK = 'local';

    /**
     * Ekstrak teks dari dokumen NIB yang dimiliki oleh record NIB.
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
    public function extract(string $id_nib): array
    {
        // Ambil record NIB dari database (tidak menerima path file sembarang)
        $nib = Nib::where('id_nib', $id_nib)->first();

        if (!$nib) {
            return $this->failedResult('Record NIB tidak ditemukan.');
        }

        $path = $nib->dokumen_nib;

        if (!$path) {
            return $this->failedResult('Dokumen NIB tidak tersedia.');
        }

        // Validasi file ada di private storage
        if (!Storage::disk(self::STORAGE_DISK)->exists($path)) {
            return $this->failedResult('Berkas dokumen NIB tidak ditemukan di private storage.');
        }

        // Validasi ukuran file
        $fileSize = Storage::disk(self::STORAGE_DISK)->size($path);
        if ($fileSize === false || $fileSize > self::MAX_FILE_SIZE_BYTES) {
            return $this->failedResult('File terlalu besar untuk diproses.');
        }

        // Baca isi file
        $fileContents = Storage::disk(self::STORAGE_DISK)->get($path);

        if ($fileContents === false) {
            return $this->failedResult('Gagal membaca berkas dari private storage.');
        }

        // Validasi header PDF
        if (! $this->isValidPdfHeader($fileContents)) {
            return $this->invalidPdfResult('File bukan PDF yang didukung.');
        }

        // Ekstrak teks menggunakan Smalot PdfParser
        try {
            $parser = new Parser();
            $pdf = $parser->parseContent($fileContents);

            $pages = $pdf->getPages();
            $pageCount = count($pages);

            if ($pageCount === 0) {
                return $this->invalidPdfResult('PDF tidak memiliki halaman.');
            }

            if ($pageCount > self::MAX_PAGE_COUNT) {
                return $this->failedResult('PDF melebihi batas jumlah halaman yang dapat diproses.');
            }

            $extractedPages = [];
            $fullTextParts = [];
            $hasExtractableText = false;

            foreach ($pages as $page) {
                $pageNumber = $page->getPageNumber();
                $text = $page->getText() ?? '';

                $extractedPages[] = [
                    'page' => $pageNumber,
                    'text' => $text,
                ];

                if (trim($text) !== '') {
                    $hasExtractableText = true;
                }

                $fullTextParts[] = $text;
            }

            $fullText = implode("\n", $fullTextParts);

            if ($hasExtractableText) {
                return [
                    'status' => self::STATUS_TEXT_EXTRACTED,
                    'page_count' => $pageCount,
                    'has_extractable_text' => true,
                    'pages' => $extractedPages,
                    'full_text' => $fullText,
                    'error' => null,
                ];
            }

            // PDF valid dan dapat dibaca, tetapi tidak ada teks yang cukup
            return [
                'status' => self::STATUS_OCR_REQUIRED,
                'page_count' => $pageCount,
                'has_extractable_text' => false,
                'pages' => $extractedPages,
                'full_text' => '',
                'error' => null,
            ];
        } catch (\Throwable $e) {
            // Log error teknis untuk debugging, jangan kirim ke pengguna
            \Illuminate\Support\Facades\Log::error('PDF extraction failed', [
                'id_nib' => $id_nib,
                'path' => $path,
                'error' => $e->getMessage(),
            ]);

            return $this->failedResult('Gagal mengekstrak teks dari PDF.');
        }
    }

    /**
     * Buat hasil ekstraksi gagal.
     */
    private function failedResult(string $error): array
    {
        return [
            'status' => self::STATUS_EXTRACTION_FAILED,
            'page_count' => null,
            'has_extractable_text' => null,
            'pages' => null,
            'full_text' => null,
            'error' => $error,
        ];
    }

    /**
     * Buat hasil PDF tidak valid.
     */
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

    /**
     * Validasi header PDF (%PDF-).
     */
    private function isValidPdfHeader(string $contents): bool
    {
        return str_starts_with($contents, '%PDF-');
    }
}
