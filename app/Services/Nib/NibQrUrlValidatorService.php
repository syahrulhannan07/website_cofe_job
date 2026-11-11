<?php

namespace App\Services\Nib;

use Illuminate\Support\Str;

/**
 * Validasi hasil decoding QR Code pada fitur Automated NIB Screening.
 *
 * Service hanya melakukan validasi statis terhadap isi mentah QR Code.
 * Tidak melakukan decoding ulang, tidak melakukan HTTP request, tidak
 * melakukan DNS lookup, dan tidak mengakses API OSS apapun.
 *
 * Hasil validasi bukanlah bukti keaslian dokumen NIB. Domain yang terdaftar
 * dalam allowlist hanya menunjukkan bahwa host berasal dari OSS, bukan bahwa
 * URL menunjuk halaman verifikasi NIB yang sah.
 */
class NibQrUrlValidatorService
{
    public const STATUS_OSS_URL_VALID = 'OSS_URL_VALID';
    public const STATUS_NON_URL_CONTENT = 'NON_URL_CONTENT';
    public const STATUS_INVALID_URL = 'INVALID_URL';
    public const STATUS_UNTRUSTED_URL = 'UNTRUSTED_URL';
    public const STATUS_VALIDATION_FAILED = 'VALIDATION_FAILED';

    private const DEFAULT_PORT_HTTPS = 443;

    /**
     * Daftar host OSS yang diizinkan (exact match). Diambil dari konfigurasi.
     *
     * @var list<string>
     */
    private array $allowedHosts;

    /**
     * @param  list<string>  $allowedHosts
     */
    public function __construct(array $allowedHosts = [])
    {
        $this->allowedHosts = array_unique(array_map('strtolower', array_filter($allowedHosts)));
    }

    /**
     * Validasi isi mentah QR Code dan hasilkan status validasi terstruktur.
     *
     * @param  string|null  $decodedContent  Isi mentah hasil decoding QR Code
     * @return array{
     *     status: string,
     *     is_valid: bool,
     *     is_oss_domain: bool,
     *     scheme: string|null,
     *     host: string|null,
     *     normalized_url: string|null,
     *     reason: string|null
     * }
     */
    public function validate(?string $decodedContent): array
    {
        if ($decodedContent === null || $decodedContent === '') {
            return $this->buildResult(
                self::STATUS_NON_URL_CONTENT,
                false,
                false,
                null,
                null,
                null,
                'Konten QR kosong atau tidak diberikan.'
            );
        }

        try {
            // Karakter kontrol dan whitespace berbahaya (0x00-0x1F dan 0x7F).
            if (preg_match('/[\x00-\x1F\x7F]/u', $decodedContent) === 1) {
                return $this->buildResult(
                    self::STATUS_INVALID_URL,
                    false,
                    false,
                    null,
                    null,
                    null,
                    'Konten mengandung karakter kontrol atau whitespace berbahaya.'
                );
            }

            // Backslash menghasilkan format URL ambigu dan berpotensi digunakan
            # untuk path traversal / host manipulation.
            if (str_contains($decodedContent, '\\')) {
                return $this->buildResult(
                    self::STATUS_INVALID_URL,
                    false,
                    false,
                    null,
                    null,
                    null,
                    'URL mengandung backslash yang tidak diizinkan.'
                );
            }

            $parsed = parse_url($decodedContent);

            if ($parsed === false) {
                return $this->buildResult(
                    self::STATUS_INVALID_URL,
                    false,
                    false,
                    null,
                    null,
                    null,
                    'Gagal mengurai input sebagai URL.'
                );
            }

            $scheme = $parsed['scheme'] ?? null;
            $host = $parsed['host'] ?? null;
            $port = $parsed['port'] ?? null;
            $path = $parsed['path'] ?? '';
            $query = $parsed['query'] ?? null;

            // Tanpa skema sama sekali: bukan URL (teks biasa).
            if ($scheme === null) {
                return $this->buildResult(
                    self::STATUS_NON_URL_CONTENT,
                    false,
                    false,
                    null,
                    null,
                    null,
                    'Input tidak menggunakan skema URL, dianggap teks biasa.'
                );
            }

            // Skema wajib HTTPS.
            if (Str::lower($scheme) !== 'https') {
                return $this->buildResult(
                    self::STATUS_INVALID_URL,
                    false,
                    false,
                    $scheme,
                    null,
                    null,
                    'Skema URL harus HTTPS.'
                );
            }

            // Hostname wajib tersedia.
            if ($host === null || $host === '') {
                return $this->buildResult(
                    self::STATUS_INVALID_URL,
                    false,
                    false,
                    $scheme,
                    null,
                    null,
                    'Hostname tidak tersedia pada URL.'
                );
            }

            $normalizedHost = Str::lower($host);

            // Tolak username / password (userinfo).
            if (isset($parsed['user']) || isset($parsed['pass'])) {
                return $this->buildResult(
                    self::STATUS_INVALID_URL,
                    false,
                    false,
                    $scheme,
                    $normalizedHost,
                    null,
                    'URL tidak boleh mengandung username atau password.'
                );
            }

            // Port: hanya 443 atau tidak dinyatakan (default HTTPS).
            if ($port !== null && $port !== self::DEFAULT_PORT_HTTPS) {
                return $this->buildResult(
                    self::STATUS_INVALID_URL,
                    false,
                    false,
                    $scheme,
                    $normalizedHost,
                    null,
                    'Port yang digunakan bukan port default HTTPS (443).'
                );
            }

            // Tolak trailing dot pada hostname.
            if (Str::endsWith($normalizedHost, '.')) {
                return $this->buildResult(
                    self::STATUS_INVALID_URL,
                    false,
                    false,
                    $scheme,
                    $normalizedHost,
                    null,
                    'Hostname tidak boleh diakhiri dengan titik.'
                );
            }

            // Tolak hostname yang mengandung percent-encoding (manipulasi encoding).
            if (str_contains($normalizedHost, '%')) {
                return $this->buildResult(
                    self::STATUS_INVALID_URL,
                    false,
                    false,
                    $scheme,
                    $normalizedHost,
                    null,
                    'Hostname tidak boleh mengandung percent-encoding.'
                );
            }

            // Tolak IP literal (IPv4 dan IPv6), mencakup loopback dan private IP.
            if ($this->isIpLiteral($normalizedHost)) {
                return $this->buildResult(
                    self::STATUS_INVALID_URL,
                    false,
                    false,
                    $scheme,
                    $normalizedHost,
                    null,
                    'Hostname dalam bentuk IP literal tidak diperbolehkan.'
                );
            }

            // Tolak hostname loopback internal secara eksplisit.
            if ($normalizedHost === 'localhost' || $normalizedHost === 'localhost.localdomain') {
                return $this->buildResult(
                    self::STATUS_INVALID_URL,
                    false,
                    false,
                    $scheme,
                    $normalizedHost,
                    null,
                    'Hostname loopback internal tidak diperbolehkan.'
                );
            }

            $isOssDomain = in_array($normalizedHost, $this->allowedHosts, true);

            if ($isOssDomain) {
                $normalizedUrl = $this->normalizeUrl(
                    $scheme,
                    $normalizedHost,
                    $port,
                    $path,
                    $query
                );

                return $this->buildResult(
                    self::STATUS_OSS_URL_VALID,
                    true,
                    true,
                    $scheme,
                    $normalizedHost,
                    $normalizedUrl,
                    'URL HTTPS valid dengan host OSS terverifikasi.'
                );
            }

            return $this->buildResult(
                self::STATUS_UNTRUSTED_URL,
                false,
                false,
                $scheme,
                $normalizedHost,
                null,
                'Hostname tidak termasuk dalam daftar host OSS yang diizinkan.'
            );
        } catch (\Throwable $e) {
            return $this->buildResult(
                self::STATUS_VALIDATION_FAILED,
                false,
                false,
                null,
                null,
                null,
                'Terjadi kesalahan saat memvalidasi URL.'
            );
        }
    }

    /**
     * Periksa apakah hostname adalah literal IP (IPv4 atau IPv6).
     */
    private function isIpLiteral(string $host): bool
    {
        if (filter_var($host, \FILTER_VALIDATE_IP, \FILTER_FLAG_IPV4) !== false) {
            return true;
        }

        if (filter_var($host, \FILTER_VALIDATE_IP, \FILTER_FLAG_IPV6) !== false) {
            return true;
        }

        // IPv6 dalam kurung siku, misalnya [::1].
        if (Str::startsWith($host, '[') && Str::endsWith($host, ']')) {
            $inner = substr($host, 1, -1);

            return filter_var($inner, \FILTER_VALIDATE_IP, \FILTER_FLAG_IPV6) !== false;
        }

        return false;
    }

    /**
     * Susun URL yang telah dinormalisasi (tanpa userinfo, port default dihilangkan).
     */
    private function normalizeUrl(string $scheme, string $host, ?int $port, string $path, ?string $query): string
    {
        $url = $scheme . '://' . $host;

        if ($path !== '') {
            $url .= $path;
        }

        if ($query !== null && $query !== '') {
            $url .= '?' . $query;
        }

        return $url;
    }

    /**
     * Susun array hasil validasi.
     */
    private function buildResult(
        string $status,
        bool $isValid,
        bool $isOssDomain,
        ?string $scheme,
        ?string $host,
        ?string $normalizedUrl,
        ?string $reason
    ): array {
        return [
            'status' => $status,
            'is_valid' => $isValid,
            'is_oss_domain' => $isOssDomain,
            'scheme' => $scheme,
            'host' => $host,
            'normalized_url' => $normalizedUrl,
            'reason' => $reason,
        ];
    }
}
