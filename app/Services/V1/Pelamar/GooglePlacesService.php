<?php

namespace App\Services\V1\Pelamar;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GooglePlacesService
{
    protected string $apiKey;
    protected int $cacheMinutes;

    public function __construct()
    {
        $this->apiKey = config('ai.google_places_api_key');
        $this->cacheMinutes = config('ai.cache_places_minutes', 1440);
    }

    public function cariRating(string $namaTempat, ?string $alamat = null): array
    {
        if (empty($this->apiKey)) {
            return $this->ratingTidakTersedia('API key tidak dikonfigurasi');
        }

        $cacheKey = 'places_' . md5(strtolower($namaTempat . ($alamat ?? '')));

        return Cache::remember($cacheKey, now()->addMinutes($this->cacheMinutes), function () use ($namaTempat, $alamat) {
            try {
                $query = $namaTempat;
                if ($alamat) {
                    $query .= ', ' . $alamat;
                }

                $response = Http::get('https://maps.googleapis.com/maps/api/place/textsearch/json', [
                    'query' => $query,
                    'key' => $this->apiKey,
                    'language' => 'id',
                    'region' => 'id',
                ]);

                if ($response->failed()) {
                    Log::warning('Google Places API error', ['status' => $response->status(), 'body' => $response->body()]);
                    return $this->ratingTidakTersedia('Gagal menghubungi Google Places');
                }

                $data = $response->json();

                if (($data['status'] ?? '') !== 'OK' || empty($data['results'])) {
                    return $this->ratingTidakTersedia('Tempat tidak ditemukan');
                }

                $place = $data['results'][0];

                return [
                    'tersedia' => true,
                    'nama' => $place['name'] ?? $namaTempat,
                    'alamat' => $place['formatted_address'] ?? ($alamat ?? ''),
                    'rating' => $place['rating'] ?? null,
                    'total_ulasan' => $place['user_ratings_total'] ?? 0,
                    'place_id' => $place['place_id'] ?? null,
                    'lantai' => $place['price_level'] ?? null,
                    'jam_buka' => $place['opening_hours']['open_now'] ?? null,
                ];
            } catch (\Exception $e) {
                Log::error('Google Places API exception', ['message' => $e->getMessage()]);
                return $this->ratingTidakTersedia('Terjadi kesalahan');
            }
        });
    }

    protected function ratingTidakTersedia(string $alasan): array
    {
        return [
            'tersedia' => false,
            'nama' => null,
            'alamat' => null,
            'rating' => null,
            'total_ulasan' => 0,
            'place_id' => null,
            'alasan' => $alasan,
        ];
    }
}
