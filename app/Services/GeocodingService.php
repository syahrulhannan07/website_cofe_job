<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use RuntimeException;

class GeocodingService
{
    public const ATTRIBUTION = '© OpenStreetMap contributors (Photon)';

    public function search(string $query): array
    {
        $config = config('services.geocoding');
        $key = 'geocoding:search:v3:'.hash('sha256', json_encode($config).mb_strtolower($query));
        $cached = Cache::get($key);
        if (is_array($cached)) {
            return $cached;
        }

        // Shared cache/lock keeps concurrent users from flooding the public provider.
        $results = Cache::lock('geocoding:provider-lock', 10)->get(function () use ($query, $config, $key) {
            $cached = Cache::get($key);
            if (is_array($cached)) {
                return $cached;
            }

            if (Cache::has('geocoding:provider-unavailable')
                || RateLimiter::tooManyAttempts('geocoding:remote', (int) $config['remote_per_minute'])
                || !Cache::add('geocoding:remote-cooldown', true, 1)) {
                throw new RuntimeException('Geocoding temporarily unavailable.');
            }

            RateLimiter::hit('geocoding:remote', 60);
            try {
                $response = Http::acceptJson()
                    ->withHeaders(['User-Agent' => 'CofeJob-Geocoding/1.0'])
                    ->connectTimeout(2)
                    ->timeout(5)
                    ->get($config['url'], [
                        'q' => $query,
                        'bbox' => implode(',', $config['bbox']),
                        'lat' => $config['latitude'],
                        'lon' => $config['longitude'],
                        'countrycode' => 'ID',
                        'limit' => 15,
                    ]);
            } catch (ConnectionException $exception) {
                Cache::put('geocoding:provider-unavailable', true, 15);
                throw new RuntimeException('Geocoding connection failed.', 0, $exception);
            }

            $payload = $response->json();
            if (!$response->successful() || !is_array($payload)
                || !isset($payload['features']) || !is_array($payload['features'])
                || !array_is_list($payload['features'])) {
                Cache::put('geocoding:provider-unavailable', true, 15);
                throw new RuntimeException('Invalid geocoding response.');
            }

            $results = $this->filterResults($payload['features'], $query, $config['bbox']);
            Cache::put($key, $results, (int) ($results ? $config['cache_seconds'] : $config['empty_cache_seconds']));

            return $results;
        });

        if ($results === false) {
            throw new RuntimeException('Geocoding provider is busy.');
        }

        return $results;
    }

    private function filterResults(array $features, string $query, array $bbox): array
    {
        $results = [];
        $seenIds = [];
        $seenLocations = [];

        foreach ($features as $feature) {
            if (!is_array($feature)) {
                continue;
            }
            $properties = $feature['properties'] ?? null;
            $geometry = $feature['geometry'] ?? null;
            if (!is_array($properties) || !is_array($geometry) || ($geometry['type'] ?? null) !== 'Point') {
                continue;
            }
            $coordinates = $geometry['coordinates'] ?? null;
            if (!is_array($coordinates) || !array_is_list($coordinates) || count($coordinates) !== 2) {
                continue;
            }
            [$longitude, $latitude] = $coordinates;
            if ((!is_int($latitude) && !is_float($latitude)) || (!is_int($longitude) && !is_float($longitude))
                || !is_finite((float) $latitude) || !is_finite((float) $longitude)
                || $longitude < $bbox[0] || $latitude < $bbox[1] || $longitude > $bbox[2] || $latitude > $bbox[3]
                || strtoupper($this->text($properties, 'countrycode')) !== 'ID'
                || !$this->isLocalAdministration($properties)) {
                continue;
            }

            // Administrative/place centroids are not a business/address pin.
            if (in_array($this->text($properties, 'osm_key'), ['place', 'boundary'], true)) {
                continue;
            }
            $name = $this->text($properties, 'name');
            $street = $this->text($properties, 'street');
            $number = $this->text($properties, 'housenumber');
            $isAddressQuery = preg_match('/\b(jalan|jl|gang|gg|no|nomor)\b|\d/', $this->normalize($query));
            $candidate = $name !== '' ? $name : "$street $number";
            if ($isAddressQuery) {
                $candidate = implode(' ', [
                    $name, $street, $number,
                    $this->text($properties, 'district'),
                    $this->text($properties, 'city'),
                    $this->text($properties, 'county'),
                    $this->text($properties, 'state'),
                    $this->text($properties, 'postcode'),
                ]);
            }
            if (($name === '' && $street === '') || !$this->isRelevant($query, $candidate, (bool) $isAddressQuery)) {
                continue;
            }
            $name = $name !== '' ? $name : trim("$street $number");
            $address = implode(', ', array_unique(array_filter([
                trim("$street $number"),
                $this->text($properties, 'district'),
                $this->text($properties, 'city'),
                $this->text($properties, 'county'),
                $this->text($properties, 'state'),
                $this->text($properties, 'postcode'),
                $this->text($properties, 'country'),
            ], fn ($part) => $part !== '')));
            $osmType = strtoupper($this->text($properties, 'osm_type'));
            $osmId = $this->text($properties, 'osm_id');
            $id = in_array($osmType, ['N', 'W', 'R'], true) && ctype_digit($osmId)
                ? "osm:$osmType:$osmId"
                : 'photon:'.hash('sha256', "$name|$address|$latitude|$longitude");
            $location = $this->normalize($name).'|'.round($latitude, 5).'|'.round($longitude, 5);
            if (isset($seenIds[$id]) || isset($seenLocations[$location])) {
                continue;
            }
            $seenIds[$id] = true;
            $seenLocations[$location] = true;
            $results[] = [
                'id' => $id,
                'nama' => $name,
                'alamat' => $address !== '' ? $address : $name,
                'latitude' => (float) $latitude,
                'longitude' => (float) $longitude,
            ];
            if (count($results) === 5) {
                break;
            }
        }

        return $results;
    }

    private function isLocalAdministration(array $properties): bool
    {
        $county = $this->administrationName($this->text($properties, 'county'));
        if ($county !== '' && $county !== 'indramayu') {
            return false;
        }

        // Photon may omit county and put the foreign regency in city instead.
        // Bare city/district names can also be local kecamatan (e.g. Jatibarang).
        foreach (['city', 'district'] as $field) {
            $value = $this->text($properties, $field);
            $normalized = $this->administrationName($value);
            if ((preg_match('/\b(kabupaten|kab|kota|regency|city)\b/i', $value) && $normalized !== 'indramayu')
                || in_array($normalized, ['cirebon', 'subang', 'majalengka', 'sumedang', 'kuningan', 'bandung', 'jakarta'], true)) {
                return false;
            }
        }

        return true;
    }

    private function administrationName(string $value): string
    {
        return trim(preg_replace('/\b(kabupaten|kab|kota|regency|city|kecamatan|kec|district)\b/', '', $this->normalize($value)));
    }

    private function isRelevant(string $query, string $candidate, bool $isAddressQuery): bool
    {
        $contextTokens = ['', 'indramayu', 'kabupaten', 'kab', 'kota', 'indonesia'];
        if ($isAddressQuery) {
            $contextTokens = array_merge($contextTokens, [
                'kec', 'kecamatan', 'kel', 'kelurahan', 'ds', 'desa', 'district', 'village',
                'provinsi', 'province', 'state', 'regency', 'city', 'kode', 'pos', 'postal', 'code',
            ]);
        }
        $genericTokens = ['kopi', 'kafe', 'cafe', 'coffee', 'kedai', 'warung', 'jalan', 'jl', 'gang', 'gg', 'no', 'nomor'];
        $normalizedQuery = $this->normalize($query);
        // Strip complete trailing region phrases, not individual name words like Jawa/Barat.
        $withoutContext = preg_replace('/(?:\s+(?:(?:provinsi|province)\s+)?(?:jawa barat|west java)(?:\s+(?:provinsi|province))?|\s+indonesia)+$/', '', $normalizedQuery);
        if (array_diff(explode(' ', $withoutContext), $contextTokens, $genericTokens)) {
            $normalizedQuery = $withoutContext;
        }
        $tokens = array_values(array_diff(explode(' ', $normalizedQuery), $contextTokens));
        $meaningful = array_values(array_diff($tokens, $genericTokens));
        $tokens = $meaningful ?: $tokens;
        $words = explode(' ', $this->normalize($candidate));
        if (!$tokens) {
            return false;
        }
        foreach ($tokens as $index => $token) {
            $matched = false;
            foreach ($words as $word) {
                // Only the final token may be incomplete for search-as-you-type.
                if ($word === $token || ($index === count($tokens) - 1 && mb_strlen($token) >= 3 && str_starts_with($word, $token))) {
                    $matched = true;
                    break;
                }
            }
            if (!$matched) {
                return false;
            }
        }

        return true;
    }

    private function normalize(string $value): string
    {
        return trim(preg_replace('/[^a-z0-9]+/', ' ', strtolower(Str::ascii($value))));
    }

    private function text(array $properties, string $key): string
    {
        $value = $properties[$key] ?? '';

        return is_string($value) || is_int($value) ? trim((string) $value) : '';
    }
}
