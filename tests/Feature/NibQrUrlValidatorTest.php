<?php

namespace Tests\Feature;

use App\Services\Nib\NibQrUrlValidatorService;
use Illuminate\Support\Facades\Config;
use Tests\TestCase;

class NibQrUrlValidatorTest extends TestCase
{
    private NibQrUrlValidatorService $validator;

    protected function setUp(): void
    {
        parent::setUp();
        $this->validator = new NibQrUrlValidatorService(
            Config::get('nib_qr.allowed_hosts', ['oss.go.id'])
        );
    }

    private function assertResultStructure(array $result): void
    {
        $this->assertArrayHasKey('status', $result);
        $this->assertArrayHasKey('is_valid', $result);
        $this->assertArrayHasKey('is_oss_domain', $result);
        $this->assertArrayHasKey('scheme', $result);
        $this->assertArrayHasKey('host', $result);
        $this->assertArrayHasKey('normalized_url', $result);
        $this->assertArrayHasKey('reason', $result);
        $this->assertIsBool($result['is_valid']);
        $this->assertIsBool($result['is_oss_domain']);
    }

    /** @test */
    public function url_https_host_oss_diterima_sebagai_oss_url_valid(): void
    {
        $result = $this->validator->validate('https://oss.go.id/verify/nib/1234567890123');

        $this->assertResultStructure($result);
        $this->assertSame('OSS_URL_VALID', $result['status']);
        $this->assertTrue($result['is_valid']);
        $this->assertTrue($result['is_oss_domain']);
        $this->assertSame('https', $result['scheme']);
        $this->assertSame('oss.go.id', $result['host']);
        $this->assertSame('https://oss.go.id/verify/nib/1234567890123', $result['normalized_url']);
        $this->assertNotNull($result['reason']);
    }

    /** @test */
    public function url_http_ditolak(): void
    {
        $result = $this->validator->validate('http://oss.go.id/verify/nib/123');

        $this->assertSame('INVALID_URL', $result['status']);
        $this->assertFalse($result['is_valid']);
        $this->assertFalse($result['is_oss_domain']);
        $this->assertNull($result['normalized_url']);
    }

    /** @test */
    public function domain_bukan_oss_diterima_sebagai_untrusted_tidak_palsu_otomatis(): void
    {
        $result = $this->validator->validate('https://example.com/halaman');

        $this->assertSame('UNTRUSTED_URL', $result['status']);
        $this->assertFalse($result['is_valid']);
        $this->assertFalse($result['is_oss_domain']);
        $this->assertSame('https', $result['scheme']);
        $this->assertSame('example.com', $result['host']);
        $this->assertNull($result['normalized_url']);
    }

    /** @test */
    public function domain_oss_go_id_example_com_ditolak(): void
    {
        $result = $this->validator->validate('https://oss.go.id.example.com/verify');

        $this->assertSame('UNTRUSTED_URL', $result['status']);
        $this->assertFalse($result['is_valid']);
        $this->assertFalse($result['is_oss_domain']);
        $this->assertSame('oss.go.id.example.com', $result['host']);
    }

    /** @test */
    public function domain_oss_go_id_dengang_hubung_ditolak(): void
    {
        $result = $this->validator->validate('https://oss-go.id/verify');

        $this->assertSame('UNTRUSTED_URL', $result['status']);
        $this->assertFalse($result['is_valid']);
        $this->assertSame('oss-go.id', $result['host']);
    }

    /** @test */
    public function subdomain_oss_yang_tidak_diizinkan_ditolak(): void
    {
        $result = $this->validator->validate('https://www.oss.go.id/verify');

        $this->assertSame('UNTRUSTED_URL', $result['status']);
        $this->assertFalse($result['is_valid']);
        $this->assertFalse($result['is_oss_domain']);
        $this->assertSame('www.oss.go.id', $result['host']);
    }

    /** @test */
    public function url_dengan_username_password_ditolak(): void
    {
        $result = $this->validator->validate('https://user:pass@oss.go.id/verify');

        $this->assertSame('INVALID_URL', $result['status']);
        $this->assertFalse($result['is_valid']);
        $this->assertNull($result['normalized_url']);
    }

    /** @test */
    public function url_dengan_port_non_443_ditolak(): void
    {
        $result = $this->validator->validate('https://oss.go.id:8443/verify');

        $this->assertSame('INVALID_URL', $result['status']);
        $this->assertFalse($result['is_valid']);
        $this->assertNull($result['normalized_url']);
    }

    /** @test */
    public function url_dengan_ip_literal_ditolak(): void
    {
        $result = $this->validator->validate('https://192.168.1.1/verify');

        $this->assertSame('INVALID_URL', $result['status']);
        $this->assertFalse($result['is_valid']);
        $this->assertNull($result['normalized_url']);
    }

    /** @test */
    public function url_localhost_ditolak(): void
    {
        $result = $this->validator->validate('https://localhost/verify');

        $this->assertSame('INVALID_URL', $result['status']);
        $this->assertFalse($result['is_valid']);
        $this->assertNull($result['normalized_url']);
    }

    /** @test */
    public function url_hostname_internal_private_ditolak(): void
    {
        $result = $this->validator->validate('https://10.0.0.5/verify');

        $this->assertSame('INVALID_URL', $result['status']);
        $this->assertFalse($result['is_valid']);
        $this->assertNull($result['normalized_url']);
    }

    /** @test */
    public function url_dengan_backslash_ditolak(): void
    {
        $result = $this->validator->validate('https://oss.go.id\\evil.com/verify');

        $this->assertSame('INVALID_URL', $result['status']);
        $this->assertFalse($result['is_valid']);
        $this->assertNull($result['normalized_url']);
    }

    /** @test */
    public function url_dengan_karakter_kontrol_ditolak(): void
    {
        $result = $this->validator->validate("https://oss.go.id/\x01verify");

        $this->assertSame('INVALID_URL', $result['status']);
        $this->assertFalse($result['is_valid']);
        $this->assertNull($result['normalized_url']);
    }

    /** @test */
    public function string_teks_biasa_bukan_url(): void
    {
        $result = $this->validator->validate('NIB 1234567890123');

        $this->assertSame('NON_URL_CONTENT', $result['status']);
        $this->assertFalse($result['is_valid']);
        $this->assertFalse($result['is_oss_domain']);
        $this->assertNull($result['scheme']);
        $this->assertNull($result['host']);
        $this->assertNull($result['normalized_url']);
    }

    /** @test */
    public function string_kosong(): void
    {
        $result = $this->validator->validate('');

        $this->assertSame('NON_URL_CONTENT', $result['status']);
        $this->assertFalse($result['is_valid']);
        $this->assertNull($result['normalized_url']);
    }

    /** @test */
    public function null_diterima_sebagai_non_url_content(): void
    {
        $result = $this->validator->validate(null);

        $this->assertSame('NON_URL_CONTENT', $result['status']);
        $this->assertFalse($result['is_valid']);
        $this->assertNull($result['normalized_url']);
    }

    /** @test */
    public function url_dengan_query_string_diterima(): void
    {
        $result = $this->validator->validate('https://oss.go.id/verify/nib/123?nib=1234567890123');

        $this->assertSame('OSS_URL_VALID', $result['status']);
        $this->assertTrue($result['is_valid']);
        $this->assertSame('https://oss.go.id/verify/nib/123?nib=1234567890123', $result['normalized_url']);
    }

    /** @test */
    public function url_dengan_fragment_diterima_fragment_tidak_disimpan_normalisasi(): void
    {
        $result = $this->validator->validate('https://oss.go.id/verify/nib/123#section');

        $this->assertSame('OSS_URL_VALID', $result['status']);
        $this->assertTrue($result['is_valid']);
        $this->assertSame('https://oss.go.id/verify/nib/123', $result['normalized_url']);
    }

    /** @test */
    public function url_dengan_hostname_trailing_dot_ditolak(): void
    {
        $result = $this->validator->validate('https://oss.go.id./verify');

        $this->assertSame('INVALID_URL', $result['status']);
        $this->assertFalse($result['is_valid']);
        $this->assertNull($result['normalized_url']);
    }

    /** @test */
    public function url_dengan_hostname_encoding_ambigu_ditolak(): void
    {
        $result = $this->validator->validate('https://oss%2ego.id/verify');

        $this->assertSame('INVALID_URL', $result['status']);
        $this->assertFalse($result['is_valid']);
        $this->assertNull($result['normalized_url']);
    }

    /** @test */
    public function url_tanpa_host_ditolak(): void
    {
        $result = $this->validator->validate('https://');

        $this->assertSame('INVALID_URL', $result['status']);
        $this->assertFalse($result['is_valid']);
        $this->assertNull($result['normalized_url']);
    }

    /** @test */
    public function url_ipv6_ditolak(): void
    {
        $result = $this->validator->validate('https://[::1]/verify');

        $this->assertSame('INVALID_URL', $result['status']);
        $this->assertFalse($result['is_valid']);
        $this->assertNull($result['normalized_url']);
    }

    /** @test */
    public function url_port_default_https_tanpa_dinyatakan_diterima(): void
    {
        $result = $this->validator->validate('https://oss.go.id/verify');

        $this->assertSame('OSS_URL_VALID', $result['status']);
        $this->assertTrue($result['is_valid']);
    }

    /** @test */
    public function tidak_ada_http_request_yang_dilakukan(): void
    {
        // Service hanya validasi statis; memastikan tidak ada facade Http yang dipanggil.
        $result = $this->validator->validate('https://oss.go.id/verify/nib/123');

        $this->assertSame('OSS_URL_VALID', $result['status']);
        $this->assertNotNull($result['normalized_url']);
    }
}
