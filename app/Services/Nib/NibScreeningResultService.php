<?php

namespace App\Services\Nib;

use App\Models\Nib;
use App\Models\ProfilPerusahaan;
use Illuminate\Support\Facades\Log;

/**
 * Agregasi hasil screening NIB.
 *
 * Service ini menggabungkan hasil ekstraksi data dari NibDataExtractorService
 * dan hasil analisis struktur dari NibDocumentStructureAnalyzerService menjadi
 * satu ringkasan hasil screening NIB yang konsisten dan siap digunakan oleh
 * queue dan API pada fase selanjutnya.
 *
 * Tidak mengubah status_screening atau status_verifikasi.
 * Tidak menetapkan Lulus atau Ditolak.
 * Tidak menyimpan hasil ke database.
 */
class NibScreeningResultService
{
    // Status proses
    public const STATUS_PROSES_BERHASIL = 'BERHASIL';
    public const STATUS_PROSES_BERHASIL_DENGAN_PERINGATAN = 'BERHASIL_DENGAN_PERINGATAN';
    public const STATUS_PROSES_GAGAL = 'GAGAL';

    private ?NibDataExtractorService $dataExtractor = null;
    private ?NibDocumentStructureAnalyzerService $structureAnalyzer = null;

    /**
     * @param  NibDataExtractorService|null  $dataExtractor
     * @param  NibDocumentStructureAnalyzerService|null  $structureAnalyzer
     */
    public function __construct(
        ?NibDataExtractorService $dataExtractor = null,
        ?NibDocumentStructureAnalyzerService $structureAnalyzer = null
    ) {
        $this->dataExtractor = $dataExtractor;
        $this->structureAnalyzer = $structureAnalyzer;
    }

    /**
     * Hasilkan ringkasan hasil screening NIB.
     *
     * @param  string  $id_nib  Primary key record NIB
     * @param  ProfilPerusahaan|null  $profilPerusahaan  Profil perusahaan untuk perbandingan (opsional)
     * @return array{
     *     id_nib: string,
     *     status_proses: string,
     *     ringkasan: array,
     *     data_terekstraksi: array,
     *     analisis_struktur: array,
     *     indikator_screening: list<string>,
     *     ketidaksesuaian: list<array>,
     *     bukti_pemeriksaan: list<array>,
     *     perlu_review_manual: bool,
     *     alasan_review: string|null,
     *     dihasilkan_pada: string
     * }
     */
    public function generate(string $id_nib, ?ProfilPerusahaan $profilPerusahaan = null): array
    {
        $nib = Nib::where('id_nib', $id_nib)->first();

        if (!$nib) {
            return $this->buildFailedResult(
                'Record NIB tidak ditemukan.',
                $id_nib
            );
        }

        // Langkah 1: Jalankan ekstraksi data
        $extractor = $this->dataExtractor ?? new NibDataExtractorService();
        $extractionResult = $extractor->extract($id_nib, $profilPerusahaan);

        // Langkah 2: Jalankan analisis struktur (gunakan hasil ekstraksi yang sudah ada)
        $analyzer = $this->structureAnalyzer ?? new NibDocumentStructureAnalyzerService($extractor);
        $analysisResult = $analyzer->analyze($id_nib, $profilPerusahaan);

        // Langkah 3: Gabungkan hasil
        $merged = $this->mergeResults($extractionResult, $analysisResult, $nib);

        // Langkah 4: Tentukan status proses
        $statusProses = $this->determineStatusProses($merged);

        // Langkah 5: Tentukan kebutuhan review manual
        $perluReview = $merged['perlu_review_manual'];
        $alasanReview = $merged['alasan_review'];

        return [
            'id_nib' => $nib->id_nib,
            'status_proses' => $statusProses,
            'ringkasan' => $merged['ringkasan'],
            'data_terekstraksi' => $merged['data_terekstraksi'],
            'analisis_struktur' => $merged['analisis_struktur'],
            'indikator_screening' => $merged['indikator_screening'],
            'ketidaksesuaian' => $merged['ketidaksesuaian'],
            'bukti_pemeriksaan' => $merged['bukti_pemeriksaan'],
            'perlu_review_manual' => $perluReview,
            'alasan_review' => $alasanReview,
            'dihasilkan_pada' => now()->toIso8601String(),
        ];
    }

    /**
     * Gabungkan hasil ekstraksi dan analisis.
     */
    private function mergeResults(array $extractionResult, array $analysisResult, Nib $nib): array
    {
        // Gabungkan indikator screening
        $indikatorScreening = [];

        // Dari struktur
        foreach ($analysisResult['indikator_struktur'] ?? [] as $indikator) {
            $indikatorScreening[] = $indikator;
        }

        // Dari konsistensi
        foreach ($analysisResult['indikator_konsistensi'] ?? [] as $indikator) {
            $indikatorScreening[] = $indikator;
        }

        // Hapus duplikasi sambil mempertahankan urutan
        $indikatorScreening = array_values(array_unique($indikatorScreening));

        // Gabungkan ketidaksesuaian dari perbandingan
        $ketidaksesuaian = $extractionResult['perbandingan']['ketidaksesuaian'] ?? [];

        // Gabungkan bukti pemeriksaan dari semua sumber
        $buktiPemeriksaan = $this->kumpulkanBuktiPemeriksaan($extractionResult, $analysisResult);

        // Susun ringkasan
        $ringkasan = $this->susunRingkasan($extractionResult, $analysisResult);

        // Data terdieksi
        $dataTerekstraksi = $this->susunDataTerekstraksi($extractionResult);

        // Analisis struktur
        $analisisStruktur = $this->susunAnalisisStruktur($analysisResult);

        return [
            'ringkasan' => $ringkasan,
            'data_terekstraksi' => $dataTerekstraksi,
            'analisis_struktur' => $analisisStruktur,
            'indikator_screening' => $indikatorScreening,
            'ketidaksesuaian' => array_values($ketidaksesuaian),
            'bukti_pemeriksaan' => array_values($buktiPemeriksaan),
            'perlu_review_manual' => $extractionResult['perlu_review_manual'] ?? false,
            'alasan_review' => $extractionResult['alasan_review'] ?? null,
        ];
    }

    /**
     * Susun ringkasan hasil screening.
     */
    private function susunRingkasan(array $extractionResult, array $analysisResult): array
    {
        $fields = $extractionResult['fields'] ?? [];
        $qr = $extractionResult['qr'] ?? [];

        $fieldDitemukan = 0;
        $fieldTidakDitemukan = 0;
        $fieldAmbigu = 0;
        $fieldInvalid = 0;

        foreach ($fields as $field) {
            switch ($field['status'] ?? null) {
                case 'FIELD_FOUND':
                    $fieldDitemukan++;
                    break;
                case 'FIELD_NOT_FOUND':
                    $fieldTidakDitemukan++;
                    break;
                case 'FIELD_AMBIGUOUS':
                    $fieldAmbigu++;
                    break;
                case 'FIELD_INVALID':
                    $fieldInvalid++;
                    break;
            }
        }

        $totalField = count($fields);
        $persentaseLengkap = $totalField > 0 ? round(($fieldDitemukan / $totalField) * 100) : 0;

        return [
            'status_ekstraksi' => $extractionResult['status_ekstraksi'] ?? null,
            'status_analisis' => $analysisResult['status_analisis'] ?? null,
            'total_field' => $totalField,
            'field_ditemukan' => $fieldDitemukan,
            'field_tidak_ditemukan' => $fieldTidakDitemukan,
            'field_ambigu' => $fieldAmbigu,
            'field_invalid' => $fieldInvalid,
            'persentase_kelengkapan' => $persentaseLengkap,
            'qr_ditemukan' => $qr['ditemukan'] ?? false,
            'qr_jenis' => $qr['jenis'] ?? null,
            'total_temuan' => count($analysisResult['temuan'] ?? []),
            'temuan_critical' => count(array_filter($analysisResult['temuan'] ?? [], fn($t) => ($t['tingkat_perhatian'] ?? '') === 'CRITICAL')),
            'temuan_warning' => count(array_filter($analysisResult['temuan'] ?? [], fn($t) => ($t['tingkat_perhatian'] ?? '') === 'WARNING')),
            'total_halaman' => $extractionResult['dokumen']['total_halaman'] ?? null,
            'sumber_ekstraksi' => $extractionResult['dokumen']['sumber_teks'] ?? null,
        ];
    }

    /**
     * Susun data terdieksi.
     */
    private function susunDataTerekstraksi(array $extractionResult): array
    {
        $fields = [];

        foreach ($extractionResult['fields'] ?? [] as $field) {
            $fields[] = [
                'nama_field' => $field['nama_field'],
                'status' => $field['status'],
                'normalized_value' => $field['normalized_value'],
                'validasi' => $field['validasi'],
                'bukti' => $field['bukti'],
                'nilai_alternatif' => $field['nilai_alternatif'],
                'catatan' => $field['catatan'],
            ];
        }

        return [
            'fields' => array_values($fields),
            'qr' => $extractionResult['qr'] ?? [],
            'perbandingan' => $extractionResult['perbandingan'] ?? [],
        ];
    }

    /**
     * Susun analisis struktur.
     */
    private function susunAnalisisStruktur(array $analysisResult): array
    {
        return [
            'karakteristik_dokumen' => $analysisResult['karakteristik_dokumen'] ?? [],
            'indikator_struktur' => array_values($analysisResult['indikator_struktur'] ?? []),
            'indikator_konsistensi' => array_values($analysisResult['indikator_konsistensi'] ?? []),
            'temuan' => array_values($analysisResult['temuan'] ?? []),
        ];
    }

    /**
     * Kumpulkan bukti pemeriksaan dari semua sumber.
     */
    private function kumpulkanBuktiPemeriksaan(array $extractionResult, array $analysisResult): array
    {
        $bukti = [];
        $sumberTelahDicatat = [];

        // Dari field ekstraksi
        foreach ($extractionResult['fields'] ?? [] as $field) {
            foreach ($field['bukti'] ?? [] as $b) {
                $kunci = $b['sumber'] . ':' . ($b['halaman'] ?? 'null') . ':' . ($b['raw_value'] ?? '');

                if (isset($sumberTelahDicatat[$kunci])) {
                    continue; // Hindari duplikasi
                }

                $sumberTelahDicatat[$kunci] = true;

                $bukti[] = [
                    'sumber' => $b['sumber'],
                    'raw_value' => $b['raw_value'],
                    'normalized_value' => $b['normalized_value'],
                    'halaman' => $b['halaman'],
                    'bukti_teks' => $b['bukti_teks'],
                    'field_terkait' => $field['nama_field'],
                ];
            }
        }

        // Dari QR
        $qr = $extractionResult['qr'] ?? [];
        if ($qr['ditemukan'] === true) {
            $kunci = 'qr:' . ($qr['konten'] ?? '');

            if (!isset($sumberTelahDicatat[$kunci])) {
                $sumberTelahDicatat[$kunci] = true;

                $bukti[] = [
                    'sumber' => 'qr',
                    'raw_value' => $qr['konten'],
                    'normalized_value' => $qr['konten'],
                    'halaman' => null,
                    'bukti_teks' => $qr['konten'],
                    'field_terkait' => null,
                ];
            }
        }

        // Dari temuan analisis
        foreach ($analysisResult['temuan'] ?? [] as $t) {
            if ($t['sumber_bukti'] ?? []) {
                foreach ($t['sumber_bukti'] as $sumber) {
                    $kunci = 'temuan:' . $sumber . ':' . $t['jenis_temuan'];

                    if (!isset($sumberTelahDicatat[$kunci])) {
                        $sumberTelahDicatat[$kunci] = true;

                        $bukti[] = [
                            'sumber' => $sumber,
                            'raw_value' => null,
                            'normalized_value' => null,
                            'halaman' => $t['halaman'],
                            'bukti_teks' => $t['deskripsi'],
                            'field_terkait' => $t['field_terkait'],
                        ];
                    }
                }
            }
        }

        return $bukti;
    }

    /**
     * Tentukan status proses.
     */
    private function determineStatusProses(array $merged): string
    {
        // Jika ekstraksi gagal, status proses gagal
        // Perlu mengakses extraction result terpisah, tapi kita pakai ringkasan
        $ringkasan = $merged['ringkasan'];

        if ($ringkasan['status_ekstraksi'] === 'GAGAL' || $ringkasan['status_analisis'] === 'ANALISIS_TIDAK_LENGKAP') {
            return self::STATUS_PROSES_GAGAL;
        }

        // Jika ada temuan critical atau ambigu, berhasil dengan peringatan
        if ($ringkasan['temuan_critical'] > 0 || $ringkasan['field_ambigu'] > 0 || $ringkasan['field_invalid'] > 0) {
            return self::STATUS_PROSES_BERHASIL_DENGAN_PERINGATAN;
        }

        // Jika ada warning, berhasil dengan peringatan
        if ($ringkasan['temuan_warning'] > 0 || $ringkasan['field_tidak_ditemukan'] > 0) {
            return self::STATUS_PROSES_BERHASIL_DENGAN_PERINGATAN;
        }

        return self::STATUS_PROSES_BERHASIL;
    }

    /**
     * Bangun hasil gagal.
     */
    private function buildFailedResult(string $error, string $idNib): array
    {
        return [
            'id_nib' => $idNib,
            'status_proses' => self::STATUS_PROSES_GAGAL,
            'ringkasan' => [
                'status_ekstraksi' => 'GAGAL',
                'status_analisis' => 'ANALISIS_TIDAK_LENGKAP',
                'total_field' => 0,
                'field_ditemukan' => 0,
                'field_tidak_ditemukan' => 0,
                'field_ambigu' => 0,
                'field_invalid' => 0,
                'persentase_kelengkapan' => 0,
                'qr_ditemukan' => false,
                'qr_jenis' => null,
                'total_temuan' => 1,
                'temuan_critical' => 1,
                'temuan_warning' => 0,
                'total_halaman' => null,
                'sumber_ekstraksi' => 'tidak_tersedia',
            ],
            'data_terekstraksi' => [
                'fields' => [],
                'qr' => [],
                'perbandingan' => [],
            ],
            'analisis_struktur' => [
                'karakteristik_dokumen' => [],
                'indikator_struktur' => ['ANALISIS_TIDAK_LENGKAP'],
                'indikator_konsistensi' => [],
                'temuan' => [
                    [
                        'jenis_temuan' => 'EKSTRAKSI_GAGAL',
                        'deskripsi' => $error,
                        'field_terkait' => null,
                        'sumber_bukti' => [],
                        'halaman' => null,
                        'tingkat_perhatian' => 'CRITICAL',
                    ],
                ],
            ],
            'indikator_screening' => ['ANALISIS_TIDAK_LENGKAP'],
            'ketidaksesuaian' => [],
            'bukti_pemeriksaan' => [],
            'perlu_review_manual' => true,
            'alasan_review' => $error,
            'dihasilkan_pada' => now()->toIso8601String(),
        ];
    }
}
