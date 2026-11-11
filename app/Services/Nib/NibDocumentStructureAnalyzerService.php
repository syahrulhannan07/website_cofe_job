<?php

namespace App\Services\Nib;

use App\Models\Nib;
use App\Models\ProfilPerusahaan;
use Illuminate\Support\Facades\Log;

/**
 * Analisis struktur dokumen NIB.
 *
 * Service ini menganalisis karakteristik struktural dokumen NIB dan
 * menghasilkan indikator yang dapat digunakan dalam proses screening.
 *
 * Tidak menetapkan keaslian dokumen.
 * Tidak menetapkan dokumen palsu.
 * Tidak menetapkan status Lulus atau Ditolak.
 * Tidak menyimpan hasil ke database.
 */
class NibDocumentStructureAnalyzerService
{
    // Status analisis
    public const STATUS_ANALISIS_LENGKAP = 'ANALISIS_LENGKAP';
    public const STATUS_ANALISIS_TIDAK_LENGKAP = 'ANALISIS_TIDAK_LENGKAP';

    // Indikator struktur
    public const INDIKATOR_INFORMASI_LENGKAP = 'INFORMASI_LENGKAP';
    public const INDIKATOR_INFORMASI_TIDAK_LENGKAP = 'INFORMASI_TIDAK_LENGKAP';
    public const INDIKATOR_KETIDAKSESUAIAN = 'DITEMUKAN_KETIDAKSESUAIAN';
    public const INDIKATOR_PERLU_REVIEW = 'PERLU_REVIEW';
    public const INDIKATOR_ANALISIS_TIDAK_LENGKAP = 'ANALISIS_TIDAK_LENGKAP';

    // Tingkat perhatian temuan
    public const PERHATIAN_INFO = 'INFO';
    public const PERHATIAN_WARNING = 'WARNING';
    public const PERHATIAN_CRITICAL = 'CRITICAL';

    // Field wajib untuk analisis lengkap
    private const FIELD_WAJIB = [
        'nomor_nib',
        'nama_perusahaan',
        'alamat_perusahaan',
    ];

    private ?NibDataExtractorService $dataExtractor = null;

    /**
     * @param  NibDataExtractorService|null  $dataExtractor
     */
    public function __construct(?NibDataExtractorService $dataExtractor = null)
    {
        $this->dataExtractor = $dataExtractor;
    }

    /**
     * Analisis struktur dokumen NIB.
     *
     * @param  string  $id_nib  Primary key record NIB
     * @param  ProfilPerusahaan|null  $profilPerusahaan  Profil perusahaan untuk perbandingan (opsional)
     * @return array{
     *     status_analisis: string,
     *     karakteristik_dokumen: array,
     *     indikator_struktur: list<string>,
     *     indikator_konsistensi: list<string>,
     *     temuan: list<array>,
     *     perlu_review_manual: bool,
     *     alasan_review: string|null
     * }
     */
    public function analyze(string $id_nib, ?ProfilPerusahaan $profilPerusahaan = null): array
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

        // Jalankan ekstraksi data melalui NibDataExtractorService
        $extractor = $this->dataExtractor ?? new NibDataExtractorService();
        $extractionResult = $extractor->extract($id_nib, $profilPerusahaan);

        // Analisis karakteristik dokumen
        $karakteristik = $this->analisisKarakteristikDokumen($extractionResult, $nib);

        // Analisis indikator struktur
        $indikatorStruktur = $this->analisisIndikatorStruktur($extractionResult);

        // Analisis indikator konsistensi
        $indikatorKonsistensi = $this->analisisIndikatorKonsistensi($extractionResult);

        // Kumpulkan temuan
        $temuan = $this->kumpulkanTemuan(
            $extractionResult,
            $indikatorStruktur,
            $indikatorKonsistensi
        );

        // Tentukan apakah diperlukan review manual
        $perluReview = $this->tentukanPerluReview(
            $extractionResult,
            $indikatorStruktur,
            $indikatorKonsistensi,
            $temuan
        );

        $alasanReview = $this->buildAlasanReview($temuan, $perluReview);

        // Tentukan status analisis
        $statusAnalisis = $this->tentukanStatusAnalisis(
            $extractionResult,
            $indikatorStruktur,
            $indikatorKonsistensi
        );

        return [
            'status_analisis' => $statusAnalisis,
            'karakteristik_dokumen' => $karakteristik,
            'indikator_struktur' => array_values($indikatorStruktur),
            'indikator_konsistensi' => array_values($indikatorKonsistensi),
            'temuan' => array_values($temuan),
            'perlu_review_manual' => $perluReview,
            'alasan_review' => $alasanReview,
        ];
    }

    /**
     * Analisis karakteristik dokumen.
     */
    private function analisisKarakteristikDokumen(array $extractionResult, Nib $nib): array
    {
        $dokumen = $extractionResult['dokumen'] ?? [];
        $fields = $extractionResult['fields'] ?? [];

        $totalHalaman = $dokumen['total_halaman'] ?? null;
        $halamanDenganTeks = 0;
        $halamanKosong = 0;
        $pages = [];

        // Hitung halaman berdasarkan field yang memiliki halaman sumber
        $halamanDitemukan = [];
        foreach ($fields as $field) {
            foreach ($field['bukti'] ?? [] as $bukti) {
                if (isset($bukti['halaman']) && $bukti['halaman'] !== null) {
                    $halamanDitemukan[$bukti['halaman']] = true;
                }
            }
        }

        $halamanDenganTeks = count($halamanDitemukan);

        if ($totalHalaman !== null) {
            $halamanKosong = max(0, $totalHalaman - $halamanDenganTeks);
        }

        // Buat detail halaman dari bukti yang tersedia
        foreach ($halamanDitemukan as $halaman => $value) {
            $pages[] = [
                'halaman' => $halaman,
                'mempunyai_teks' => true,
                'jumlah_karakter' => 0,
                'sumber' => 'pdf',
            ];
        }

        // Urutkan berdasarkan nomor halaman
        usort($pages, fn(array $a, array $b) => $a['halaman'] <=> $b['halaman']);

        $qrDitemukan = $extractionResult['qr']['ditemukan'] ?? false;
        $sumberTeks = $dokumen['sumber_teks'] ?? 'tidak_tersedia';

        return [
            'id_nib' => $nib->id_nib,
            'total_halaman' => $totalHalaman,
            'halaman_dengan_teks' => $halamanDenganTeks,
            'halaman_kosong' => $halamanKosong,
            'halaman_detail' => $pages,
            'qr_ditemukan' => $qrDitemukan,
            'sumber_ekstraksi' => $sumberTeks,
            'status_ekstraksi_asli' => $extractionResult['status_ekstraksi'] ?? null,
        ];
    }

    /**
     * Analisis indikator struktur dokumen.
     */
    private function analisisIndikatorStruktur(array $extractionResult): array
    {
        $indikator = [];
        $fields = $extractionResult['fields'] ?? [];

        // Periksa ketersediaan field wajib
        $semuaWajibTersedia = true;
        $fieldTidakTersedia = [];

        foreach (self::FIELD_WAJIB as $namaField) {
            $fieldData = null;
            foreach ($fields as $f) {
                if ($f['nama_field'] === $namaField) {
                    $fieldData = $f;
                    break;
                }
            }

            if (!$fieldData || $fieldData['status'] !== 'FIELD_FOUND') {
                $semuaWajibTersedia = false;
                $fieldTidakTersedia[] = $namaField;
            }
        }

        if ($semuaWajibTersedia) {
            $indikator[] = self::INDIKATOR_INFORMASI_LENGKAP;
        } else {
            $indikator[] = self::INDIKATOR_INFORMASI_TIDAK_LENGKAP;
        }

        // Periksa apakah ada field ambigu
        $adaAmbigu = false;
        foreach ($fields as $field) {
            if ($field['status'] === 'FIELD_AMBIGUOUS') {
                $adaAmbigu = true;
                break;
            }
        }

        if ($adaAmbigu) {
            $indikator[] = self::INDIKATOR_PERLU_REVIEW;
        }

        // Periksa QR
        $qr = $extractionResult['qr'] ?? [];
        if ($qr['ditemukan'] === true) {
            $indikator[] = 'QR_DITEMUKAN';
        }

        // Periksa status ekstraksi
        if ($extractionResult['status_ekstraksi'] === 'GAGAL') {
            $indikator[] = self::INDIKATOR_ANALISIS_TIDAK_LENGKAP;
        }

        return $indikator;
    }

    /**
     * Analisis indikator konsistensi.
     */
    private function analisisIndikatorKonsistensi(array $extractionResult): array
    {
        $indikator = [];
        $fields = $extractionResult['fields'] ?? [];
        $perbandingan = $extractionResult['perbandingan'] ?? [];

        // Periksa nomor NIB ambigu (konflik antara sumber)
        $nomorNibField = null;
        foreach ($fields as $field) {
            if ($field['nama_field'] === 'nomor_nib') {
                $nomorNibField = $field;
                break;
            }
        }

        if ($nomorNibField && $nomorNibField['status'] === 'FIELD_AMBIGUOUS') {
            $indikator[] = self::INDIKATOR_KETIDAKSESUAIAN;
        }

        // Periksa format nomor NIB
        if ($nomorNibField && $nomorNibField['status'] === 'FIELD_INVALID') {
            $indikator[] = 'NIB_FORMAT_TIDAK_VALID';
        }

        // Periksa ketidaksesuaian dengan database
        $ketidaksesuaian = $perbandingan['ketidaksesuaian'] ?? [];
        if (count($ketidaksesuaian) > 0) {
            $indikator[] = self::INDIKATOR_KETIDAKSESUAIAN;
        }

        // Periksa halaman yang tidak berhasil diekstrak
        $adaHalamanGagal = false;
        foreach ($fields as $field) {
            if ($field['status'] === 'FIELD_UNREADABLE') {
                $adaHalamanGagal = true;
                break;
            }
        }

        if ($adaHalamanGagal) {
            $indikator[] = 'ADA_HALAMAN_TIDAK_TERBACA';
        }

        return $indikator;
    }

    /**
     * Kumpulkan temuan analisis.
     */
    private function kumpulkanTemuan(
        array $extractionResult,
        array $indikatorStruktur,
        array $indikatorKonsistensi
    ): array {
        $temuan = [];
        $fields = $extractionResult['fields'] ?? [];
        $qr = $extractionResult['qr'] ?? [];

        // Temuan: ekstraksi gagal
        if (($extractionResult['status_ekstraksi'] ?? '') === 'GAGAL') {
            $temuan[] = [
                'jenis_temuan' => 'EKSTRAKSI_GAGAL',
                'deskripsi' => $extractionResult['alasan_review'] ?? 'Ekstraksi dokumen gagal.',
                'field_terkait' => null,
                'sumber_bukti' => [],
                'halaman' => null,
                'tingkat_perhatian' => self::PERHATIAN_CRITICAL,
            ];

            return $temuan;
        }

        // Temuan: nomor NIB ditemukan atau tidak
        $nomorNibField = null;
        foreach ($fields as $field) {
            if ($field['nama_field'] === 'nomor_nib') {
                $nomorNibField = $field;
                break;
            }
        }

        if ($nomorNibField) {
            switch ($nomorNibField['status']) {
                case 'FIELD_FOUND':
                    $temuan[] = [
                        'jenis_temuan' => 'NIB_DITEMUKAN',
                        'deskripsi' => 'Nomor NIB berhasil diekstrak dari dokumen.',
                        'field_terkait' => 'nomor_nib',
                        'sumber_bukti' => array_column($nomorNibField['bukti'] ?? [], 'sumber'),
                        'halaman' => $this->getFirstPageFromBukti($nomorNibField['bukti'] ?? []),
                        'tingkat_perhatian' => self::PERHATIAN_INFO,
                    ];
                    break;
                case 'FIELD_NOT_FOUND':
                    $temuan[] = [
                        'jenis_temuan' => 'NIB_TIDAK_DITEMUKAN',
                        'deskripsi' => 'Nomor NIB tidak ditemukan dalam dokumen.',
                        'field_terkait' => 'nomor_nib',
                        'sumber_bukti' => [],
                        'halaman' => null,
                        'tingkat_perhatian' => self::PERHATIAN_WARNING,
                    ];
                    break;
                case 'FIELD_INVALID':
                    $temuan[] = [
                        'jenis_temuan' => 'NIB_FORMAT_TIDAK_VALID',
                        'deskripsi' => 'Nomor NIB ditemukan tetapi format tidak valid.',
                        'field_terkait' => 'nomor_nib',
                        'sumber_bukti' => array_column($nomorNibField['bukti'] ?? [], 'sumber'),
                        'halaman' => $this->getFirstPageFromBukti($nomorNibField['bukti'] ?? []),
                        'tingkat_perhatian' => self::PERHATIAN_WARNING,
                    ];
                    break;
                case 'FIELD_AMBIGUOUS':
                    $temuan[] = [
                        'jenis_temuan' => 'NIB_KONFLIK_SUMBER',
                        'deskripsi' => 'Ditemukan lebih dari satu nilai nomor NIB dari sumber berbeda.',
                        'field_terkait' => 'nomor_nib',
                        'sumber_bukti' => array_column($nomorNibField['bukti'] ?? [], 'sumber'),
                        'halaman' => $this->getFirstPageFromBukti($nomorNibField['bukti'] ?? []),
                        'tingkat_perhatian' => self::PERHATIAN_CRITICAL,
                    ];
                    break;
                case 'FIELD_UNREADABLE':
                    $temuan[] = [
                        'jenis_temuan' => 'NIB_TIDAK_TERBACA',
                        'deskripsi' => 'Nomor NIB tidak dapat dibaca dari dokumen.',
                        'field_terkait' => 'nomor_nib',
                        'sumber_bukti' => [],
                        'halaman' => null,
                        'tingkat_perhatian' => self::PERHATIAN_CRITICAL,
                    ];
                    break;
            }
        }

        // Temuan: nama perusahaan
        $namaField = null;
        foreach ($fields as $field) {
            if ($field['nama_field'] === 'nama_perusahaan') {
                $namaField = $field;
                break;
            }
        }

        if ($namaField && $namaField['status'] === 'FIELD_NOT_FOUND') {
            $temuan[] = [
                'jenis_temuan' => 'NAMA_PERUSAHAAN_TIDAK_DITEMUKAN',
                'deskripsi' => 'Nama perusahaan tidak ditemukan dalam dokumen.',
                'field_terkait' => 'nama_perusahaan',
                'sumber_bukti' => [],
                'halaman' => null,
                'tingkat_perhatian' => self::PERHATIAN_WARNING,
            ];
        }

        // Temuan: alamat
        $alamatField = null;
        foreach ($fields as $field) {
            if ($field['nama_field'] === 'alamat_perusahaan') {
                $alamatField = $field;
                break;
            }
        }

        if ($alamatField && $alamatField['status'] === 'FIELD_NOT_FOUND') {
            $temuan[] = [
                'jenis_temuan' => 'ALAMAT_TIDAK_DITEMUKAN',
                'deskripsi' => 'Alamat perusahaan tidak ditemukan dalam dokumen.',
                'field_terkait' => 'alamat_perusahaan',
                'sumber_bukti' => [],
                'halaman' => null,
                'tingkat_perhatian' => self::PERHATIAN_WARNING,
            ];
        }

        // Temuan: QR
        if ($qr['ditemukan'] === true) {
            $temuan[] = [
                'jenis_temuan' => 'QR_DITEMUKAN',
                'deskripsi' => 'QR Code ditemukan dalam dokumen. Jenis: ' . ($qr['jenis'] ?? 'tidak_diketahui'),
                'field_terkait' => null,
                'sumber_bukti' => ['qr'],
                'halaman' => null,
                'tingkat_perhatian' => self::PERHATIAN_INFO,
            ];

            if ($qr['jenis'] === 'url' && isset($qr['url_validasi'])) {
                $urlValid = $qr['url_validasi'];
                if ($urlValid['status'] === 'OSS_URL_VALID') {
                    $temuan[] = [
                        'jenis_temuan' => 'QR_URL_OSS_VALID',
                        'deskripsi' => 'URL QR mengarah ke domain OSS terverifikasi.',
                        'field_terkait' => null,
                        'sumber_bukti' => ['qr_url_validator'],
                        'halaman' => null,
                        'tingkat_perhatian' => self::PERHATIAN_INFO,
                    ];
                } elseif ($urlValid['status'] === 'UNTRUSTED_URL') {
                    $temuan[] = [
                        'jenis_temuan' => 'QR_URL_TERPERCAYA_TIDAK',
                        'deskripsi' => 'URL QR tidak berasal dari domain OSS terverifikasi.',
                        'field_terkait' => null,
                        'sumber_bukti' => ['qr_url_validator'],
                        'halaman' => null,
                        'tingkat_perhatian' => self::PERHATIAN_WARNING,
                    ];
                } elseif ($urlValid['status'] === 'INVALID_URL') {
                    $temuan[] = [
                        'jenis_temuan' => 'QR_URL_TIDAK_VALID',
                        'deskripsi' => 'URL QR tidak valid.',
                        'field_terkait' => null,
                        'sumber_bukti' => ['qr_url_validator'],
                        'halaman' => null,
                        'tingkat_perhatian' => self::PERHATIAN_WARNING,
                    ];
                }
            }
        } else {
            $temuan[] = [
                'jenis_temuan' => 'QR_TIDAK_DITEMUKAN',
                'deskripsi' => 'QR Code tidak ditemukan dalam dokumen.',
                'field_terkait' => null,
                'sumber_bukti' => [],
                'halaman' => null,
                'tingkat_perhatian' => self::PERHATIAN_INFO,
            ];
        }

        // Temuan: informasi tidak lengkap
        if (in_array(self::INDIKATOR_INFORMASI_TIDAK_LENGKAP, $indikatorStruktur, true)) {
            $temuan[] = [
                'jenis_temuan' => 'INFORMASI_TIDAK_LENGKAP',
                'deskripsi' => 'Beberapa informasi wajib tidak ditemukan dalam dokumen.',
                'field_terkait' => null,
                'sumber_bukti' => [],
                'halaman' => null,
                'tingkat_perhatian' => self::PERHATIAN_WARNING,
            ];
        }

        // Temuan: ketidaksesuaian
        if (in_array(self::INDIKATOR_KETIDAKSESUAIAN, $indikatorKonsistensi, true)) {
            $temuan[] = [
                'jenis_temuan' => 'KETIDAKSESUAIAN_INFORMASI',
                'deskripsi' => 'Ditemukan ketidaksesuaian informasi antar sumber atau dengan data database.',
                'field_terkait' => null,
                'sumber_bukti' => [],
                'halaman' => null,
                'tingkat_perhatian' => self::PERHATIAN_CRITICAL,
            ];
        }

        // Temuan: analisis tidak lengkap
        if (in_array(self::INDIKATOR_ANALISIS_TIDAK_LENGKAP, $indikatorStruktur, true)) {
            $temuan[] = [
                'jenis_temuan' => 'ANALISIS_TIDAK_LENGKAP',
                'deskripsi' => 'Ekstraksi dokumen gagal, analisis tidak dapat dilakukan sepenuhnya.',
                'field_terkait' => null,
                'sumber_bukti' => [],
                'halaman' => null,
                'tingkat_perhatian' => self::PERHATIAN_CRITICAL,
            ];
        }

        return $temuan;
    }

    /**
     * Tentukan apakah diperlukan review manual.
     */
    private function tentukanPerluReview(
        array $extractionResult,
        array $indikatorStruktur,
        array $indikatorKonsistensi,
        array $temuan
    ): bool {
        if ($extractionResult['status_ekstraksi'] === 'GAGAL') {
            return true;
        }

        // Ada temuan CRITICAL
        foreach ($temuan as $t) {
            if ($t['tingkat_perhatian'] === self::PERHATIAN_CRITICAL) {
                return true;
            }
        }

        // Ada indikator perlu review
        if (in_array(self::INDIKATOR_PERLU_REVIEW, $indikatorStruktur, true)) {
            return true;
        }

        // Informasi tidak lengkap
        if (in_array(self::INDIKATOR_INFORMASI_TIDAK_LENGKAP, $indikatorStruktur, true)) {
            return true;
        }

        return false;
    }

    /**
     * Tentukan status analisis.
     */
    private function tentukanStatusAnalisis(
        array $extractionResult,
        array $indikatorStruktur,
        array $indikatorKonsistensi
    ): string {
        if ($extractionResult['status_ekstraksi'] === 'GAGAL') {
            return self::STATUS_ANALISIS_TIDAK_LENGKAP;
        }

        return self::STATUS_ANALISIS_LENGKAP;
    }

    /**
     * Bangun alasan review manual.
     */
    private function buildAlasanReview(array $temuan, bool $perluReview): ?string
    {
        if (!$perluReview) {
            return null;
        }

        $reasons = [];

        foreach ($temuan as $t) {
            if ($t['tingkat_perhatian'] === self::PERHATIAN_CRITICAL) {
                $reasons[] = $t['deskripsi'];
            }
        }

        if (empty($reasons)) {
            foreach ($temuan as $t) {
                if ($t['tingkat_perhatian'] === self::PERHATIAN_WARNING) {
                    $reasons[] = $t['deskripsi'];
                }
            }
        }

        if (empty($reasons)) {
            $reasons[] = 'Dokumen memerlukan review manual.';
        }

        return implode(' ', $reasons);
    }

    /**
     * Dapatkan halaman pertama dari bukti.
     */
    private function getFirstPageFromBukti(array $bukti): ?int
    {
        foreach ($bukti as $b) {
            if (isset($b['halaman']) && $b['halaman'] !== null) {
                return $b['halaman'];
            }
        }

        return null;
    }

    /**
     * Bangun hasil analisis gagal.
     */
    private function buildFailedResult(string $error, ?string $idNib, ?int $pageCount): array
    {
        return [
            'status_analisis' => self::STATUS_ANALISIS_TIDAK_LENGKAP,
            'karakteristik_dokumen' => [
                'id_nib' => $idNib,
                'total_halaman' => $pageCount,
                'halaman_dengan_teks' => 0,
                'halaman_kosong' => 0,
                'halaman_detail' => [],
                'qr_ditemukan' => false,
                'sumber_ekstraksi' => 'tidak_tersedia',
                'status_ekstraksi_asli' => 'GAGAL',
            ],
            'indikator_struktur' => [self::INDIKATOR_ANALISIS_TIDAK_LENGKAP],
            'indikator_konsistensi' => [],
            'temuan' => [
                [
                    'jenis_temuan' => 'EKSTRAKSI_GAGAL',
                    'deskripsi' => $error,
                    'field_terkait' => null,
                    'sumber_bukti' => [],
                    'halaman' => null,
                    'tingkat_perhatian' => self::PERHATIAN_CRITICAL,
                ],
            ],
            'perlu_review_manual' => true,
            'alasan_review' => $error,
        ];
    }
}
