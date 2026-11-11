<?php

namespace App\Services\Nib;

use App\Models\Nib;
use App\Models\ProfilPerusahaan;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Orquestrasi ekstraksi dan normalisasi data NIB.
 *
 * Service ini mengatur alur ekstraksi data dari dokumen NIB menggunakan
 * service yang sudah tersedia (PDF extractor, OCR, QR decoder, URL validator)
 * dan menghasilkan kandidat informasi NIB dalam struktur array di memori.
 *
 * Tidak memutuskan penerimaan atau penolakan perusahaan.
 * Tidak menyimpan hasil ke database.
 * Tidak mengubah status_screening atau status_verifikasi.
 */
class NibDataExtractorService
{
    // Status ekstraksi keseluruhan dokumen
    public const STATUS_EXTRACTION_SUCCESS = 'BERHASIL';
    public const STATUS_EXTRACTION_FAILED = 'GAGAL';
    public const STATUS_EXTRACTION_AMBIGUOUS = 'AMBIGUOUS';

    // Status field ekstraksi
    public const FIELD_FOUND = 'FIELD_FOUND';
    public const FIELD_NOT_FOUND = 'FIELD_NOT_FOUND';
    public const FIELD_UNREADABLE = 'FIELD_UNREADABLE';
    public const FIELD_INVALID = 'FIELD_INVALID';
    public const FIELD_AMBIGUOUS = 'FIELD_AMBIGUOUS';

    // Status validasi field
    public const VALIDATION_VALID = 'VALID';
    public const VALIDATION_INVALID = 'INVALID';
    public const VALIDATION_UNKNOWN = 'UNKNOWN';
    public const VALIDATION_AMBIGUOUS = 'AMBIGUOUS';

    // Konstanta internal
    private const NIB_DIGIT_LENGTH = 13;
    private const NIB_PREFIX_PATTERN = '/^(?:NIB|Nomor Induk Berusaha|Nomor NIB)\s*:?\s*/i';

    // Label kandidat untuk setiap field
    private const LABEL_NOMOR_NIB = [
        'nomor induk berusaha',
        'nib',
        'nomor nib',
    ];

    private const LABEL_NAMA_PERUSAHAAN = [
        'nama perusahaan',
        'nama pelaku usaha',
        'nama usaha',
    ];

    private const LABEL_ALAMAT = [
        'alamat',
        'alamat kantor',
        'alamat perusahaan',
        'tempat usaha',
    ];

    private const LABEL_TANGGAL_BERDIRI = [
        'tanggal berdiri',
    ];

    private const LABEL_KECAMATAN = [
        'kecamatan',
    ];

    private ?NibPdfExtractorService $pdfExtractor = null;
    private ?NibOcrService $ocrService = null;
    private ?NibQrDecoderService $qrDecoder = null;
    private ?NibQrUrlValidatorService $urlValidator = null;

    /**
     * @param  NibPdfExtractorService|null  $pdfExtractor
     * @param  NibOcrService|null  $ocrService
     * @param  NibQrDecoderService|null  $qrDecoder
     * @param  NibQrUrlValidatorService|null  $urlValidator
     */
    public function __construct(
        ?NibPdfExtractorService $pdfExtractor = null,
        ?NibOcrService $ocrService = null,
        ?NibQrDecoderService $qrDecoder = null,
        ?NibQrUrlValidatorService $urlValidator = null
    ) {
        $this->pdfExtractor = $pdfExtractor;
        $this->ocrService = $ocrService;
        $this->qrDecoder = $qrDecoder;
        $this->urlValidator = $urlValidator;
    }

    /**
     * Jalankan ekstraksi dan normalisasi data NIB.
     *
     * @param  string  $id_nib  Primary key record NIB
     * @param  ProfilPerusahaan|null  $profilPerusahaan  Profil perusahaan untuk perbandingan (opsional)
     * @return array{
     *     status_ekstraksi: string,
     *     dokumen: array{id_nib: string|null, total_halaman: int|null, sumber_teks: string},
     *     fields: list<array>,
     *     qr: array{ditemukan: bool, konten: string|null, jenis: string|null, url_validasi: array|null},
     *     perbandingan: array{field_dibandingkan: list<string>, indikator_kemiripan: null, ketidaksesuaian: list<array>, field_tidak_dapat_dibandingkan: list<string>},
     *     perlu_review_manual: bool,
     *     alasan_review: string|null
     * }
     */
    public function extract(string $id_nib, ?ProfilPerusahaan $profilPerusahaan = null): array
    {
        $nib = Nib::where('id_nib', $id_nib)->first();

        if (!$nib) {
            return $this->buildFailedResult(
                'Record NIB tidak ditemukan.',
                null,
                null
            );
        }

        $path = $nib->dokumen_nib ?? null;

        if (!$path) {
            return $this->buildFailedResult(
                'Dokumen NIB tidak tersedia.',
                $nib->id_nib,
                null
            );
        }

        // Langkah 1: Ekstraksi teks dari PDF
        $pdfResult = $this->extractPdf($nib);

        // Langkah 2: OCR fallback jika diperlukan
        // OCR diperlukan jika:
        // - PDF mengembalikan OCR_REQUIRED (tidak ada teks sama sekali)
        // - PDF mengembalikan TEXT_EXTRACTED tetapi ada halaman dengan teks kosong (campuran)
        $ocrResult = null;
        $mergedPages = [];
        $ocrWasUsed = false;

        if ($pdfResult['status'] === NibPdfExtractorService::STATUS_TEXT_EXTRACTED) {
            $pdfPages = $pdfResult['pages'] ?? [];
            $hasEmptyPages = false;

            foreach ($pdfPages as $page) {
                if (trim($page['text'] ?? '') === '') {
                    $hasEmptyPages = true;
                    break;
                }
            }

            if ($hasEmptyPages) {
                // Ada halaman kosong, jalankan OCR untuk fallback
                $ocrResult = $this->runOcr($nib);

                if ($ocrResult['status'] === NibOcrService::STATUS_OCR_COMPLETED) {
                    $mergedPages = $this->mergePdfOcrPages(
                        $pdfPages,
                        $ocrResult['pages'] ?? []
                    );
                    $ocrWasUsed = true;
                } elseif ($ocrResult['status'] === NibOcrService::STATUS_OCR_EMPTY) {
                    $mergedPages = $this->normalizePdfPages($pdfPages);
                } else {
                    $mergedPages = $this->normalizePdfPages($pdfPages);
                }
            } else {
                $mergedPages = $this->normalizePdfPages($pdfPages);
            }
        } elseif ($pdfResult['status'] === NibPdfExtractorService::STATUS_OCR_REQUIRED) {
            $ocrResult = $this->runOcr($nib);

            if ($ocrResult['status'] === NibOcrService::STATUS_OCR_COMPLETED) {
                $mergedPages = $this->mergePdfOcrPages(
                    $pdfResult['pages'] ?? [],
                    $ocrResult['pages'] ?? []
                );
                $ocrWasUsed = true;
            } elseif ($ocrResult['status'] === NibOcrService::STATUS_OCR_EMPTY) {
                $mergedPages = $this->normalizePdfPages($pdfResult['pages'] ?? []);
            } else {
                $mergedPages = $this->normalizePdfPages($pdfResult['pages'] ?? []);
            }
        } else {
            // PDF invalid atau gagal diekstrak
            return $this->buildFailedResult(
                $pdfResult['error'] ?? 'Gagal mengekstrak teks dari PDF.',
                $nib->id_nib,
                $pdfResult['page_count']
            );
        }

        // Langkah 3: Gabungkan teks semua halaman untuk pencarian field
        $fullText = $this->buildFullText($mergedPages);
        $hasAnyText = trim($fullText) !== '';

        // Langkah 4: QR decoding
        $qrResult = $this->extractQr($nib);

        // Langkah 5: Ekstraksi field
        $fields = $this->extractFields($mergedPages, $fullText, $qrResult);

        // Langkah 6: Perbandingan dengan database
        $comparison = $this->compareWithDatabase($fields, $profilPerusahaan, $nib);

        // Langkah 7: Tentukan status ekstraksi keseluruhan
        $extractionStatus = $this->determineExtractionStatus($fields, $hasAnyText, $mergedPages);
        $needsReview = $this->determineNeedsReview($fields, $extractionStatus, $comparison);
        $reviewReason = $this->buildReviewReason($fields, $comparison, $needsReview);

        return [
            'status_ekstraksi' => $extractionStatus,
            'dokumen' => [
                'id_nib' => $nib->id_nib,
                'total_halaman' => $pdfResult['page_count'] ?? null,
                'sumber_teks' => $this->determineTextSource($pdfResult, $ocrWasUsed),
            ],
            'fields' => array_values($fields),
            'qr' => $qrResult,
            'perbandingan' => $comparison,
            'perlu_review_manual' => $needsReview,
            'alasan_review' => $reviewReason,
        ];
    }

    /**
     * Ekstraksi teks dari PDF menggunakan NibPdfExtractorService.
     */
    private function extractPdf(Nib $nib): array
    {
        $extractor = $this->pdfExtractor ?? new NibPdfExtractorService();
        $result = $extractor->extract($nib->id_nib);

        if (!isset($result['status'])) {
            Log::error('NibPdfExtractorService returned invalid result', [
                'id_nib' => $nib->id_nib,
                'result' => $result,
            ]);

            return [
                'status' => NibPdfExtractorService::STATUS_EXTRACTION_FAILED,
                'page_count' => null,
                'pages' => null,
                'error' => 'Hasil ekstraksi PDF tidak valid.',
            ];
        }

        return $result;
    }

    /**
     * Jalankan OCR menggunakan NibOcrService.
     */
    private function runOcr(Nib $nib): array
    {
        $ocr = $this->ocrService ?? new NibOcrService();
        $result = $ocr->ocr($nib->id_nib);

        if (!isset($result['status'])) {
            Log::error('NibOcrService returned invalid result', [
                'id_nib' => $nib->id_nib,
                'result' => $result,
            ]);

            return [
                'status' => NibOcrService::STATUS_OCR_FAILED,
                'page_count' => null,
                'pages' => null,
                'error' => 'Hasil OCR tidak valid.',
            ];
        }

        return $result;
    }

    /**
     * Ekstraksi QR Code menggunakan NibQrDecoderService dan validasi URL.
     */
    private function extractQr(Nib $nib): array
    {
        $decoder = $this->qrDecoder ?? new NibQrDecoderService();
        $result = $decoder->decode($nib->id_nib);

        $qrBase = [
            'ditemukan' => false,
            'konten' => null,
            'jenis' => null,
            'url_validasi' => null,
        ];

        if (!isset($result['status'])) {
            return array_merge($qrBase, ['catatan' => 'Hasil decoding QR tidak valid.']);
        }

        if ($result['status'] !== NibQrDecoderService::STATUS_QR_FOUND) {
            return array_merge($qrBase, [
                'catatan' => $result['error'] ?? 'QR Code tidak ditemukan atau tidak dapat dibaca.',
            ]);
        }

        $content = $result['decoded_content'] ?? null;

        if ($content === null || $content === '') {
            return array_merge($qrBase, ['catatan' => 'Konten QR kosong.']);
        }

        $qrBase['ditemukan'] = true;
        $qrBase['konten'] = $content;

        // Tentukan apakah konten adalah URL
        $validator = $this->urlValidator ?? new NibQrUrlValidatorService(
            config('nib_qr.allowed_hosts', ['oss.go.id'])
        );
        $validation = $validator->validate($content);

        if ($validation['status'] === NibQrUrlValidatorService::STATUS_NON_URL_CONTENT) {
            $qrBase['jenis'] = 'teks';
        } elseif ($validation['status'] === NibQrUrlValidatorService::STATUS_OSS_URL_VALID) {
            $qrBase['jenis'] = 'url';
        } else {
            $qrBase['jenis'] = 'url';
        }

        $qrBase['url_validasi'] = $validation;

        return $qrBase;
    }

    /**
     * Normalisasi halaman PDF menjadi format internal.
     *
     * @param  list<array{page: int, text: string}>  $pages
     * @return list<array{page: int, text: string, sumber: string}>
     */
    private function normalizePdfPages(array $pages): array
    {
        $normalized = [];

        foreach ($pages as $page) {
            $normalized[] = [
                'page' => $page['page'] ?? 0,
                'text' => $page['text'] ?? '',
                'sumber' => 'pdf',
            ];
        }

        return $normalized;
    }

    /**
     * Gabungkan halaman PDF dan OCR berdasarkan nomor halaman.
     * Utamakan teks PDF jika tersedia, gunakan OCR sebagai fallback.
     *
     * @param  list<array{page: int, text: string}>  $pdfPages
     * @param  list<array{page: int, text: string}>  $ocrPages
     * @return list<array{page: int, text: string, sumber: string}>
     */
    private function mergePdfOcrPages(array $pdfPages, array $ocrPages): array
    {
        $ocrMap = [];

        foreach ($ocrPages as $ocrPage) {
            $ocrMap[$ocrPage['page'] ?? 0] = $ocrPage['text'] ?? '';
        }

        $merged = [];

        foreach ($pdfPages as $pdfPage) {
            $pageNumber = $pdfPage['page'] ?? 0;
            $pdfText = $pdfPage['text'] ?? '';

            if (trim($pdfText) !== '') {
                $merged[] = [
                    'page' => $pageNumber,
                    'text' => $pdfText,
                    'sumber' => 'pdf',
                ];
            } elseif (isset($ocrMap[$pageNumber]) && trim($ocrMap[$pageNumber]) !== '') {
                $merged[] = [
                    'page' => $pageNumber,
                    'text' => $ocrMap[$pageNumber],
                    'sumber' => 'ocr',
                ];
            } else {
                $merged[] = [
                    'page' => $pageNumber,
                    'text' => '',
                    'sumber' => 'tidak_tersedia',
                ];
            }
        }

        // Tambahkan halaman OCR yang tidak ada di PDF
        $pdfPageNumbers = [];
        foreach ($pdfPages as $pdfPage) {
            $pdfPageNumbers[] = $pdfPage['page'] ?? 0;
        }

        foreach ($ocrPages as $ocrPage) {
            $pageNumber = $ocrPage['page'] ?? 0;

            if (!in_array($pageNumber, $pdfPageNumbers, true)) {
                $merged[] = [
                    'page' => $pageNumber,
                    'text' => $ocrPage['text'] ?? '',
                    'sumber' => 'ocr',
                ];
            }
        }

        usort($merged, fn(array $a, array $b) => ($a['page'] ?? 0) <=> ($b['page'] ?? 0));

        return $merged;
    }

    /**
     * Bangun teks lengkap dari semua halaman yang telah digabungkan.
     *
     * @param  list<array{page: int, text: string, sumber: string}>  $pages
     * @return string
     */
    private function buildFullText(array $pages): string
    {
        $parts = [];

        foreach ($pages as $page) {
            $text = $page['text'] ?? '';

            if (trim($text) !== '') {
                $parts[] = $text;
            }
        }

        return implode("\n", $parts);
    }

    /**
     * Ekstraksi semua field dari teks dan QR.
     *
     * @param  list<array{page: int, text: string, sumber: string}>  $pages
     * @param  string  $fullText
     * @param  array  $qrResult
     * @return array<string, mixed>
     */
    private function extractFields(array $pages, string $fullText, array $qrResult): array
    {
        $fields = [];

        // Nomor NIB
        $fields['nomor_nib'] = $this->extractNomorNib($pages, $fullText, $qrResult);

        // Nama perusahaan
        $fields['nama_perusahaan'] = $this->extractNamaPerusahaan($pages, $fullText);

        // Alamat perusahaan
        $fields['alamat_perusahaan'] = $this->extractAlamat($pages, $fullText);

        // Tanggal berdiri (opsional)
        $fields['tanggal_berdiri'] = $this->extractTanggalBerdiri($pages, $fullText);

        // Kecamatan (opsional)
        $fields['kecamatan'] = $this->extractKecamatan($pages, $fullText);

        return $fields;
    }

    /**
     * Ekstraksi nomor NIB dari teks dan QR.
     */
    private function extractNomorNib(array $pages, string $fullText, array $qrResult): array
    {
        $candidates = [];

        // Cari dari teks PDF/OCR
        foreach (self::LABEL_NOMOR_NIB as $label) {
            $pattern = '/'
                . preg_quote($label, '/')
                . '\s*:?\s*([A-Za-z0-9.\-\/ ]{6,30})/i';

            if (preg_match_all($pattern, $fullText, $matches, PREG_SET_ORDER)) {
                foreach ($matches as $match) {
                    $rawValue = trim($match[1] ?? '');
                    if ($rawValue === '') {
                        continue;
                    }

                    $pageNumber = $this->findPageNumberForText($pages, $rawValue, $fullText);
                    $context = $this->extractContextAroundText($fullText, $match[0] ?? '');

                    $candidates[] = [
                        'sumber' => 'teks',
                        'raw_value' => $rawValue,
                        'normalized_value' => $this->normalizeNomorNib($rawValue),
                        'halaman' => $pageNumber,
                        'bukti_teks' => $context,
                    ];
                }
            }
        }

        // Cari dari QR
        if ($qrResult['ditemukan'] && $qrResult['jenis'] === 'teks') {
            $qrContent = trim($qrResult['konten'] ?? '');

            if ($qrContent !== '') {
                $normalized = $this->normalizeNomorNib($qrContent);

                $candidates[] = [
                    'sumber' => 'qr',
                    'raw_value' => $qrContent,
                    'normalized_value' => $normalized,
                    'halaman' => null,
                    'bukti_teks' => $qrContent,
                ];
            }
        }

        return $this->buildFieldResult('nomor_nib', $candidates, [$this, 'validateNomorNibFormat']);
    }

    /**
     * Ekstraksi nama perusahaan dari teks.
     */
    private function extractNamaPerusahaan(array $pages, string $fullText): array
    {
        $candidates = [];

        foreach (self::LABEL_NAMA_PERUSAHAAN as $label) {
            $pattern = '/'
                . preg_quote($label, '/')
                . '\s*:?\s*([^\n]{3,100})/i';

            if (preg_match_all($pattern, $fullText, $matches, PREG_SET_ORDER)) {
                foreach ($matches as $match) {
                    $rawValue = trim($match[1] ?? '');
                    if ($rawValue === '') {
                        continue;
                    }

                    $pageNumber = $this->findPageNumberForText($pages, $rawValue, $fullText);
                    $context = $this->extractContextAroundText($fullText, $match[0] ?? '');

                    $candidates[] = [
                        'sumber' => 'teks',
                        'raw_value' => $rawValue,
                        'normalized_value' => $this->normalizeNama($rawValue),
                        'halaman' => $pageNumber,
                        'bukti_teks' => $context,
                    ];
                }
            }
        }

        return $this->buildFieldResult('nama_perusahaan', $candidates);
    }

    /**
     * Ekstraksi alamat perusahaan dari teks.
     */
    private function extractAlamat(array $pages, string $fullText): array
    {
        $candidates = [];

        foreach (self::LABEL_ALAMAT as $label) {
            $pattern = '/'
                . preg_quote($label, '/')
                . '\s*:?\s*([^\n]{3,200})/i';

            if (preg_match_all($pattern, $fullText, $matches, PREG_SET_ORDER)) {
                foreach ($matches as $match) {
                    $rawValue = trim($match[1] ?? '');
                    if ($rawValue === '') {
                        continue;
                    }

                    $pageNumber = $this->findPageNumberForText($pages, $rawValue, $fullText);
                    $context = $this->extractContextAroundText($fullText, $match[0] ?? '');

                    $candidates[] = [
                        'sumber' => 'teks',
                        'raw_value' => $rawValue,
                        'normalized_value' => $this->normalizeAlamat($rawValue),
                        'halaman' => $pageNumber,
                        'bukti_teks' => $context,
                    ];
                }
            }
        }

        return $this->buildFieldResult('alamat_perusahaan', $candidates);
    }

    /**
     * Ekstraksi tanggal berdiri dari teks (opsional).
     */
    private function extractTanggalBerdiri(array $pages, string $fullText): array
    {
        $candidates = [];

        foreach (self::LABEL_TANGGAL_BERDIRI as $label) {
            $pattern = '/'
                . preg_quote($label, '/')
                . '\s*:?\s*([^\n]{3,30})/i';

            if (preg_match_all($pattern, $fullText, $matches, PREG_SET_ORDER)) {
                foreach ($matches as $match) {
                    $rawValue = trim($match[1] ?? '');
                    if ($rawValue === '') {
                        continue;
                    }

                    $pageNumber = $this->findPageNumberForText($pages, $rawValue, $fullText);
                    $context = $this->extractContextAroundText($fullText, $match[0] ?? '');

                    $candidates[] = [
                        'sumber' => 'teks',
                        'raw_value' => $rawValue,
                        'normalized_value' => $this->normalizeTanggal($rawValue),
                        'halaman' => $pageNumber,
                        'bukti_teks' => $context,
                    ];
                }
            }
        }

        return $this->buildFieldResult('tanggal_berdiri', $candidates);
    }

    /**
     * Ekstraksi kecamatan dari teks (opsional).
     */
    private function extractKecamatan(array $pages, string $fullText): array
    {
        $candidates = [];

        foreach (self::LABEL_KECAMATAN as $label) {
            $pattern = '/'
                . preg_quote($label, '/')
                . '\s*:?\s*([^\n]{3,50})/i';

            if (preg_match_all($pattern, $fullText, $matches, PREG_SET_ORDER)) {
                foreach ($matches as $match) {
                    $rawValue = trim($match[1] ?? '');
                    if ($rawValue === '') {
                        continue;
                    }

                    $pageNumber = $this->findPageNumberForText($pages, $rawValue, $fullText);
                    $context = $this->extractContextAroundText($fullText, $match[0] ?? '');

                    $candidates[] = [
                        'sumber' => 'teks',
                        'raw_value' => $rawValue,
                        'normalized_value' => $this->normalizeKecamatan($rawValue),
                        'halaman' => $pageNumber,
                        'bukti_teks' => $context,
                    ];
                }
            }
        }

        return $this->buildFieldResult('kecamatan', $candidates);
    }

    /**
     * Bangun hasil field dari kandidat yang ditemukan.
     *
     * @param  callable(string):bool|null  $formatValidator  Validator opsional untuk format field (mis. nomor NIB 13 digit)
     */
    private function buildFieldResult(string $namaField, array $candidates, ?callable $formatValidator = null): array
    {
        if (count($candidates) === 0) {
            return [
                'nama_field' => $namaField,
                'status' => self::FIELD_NOT_FOUND,
                'normalized_value' => null,
                'validasi' => [
                    'status' => self::VALIDATION_UNKNOWN,
                    'reason' => null,
                ],
                'bukti' => [],
                'nilai_alternatif' => [],
                'catatan' => null,
            ];
        }

        // Periksa apakah semua kandidat memiliki normalized_value yang sama
        $normalizedValues = array_unique(
            array_map(fn(array $c) => $c['normalized_value'], $candidates)
        );

        $hasInvalid = false;
        $hasFormatInvalid = false;
        foreach ($candidates as $candidate) {
            if ($candidate['normalized_value'] === null) {
                $hasInvalid = true;
                break;
            }

            if ($formatValidator !== null && !$formatValidator($candidate['normalized_value'])) {
                $hasFormatInvalid = true;
                break;
            }
        }

        if ($hasInvalid || $hasFormatInvalid) {
            return [
                'nama_field' => $namaField,
                'status' => self::FIELD_INVALID,
                'normalized_value' => null,
                'validasi' => [
                    'status' => self::VALIDATION_INVALID,
                    'reason' => 'Nilai field tidak dapat diverifikasi.',
                ],
                'bukti' => array_values($candidates),
                'nilai_alternatif' => array_values(array_slice($candidates, 1)),
                'catatan' => 'Field ditemukan tetapi nilai tidak valid.',
            ];
        }

        if (count($normalizedValues) > 1) {
            return [
                'nama_field' => $namaField,
                'status' => self::FIELD_AMBIGUOUS,
                'normalized_value' => $candidates[0]['normalized_value'],
                'validasi' => [
                    'status' => self::VALIDATION_AMBIGUOUS,
                    'reason' => 'Ditemukan lebih dari satu kandidat nilai yang berbeda.',
                ],
                'bukti' => array_values($candidates),
                'nilai_alternatif' => array_values(array_slice($candidates, 1)),
                'catatan' => 'Nilai ambigu antara sumber berbeda.',
            ];
        }

        $candidate = $candidates[0];

        return [
            'nama_field' => $namaField,
            'status' => self::FIELD_FOUND,
            'normalized_value' => $candidate['normalized_value'],
            'validasi' => [
                'status' => self::VALIDATION_VALID,
                'reason' => null,
            ],
            'bukti' => array_values($candidates),
            'nilai_alternatif' => [],
            'catatan' => null,
        ];
    }

    /**
     * Normalisasi nomor NIB: hapus prefix dan whitespace/pemisah aman.
     * Tidak mengubah karakter OCR ambigu.
     */
    private function normalizeNomorNib(string $value): ?string
    {
        $normalized = trim($value);

        // Hapus prefix NIB (case-insensitive)
        $normalized = preg_replace(self::NIB_PREFIX_PATTERN, '', $normalized);

        // Hapus titik, spasi, strip, slash di antara digit
        $normalized = preg_replace('/[\.\s\-\/]+/', '', $normalized);

        if ($normalized === '') {
            return null;
        }

        return $normalized;
    }

    /**
     * Validasi format nomor NIB: 13 digit angka.
     */
    private function validateNomorNibFormat(string $normalized): bool
    {
        return preg_match('/^\d{' . self::NIB_DIGIT_LENGTH . '}$/', $normalized) === 1;
    }

    /**
     * Normalisasi nama perusahaan: trim, hapus spasi ganda, pertahankan badan usaha.
     */
    private function normalizeNama(string $value): ?string
    {
        $normalized = trim($value);
        $normalized = preg_replace('/\s+/', ' ', $normalized);

        return $normalized === '' ? null : $normalized;
    }

    /**
     * Normalisasi alamat: trim, hapus spasi ganda, konservatif pada singkatan.
     */
    private function normalizeAlamat(string $value): ?string
    {
        $normalized = trim($value);
        $normalized = preg_replace('/\s+/', ' ', $normalized);

        return $normalized === '' ? null : $normalized;
    }

    /**
     * Normalisasi tanggal: coba parsing format umum Indonesia.
     */
    private function normalizeTanggal(string $value): ?string
    {
        $trimmed = trim($value);

        if ($trimmed === '') {
            return null;
        }

        // Coba format YYYY-MM-DD
        if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $trimmed)) {
            $date = \DateTime::createFromFormat('Y-m-d', $trimmed);

            return $date !== false ? $date->format('Y-m-d') : null;
        }

        // Coba format DD-MM-YYYY
        if (preg_match('/^\d{2}-\d{2}-\d{4}$/', $trimmed)) {
            $date = \DateTime::createFromFormat('d-m-Y', $trimmed);

            return $date !== false ? $date->format('Y-m-d') : null;
        }

        // Coba format DD/MM/YYYY
        if (preg_match('/^\d{2}\/\d{2}\/\d{4}$/', $trimmed)) {
            $date = \DateTime::createFromFormat('d/m/Y', $trimmed);

            return $date !== false ? $date->format('Y-m-d') : null;
        }

        return null;
    }

    /**
     * Normalisasi kecamatan: trim, hapus spasi ganda.
     */
    private function normalizeKecamatan(string $value): ?string
    {
        $normalized = trim($value);
        $normalized = preg_replace('/\s+/', ' ', $normalized);

        return $normalized === '' ? null : $normalized;
    }

    /**
     * Cari nomor halaman tempat teks tertentu ditemukan.
     */
    private function findPageNumberForText(array $pages, string $searchValue, string $fullText): ?int
    {
        foreach ($pages as $page) {
            $text = $page['text'] ?? '';

            if (str_contains($text, $searchValue)) {
                return $page['page'] ?? null;
            }
        }

        return null;
    }

    /**
     * Ekstrak konteks teks di sekitar pola yang ditemukan.
     */
    private function extractContextAroundText(string $fullText, string $matchedText): ?string
    {
        $pos = strpos($fullText, $matchedText);

        if ($pos === false) {
            return null;
        }

        $start = max(0, $pos - 30);
        $end = min(strlen($fullText), $pos + strlen($matchedText) + 30);

        return trim(substr($fullText, $start, $end - $start));
    }

    /**
     * Bandingkan field yang diekstrak dengan data profil perusahaan di database.
     */
    private function compareWithDatabase(array $fields, ?ProfilPerusahaan $profilPerusahaan, Nib $nib): array
    {
        $fieldDibandingkan = [];
        $ketidaksesuaian = [];
        $fieldTidakDapatDibandingkan = [];

        $pemetaan = [
            'nomor_nib' => $nib->nomor_nib,
            'nama_perusahaan' => $profilPerusahaan?->nama_perusahaan,
            'alamat_perusahaan' => $profilPerusahaan?->alamat_perusahaan,
            'tanggal_berdiri' => $profilPerusahaan?->tanggal_berdiri,
            'kecamatan' => $profilPerusahaan?->kecamatan,
        ];

        foreach ($pemetaan as $namaField => $nilaiDatabase) {
            if ($nilaiDatabase === null) {
                $fieldTidakDapatDibandingkan[] = $namaField;
                continue;
            }

            $fieldDibandingkan[] = $namaField;

            $fieldData = $fields[$namaField] ?? null;
            $nilaiDokumen = $fieldData['normalized_value'] ?? null;

            if ($nilaiDokumen === null) {
                $ketidaksesuaian[] = [
                    'nama_field' => $namaField,
                    'nilai_dokumen' => null,
                    'nilai_database' => $nilaiDatabase,
                ];

                continue;
            }

            if (Str::lower($nilaiDokumen) !== Str::lower((string) $nilaiDatabase)) {
                $ketidaksesuaian[] = [
                    'nama_field' => $namaField,
                    'nilai_dokumen' => $nilaiDokumen,
                    'nilai_database' => $nilaiDatabase,
                ];
            }
        }

        return [
            'field_dibandingkan' => array_values($fieldDibandingkan),
            'indikator_kemiripan' => null,
            'ketidaksesuaian' => array_values($ketidaksesuaian),
            'field_tidak_dapat_dibandingkan' => array_values($fieldTidakDapatDibandingkan),
        ];
    }

    /**
     * Tentukan status ekstraksi keseluruhan dokumen.
     */
    private function determineExtractionStatus(array $fields, bool $hasAnyText, array $mergedPages): string
    {
        if (!$hasAnyText) {
            return self::STATUS_EXTRACTION_FAILED;
        }

        $hasAmbiguous = false;
        $hasInvalid = false;
        $hasFound = false;

        foreach ($fields as $field) {
            $status = $field['status'] ?? null;

            if ($status === self::FIELD_AMBIGUOUS) {
                $hasAmbiguous = true;
            } elseif ($status === self::FIELD_INVALID) {
                $hasInvalid = true;
            } elseif ($status === self::FIELD_FOUND) {
                $hasFound = true;
            }
        }

        if ($hasAmbiguous) {
            return self::STATUS_EXTRACTION_AMBIGUOUS;
        }

        if ($hasFound) {
            return self::STATUS_EXTRACTION_SUCCESS;
        }

        return self::STATUS_EXTRACTION_FAILED;
    }

    /**
     * Tentukan apakah diperlukan review manual.
     */
    private function determineNeedsReview(array $fields, string $extractionStatus, array $comparison): bool
    {
        if ($extractionStatus === self::STATUS_EXTRACTION_FAILED) {
            return true;
        }

        foreach ($fields as $field) {
            if ($field['status'] === self::FIELD_AMBIGUOUS || $field['status'] === self::FIELD_INVALID) {
                return true;
            }
        }

        if (count($comparison['ketidaksesuaian'] ?? []) > 0) {
            return true;
        }

        return false;
    }

    /**
     * Bangun alasan review manual.
     */
    private function buildReviewReason(array $fields, array $comparison, bool $needsReview): ?string
    {
        if (!$needsReview) {
            return null;
        }

        $reasons = [];

        foreach ($fields as $field) {
            if ($field['status'] === self::FIELD_AMBIGUOUS) {
                $reasons[] = 'Field ' . $field['nama_field'] . ' memiliki nilai ambigu.';
            } elseif ($field['status'] === self::FIELD_INVALID) {
                $reasons[] = 'Field ' . $field['nama_field'] . ' tidak valid.';
            }
        }

        foreach ($comparison['ketidaksesuaian'] ?? [] as $mismatch) {
            $reasons[] = 'Ketidaksesuaian pada ' . $mismatch['nama_field'] . '.';
        }

        if (empty($reasons)) {
            $reasons[] = 'Ekstraksi tidak lengkap atau gagal.';
        }

        return implode(' ', $reasons);
    }

    /**
     * Tentukan sumber teks yang digunakan.
     */
    private function determineTextSource(?array $pdfResult, bool $ocrWasUsed): string
    {
        if ($pdfResult === null || !isset($pdfResult['status'])) {
            return 'tidak_tersedia';
        }

        if ($pdfResult['status'] === NibPdfExtractorService::STATUS_TEXT_EXTRACTED) {
            if ($ocrWasUsed) {
                return 'campuran';
            }

            return 'pdf';
        }

        if ($pdfResult['status'] === NibPdfExtractorService::STATUS_OCR_REQUIRED) {
            if ($ocrWasUsed) {
                return 'ocr';
            }

            return 'tidak_tersedia';
        }

        return 'tidak_tersedia';
    }

    /**
     * Bangun hasil ekstraksi gagal.
     */
    private function buildFailedResult(string $error, ?string $idNib, ?int $pageCount): array
    {
        return [
            'status_ekstraksi' => self::STATUS_EXTRACTION_FAILED,
            'dokumen' => [
                'id_nib' => $idNib,
                'total_halaman' => $pageCount,
                'sumber_teks' => 'tidak_tersedia',
            ],
            'fields' => [],
            'qr' => [
                'ditemukan' => false,
                'konten' => null,
                'jenis' => null,
                'url_validasi' => null,
                'catatan' => $error,
            ],
            'perbandingan' => [
                'field_dibandingkan' => [],
                'indikator_kemiripan' => null,
                'ketidaksesuaian' => [],
                'field_tidak_dapat_dibandingkan' => [],
            ],
            'perlu_review_manual' => true,
            'alasan_review' => $error,
        ];
    }
}
