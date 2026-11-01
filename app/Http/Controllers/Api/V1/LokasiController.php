<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\GeocodingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;

class LokasiController extends Controller
{
    public function cari(Request $request, GeocodingService $geocoding): JsonResponse
    {
        $query = $request->query('q');
        if (is_string($query)) {
            $query = trim(preg_replace('/\s+/u', ' ', $query) ?? '');
        }
        $validated = validator(['q' => $query], [
            'q' => ['required', 'string', 'min:3', 'max:200'],
        ])->validate();

        try {
            return response()->json([
                'data' => $geocoding->search($validated['q']),
                'attribution' => GeocodingService::ATTRIBUTION,
            ]);
        } catch (RuntimeException $exception) {
            return response()->json([
                'data' => [],
                'attribution' => GeocodingService::ATTRIBUTION,
                'message' => 'Pencarian lokasi sementara tidak tersedia. Silakan coba lagi.',
            ], 503)->header('Retry-After', '15');
        }
    }
}
