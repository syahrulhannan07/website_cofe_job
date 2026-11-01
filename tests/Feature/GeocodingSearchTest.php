<?php

namespace Tests\Feature;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class GeocodingSearchTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        config(['cache.default' => 'array', 'services.geocoding.url' => 'https://photon.komoot.io/api/']);
        Cache::flush();
        $this->travelTo(now()->startOfSecond());
        Http::preventStrayRequests();
    }

    public function test_search_is_public_normalized_bounded_and_cached(): void
    {
        Http::fake(['photon.komoot.io/api/*' => Http::response(['features' => [$this->feature()]])]);

        $this->search('  Kopi   Kenanga  ')
            ->assertOk()
            ->assertExactJson([
                'data' => [[
                    'id' => 'osm:N:123',
                    'nama' => 'Kopi Kenanga',
                    'alamat' => 'Jalan Uji 12, Kecamatan Indramayu, Indramayu, Kabupaten Indramayu, Jawa Barat, 45211, Indonesia',
                    'latitude' => -6.4,
                    'longitude' => 108.3,
                ]],
                'attribution' => '© OpenStreetMap contributors (Photon)',
            ]);

        Http::assertSent(fn (Request $request) => str_starts_with($request->url(), 'https://photon.komoot.io/api/')
            && $request['q'] === 'Kopi Kenanga'
            && $request['bbox'] === '107.85,-6.85,108.65,-6.2'
            && (float) $request['lat'] === -6.3274
            && (float) $request['lon'] === 108.3249
            && $request['countrycode'] === 'ID'
            && (int) $request['limit'] === 15);

        $this->search('kopi kenanga')->assertOk()->assertJsonCount(1, 'data');
        $this->travel(61)->seconds();
        $this->search('Kopi Kenanga')->assertOk();
        Http::assertSentCount(1);
        $this->travel(3600)->seconds();
        $this->search('Kopi Kenanga')->assertOk();
        Http::assertSentCount(2);
    }

    public function test_client_cannot_override_provider_url_or_search_region(): void
    {
        config(['services.geocoding.url' => 'https://geocoding.example.test/api/']);
        Http::fake(['geocoding.example.test/api/*' => Http::response(['features' => []])]);

        $this->getJson('/api/v1/lokasi/cari?'.http_build_query([
            'q' => 'Kopi Kenanga',
            'url' => 'https://untrusted.example.test/',
            'bbox' => '-180,-90,180,90',
            'lat' => 0,
            'lon' => 0,
            'countrycode' => 'DE',
        ]))->assertOk();

        Http::assertSent(fn (Request $request) => str_starts_with($request->url(), 'https://geocoding.example.test/api/')
            && $request['bbox'] === '107.85,-6.85,108.65,-6.2'
            && (float) $request['lat'] === -6.3274
            && (float) $request['lon'] === 108.3249
            && $request['countrycode'] === 'ID');
        Http::assertSentCount(1);
    }

    public function test_rejects_outside_bbox_foreign_country_and_explicit_foreign_administration(): void
    {
        $features = [
            $this->feature([], [107.84, -6.4]),
            $this->feature([], [108.66, -6.4]),
            $this->feature([], [108.3, -6.86]),
            $this->feature([], [108.3, -6.19]),
            $this->feature(['countrycode' => 'DE']),
            $this->feature(['countrycode' => null]),
            $this->feature(['county' => 'Kabupaten Cirebon']),
            $this->feature(['county' => 'Subang Regency']),
            $this->feature(['county' => '', 'district' => 'Majalengka']),
            $this->feature(['county' => '', 'district' => 'Kota Cirebon']),
            $this->feature(['county' => '', 'district' => 'Subang Regency']),
        ];
        Http::fake(['photon.komoot.io/api/*' => Http::response(['features' => $features])]);

        $this->search('Kopi Kenanga')->assertOk()->assertJsonPath('data', []);
    }

    #[DataProvider('foreignCities')]
    public function test_foreign_city_is_rejected_even_without_county_or_a_recognizable_district(string $city, string $district, ?string $county = null): void
    {
        $feature = $this->feature(['name' => 'Kopi Kenangan', 'city' => $city, 'district' => $district, 'county' => $county]);
        if ($county === null) {
            unset($feature['properties']['county']);
        }
        Http::fake(['photon.komoot.io/api/*' => Http::response(['features' => [$feature]])]);

        foreach (['Kopi Kenanga', 'Kopi Kenangan'] as $query) {
            $this->search($query)->assertOk()->assertJsonPath('data', []);
            $this->travel(2)->seconds();
        }
        Http::assertSentCount(2);
    }

    public static function foreignCities(): array
    {
        return [
            'live city with Kejaksan district' => ['Cirebon', 'Kejaksan'],
            'live city with Karyamulya district' => ['Cirebon', 'Karyamulya'],
            'live city with Drajat district' => ['Cirebon', 'Drajat'],
            'live city with Kalijaga district' => ['Cirebon', 'Kalijaga'],
            'case insensitive city' => ['CIREBON', 'Karyamulya'],
            'kota prefix' => ['Kota Cirebon', 'Karyamulya'],
            'kabupaten prefix' => ['Kabupaten Cirebon', 'Karyamulya'],
            'regency suffix' => ['Cirebon Regency', 'Karyamulya'],
            'city suffix' => ['Cirebon City', 'Karyamulya'],
            'neighbour Subang' => ['Subang', 'Unknown'],
            'neighbour Majalengka' => ['Majalengka', 'Unknown'],
            'neighbour Sumedang' => ['Sumedang', 'Unknown'],
            'neighbour Kuningan' => ['Kuningan', 'Unknown'],
            'explicit unlisted foreign kota' => ['Kota Bogor', 'Unknown'],
            'explicit unlisted foreign kabupaten' => ['Kabupaten Bogor', 'Unknown'],
            'explicit unlisted foreign regency' => ['Bogor Regency', 'Unknown'],
            'explicit unlisted foreign city' => ['Bogor City', 'Unknown'],
            'local district cannot override foreign city' => ['Cirebon', 'Kecamatan Indramayu'],
            'local county cannot override foreign city' => ['Cirebon', 'Karyamulya', 'Kabupaten Indramayu'],
        ];
    }

    #[DataProvider('acceptableLocalAdministration')]
    public function test_local_or_unknown_city_within_bbox_is_not_rejected(array $properties): void
    {
        $feature = $this->feature($properties);
        if (!array_key_exists('county', $properties)) {
            unset($feature['properties']['county']);
        }
        Http::fake(['photon.komoot.io/api/*' => Http::response(['features' => [$feature]])]);

        $this->search('Kopi Kenanga')->assertOk()->assertJsonCount(1, 'data');
    }

    public static function acceptableLocalAdministration(): array
    {
        return [
            'local county with city Jatibarang' => [['county' => 'Kabupaten Indramayu', 'city' => 'Jatibarang', 'district' => 'Unknown']],
            'city Jatibarang without county' => [['city' => 'Jatibarang', 'district' => 'Unknown']],
            'local city without county' => [['city' => 'Indramayu', 'district' => 'Unknown']],
            'explicit local kota' => [['city' => 'Kota Indramayu', 'district' => 'Unknown']],
            'explicit local regency' => [['city' => 'Indramayu Regency', 'district' => 'Unknown']],
            'local district without county' => [['city' => '', 'district' => 'Kecamatan Indramayu']],
            'unknown city within bbox' => [['city' => 'Unknown', 'district' => 'Unknown']],
            'missing city within bbox' => [['city' => null, 'district' => null]],
        ];
    }

    public function test_old_cached_results_are_not_reused_after_region_filter_changes(): void
    {
        $oldKey = 'geocoding:search:v1:'.hash('sha256', json_encode(config('services.geocoding')).'kopi kenanga');
        Cache::put($oldKey, [['nama' => 'Foreign cached cafe']], 3600);
        Http::fake(['photon.komoot.io/api/*' => Http::response(['features' => []])]);

        $this->search('Kopi Kenanga')->assertOk()->assertJsonPath('data', []);
        Http::assertSentCount(1);
    }

    public function test_valid_kecamatan_is_not_confused_with_a_foreign_regency(): void
    {
        Http::fake(['photon.komoot.io/api/*' => Http::response(['features' => [
            $this->feature(['county' => 'Indramayu Regency', 'district' => 'Kecamatan Jatibarang']),
        ]])]);

        $this->search('Kopi Kenanga')->assertOk()->assertJsonCount(1, 'data');
    }

    public function test_fuzzy_unrelated_results_and_administrative_centroids_are_not_used_as_fallback(): void
    {
        Http::fake(['photon.komoot.io/api/*' => Http::response(['features' => [
            $this->feature(['name' => 'Kopi Melati']),
            $this->feature(['name' => 'Kopi Kencana']),
            $this->feature(['name' => 'Kopi Melati', 'street' => 'Jalan Kenanga']),
            $this->feature(['name' => 'Kopi Melati', 'district' => 'Kenanga']),
            $this->feature(['name' => 'Indramayu', 'osm_key' => 'place', 'osm_value' => 'town']),
            $this->feature(['osm_key' => 'boundary', 'osm_value' => 'administrative']),
            $this->feature(['name' => 'Kenanga', 'osm_key' => 'place', 'osm_value' => 'district']),
        ]])]);

        $this->search('Kopi Kenanga')->assertOk()->assertJsonPath('data', []);
    }

    #[DataProvider('regionalSuffixQueries')]
    public function test_regional_suffix_does_not_obscure_the_business_name(string $query): void
    {
        Http::fake(['photon.komoot.io/api/*' => Http::response(['features' => [
            $this->feature(),
            $this->feature(['osm_id' => 456, 'name' => 'Kopi Melati']),
            $this->feature(['osm_id' => 789, 'name' => 'Kopi Melati', 'street' => 'Jalan Kenanga']),
        ]])]);

        $this->search($query)->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.nama', 'Kopi Kenanga');
    }

    public static function regionalSuffixQueries(): array
    {
        return [
            ['Kopi Kenanga, Jawa Barat, Indonesia'],
            ['Kopi Kenanga Jawa Barat Indonesia'],
            ['Kopi Kenanga, Provinsi Jawa Barat, Indonesia'],
            ['Kopi Kenanga, Province Jawa Barat, Indonesia'],
            ['Kopi Kenanga, Jawa Barat Province, Indonesia'],
            ['Kopi Kenanga, West Java, Indonesia'],
            ['Kopi Kenanga, Province West Java, Indonesia'],
            ['Kopi Kena, Jawa Barat, Indonesia'],
        ];
    }

    #[DataProvider('significantNameWords')]
    public function test_context_stripping_does_not_discard_significant_name_words(string $query): void
    {
        Http::fake(['photon.komoot.io/api/*' => Http::response(['features' => [$this->feature()]])]);

        $this->search($query)->assertOk()->assertJsonPath('data', []);
    }

    public static function significantNameWords(): array
    {
        return [
            ['Kopi Jawa Kenanga, Indonesia'],
            ['Kopi Barat Kenanga, Indonesia'],
            ['Kopi Provinsi Kenanga, Indonesia'],
            ['Kopi Province Kenanga, Indonesia'],
            ['Kopi Kenanga Jawa Barat Special'],
            ['Kopi Jawa Barat, Indonesia'],
            ['Kopi Melati, Jawa Barat, Indonesia'],
        ];
    }

    public function test_last_name_token_can_be_a_prefix_and_addresses_are_searchable(): void
    {
        Http::fake(['photon.komoot.io/api/*' => Http::response(['features' => [$this->feature()]])]);
        $this->search('Kopi Kena')->assertOk()->assertJsonCount(1, 'data');
        $this->travel(2)->seconds();
        $this->search('Jl Uji 12')->assertOk()->assertJsonCount(1, 'data');
    }

    #[DataProvider('completeAddressQueries')]
    public function test_explicit_address_matches_street_and_administrative_address_fields(string $query): void
    {
        Http::fake(['photon.komoot.io/api/*' => Http::response(['features' => [
            $this->feature(['name' => 'Kopi Melati', 'district' => 'Karanganyar']),
            $this->feature(['osm_id' => 456, 'district' => 'Tidak Cocok']),
        ]])]);

        $this->search($query)->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.nama', 'Kopi Melati');
    }

    public static function completeAddressQueries(): array
    {
        return [
            ['Jalan Uji 12, Karanganyar, Indramayu'],
            ['Jl Uji No 12, Kec Karanganyar, Kabupaten Indramayu, Kode Pos 45211'],
            ['Jalan Uji 12, Kecamatan Karanganyar, Kota Indramayu, Provinsi Jawa Barat, 45211'],
            ['Jalan Uji 12, Kelurahan Karanganyar, Indramayu, 45211'],
            ['Jalan Uji 12, Desa Karanganyar, Indramayu, Province Jawa Barat, Postal Code 45211'],
        ];
    }

    public function test_invalid_geometries_are_ignored(): void
    {
        $invalid = $this->feature();
        $invalid['geometry']['type'] = 'Polygon';
        Http::fake(['photon.komoot.io/api/*' => Http::response(['features' => [
            null, 'invalid', [], $invalid,
            $this->feature([], ['108.3', -6.4]),
            $this->feature([], [108.3, null]),
            $this->feature([], [108.3]),
            $this->feature([], [108.3, -6.4, 1]),
            $this->feature(['name' => [], 'street' => null]),
        ]])]);

        $this->search('Kopi Kenanga')->assertOk()->assertJsonPath('data', []);
    }

    public function test_results_are_deduplicated_by_osm_id_and_location_and_limited_to_five(): void
    {
        $features = [
            $this->feature(),
            $this->feature(),
            $this->feature(['osm_id' => 124]),
        ];
        for ($index = 1; $index <= 8; $index++) {
            $features[] = $this->feature(['osm_id' => 200 + $index], [108.3 + $index / 1000, -6.4]);
        }
        Http::fake(['photon.komoot.io/api/*' => Http::response(['features' => $features])]);

        $response = $this->search('Kopi Kenanga')->assertOk()->assertJsonCount(5, 'data');
        $this->assertCount(5, array_unique(array_column($response->json('data'), 'id')));
        $this->assertCount(5, array_unique(array_column($response->json('data'), 'longitude')));
    }

    public function test_empty_results_are_cached_briefly_without_a_centroid_fallback(): void
    {
        Http::fake(['photon.komoot.io/api/*' => Http::response(['features' => []])]);

        $this->search('Tidak ditemukan')->assertOk()->assertJsonPath('data', []);
        $this->search('Tidak ditemukan')->assertOk()->assertJsonPath('data', []);
        Http::assertSentCount(1);
        $this->travel(61)->seconds();
        $this->search('Tidak ditemukan')->assertOk()->assertJsonPath('data', []);
        Http::assertSentCount(2);
    }

    #[DataProvider('providerFailures')]
    public function test_upstream_failures_return_503_and_short_circuit_further_requests(mixed $body, int $status): void
    {
        Http::fake(['photon.komoot.io/api/*' => Http::response($body, $status)]);

        $this->search('Kopi Kenanga')->assertStatus(503)->assertHeader('Retry-After', '15');
        $this->travel(2)->seconds();
        $this->search('Kopi lain')->assertStatus(503);
        Http::assertSentCount(1);
    }

    public static function providerFailures(): array
    {
        return [
            'server error' => [['features' => []], 500],
            'provider rate limit' => [['features' => []], 429],
            'not json' => ['not json', 200],
            'missing features' => [[], 200],
            'invalid features' => [['features' => 'invalid'], 200],
            'object instead of feature list' => [['features' => ['unexpected' => []]], 200],
        ];
    }

    public function test_connection_failure_returns_503(): void
    {
        Http::fake(function () {
            throw new ConnectionException('Timed out');
        });

        $this->search('Kopi Kenanga')->assertStatus(503)->assertJsonPath('data', []);
    }

    #[DataProvider('invalidQueries')]
    public function test_bad_queries_are_rejected_without_remote_requests(array $query): void
    {
        $this->getJson('/api/v1/lokasi/cari?'.http_build_query($query))
            ->assertStatus(422)->assertJsonValidationErrors('q');
        Http::assertNothingSent();
    }

    public static function invalidQueries(): array
    {
        return [
            'missing' => [[]],
            'empty' => [['q' => '']],
            'whitespace' => [['q' => '    ']],
            'short after normalization' => [['q' => '  ab  ']],
            'unicode whitespace' => [['q' => "\u{00A0}ab\u{00A0}"]],
            'too long' => [['q' => str_repeat('a', 201)]],
            'array' => [['q' => ['kopi']]],
        ];
    }

    public function test_public_throttle_is_per_ip_even_for_cached_results(): void
    {
        Http::fake(['photon.komoot.io/api/*' => Http::response(['features' => []])]);
        for ($index = 0; $index < 30; $index++) {
            $this->search('Kopi Kenanga')->assertOk();
        }
        $this->search('Kopi Kenanga')->assertStatus(429);
        $this->withServerVariables(['REMOTE_ADDR' => '192.0.2.20']);
        $this->search('Kopi Kenanga')->assertOk();
        Http::assertSentCount(1);
    }

    public function test_remote_requests_have_a_shared_cooldown_but_cached_queries_still_work(): void
    {
        Http::fake(['photon.komoot.io/api/*' => Http::response(['features' => []])]);
        $this->search('Kopi Kenanga')->assertOk();
        $this->search('Kopi Melati')->assertStatus(503);
        $this->search('Kopi Kenanga')->assertOk();
        Http::assertSentCount(1);
        $this->travel(2)->seconds();
        $this->search('Kopi Melati')->assertOk();
        Http::assertSentCount(2);
    }

    public function test_remote_per_minute_budget_is_shared_between_ips(): void
    {
        config(['services.geocoding.remote_per_minute' => 2]);
        Http::fake(['photon.komoot.io/api/*' => Http::response(['features' => []])]);
        $this->search('Kopi pertama')->assertOk();
        $this->travel(2)->seconds();
        $this->search('Kopi kedua')->assertOk();
        $this->travel(2)->seconds();
        $this->withServerVariables(['REMOTE_ADDR' => '192.0.2.21']);
        $this->search('Kopi ketiga')->assertStatus(503);
        Http::assertSentCount(2);
    }

    public function test_busy_provider_lock_does_not_start_another_remote_request(): void
    {
        $lock = Cache::lock('geocoding:provider-lock', 10);
        $this->assertTrue($lock->get());
        try {
            $this->search('Kopi Kenanga')->assertStatus(503);
            Http::assertNothingSent();
        } finally {
            $lock->release();
        }
    }

    private function search(string $query): \Illuminate\Testing\TestResponse
    {
        return $this->getJson('/api/v1/lokasi/cari?'.http_build_query(['q' => $query]));
    }

    private function feature(array $properties = [], array $coordinates = [108.3, -6.4]): array
    {
        // Synthetic provider fixture; these are not verified coordinates of a real business.
        return [
            'type' => 'Feature',
            'geometry' => ['type' => 'Point', 'coordinates' => $coordinates],
            'properties' => array_replace([
                'osm_type' => 'N',
                'osm_id' => 123,
                'osm_key' => 'amenity',
                'osm_value' => 'cafe',
                'name' => 'Kopi Kenanga',
                'street' => 'Jalan Uji',
                'housenumber' => '12',
                'district' => 'Kecamatan Indramayu',
                'city' => 'Indramayu',
                'county' => 'Kabupaten Indramayu',
                'state' => 'Jawa Barat',
                'postcode' => '45211',
                'country' => 'Indonesia',
                'countrycode' => 'ID',
            ], $properties),
        ];
    }
}
