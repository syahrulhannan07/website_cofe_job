<?php

namespace App\Services\V1\Pelamar;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class FaceRecognitionService
{
    protected ?string $apiKey;
    protected ?string $apiSecret;
    protected string $apiUrl;
    protected float $threshold;

    public function __construct()
    {
        $this->apiKey = config('services.faceplusplus.api_key');
        $this->apiSecret = config('services.faceplusplus.api_secret');
        $this->apiUrl = config('services.faceplusplus.api_url', 'https://api-us.faceplusplus.com');
        // Ambang batas ketat standar: minimal 85.0%
        $this->threshold = (float) config('services.faceplusplus.threshold', 85.0);
    }

    /**
     * Compare two faces using Face++ API with strict biometric verification
     * 
     * @param string $profilePhotoPath Path to profile photo (relative to storage or URL)
     * @param string $scanImageBase64 Base64 encoded scan image
     * @return array ['success' => bool, 'confidence' => float|null, 'threshold' => float, 'message' => string, 'face_detected' => bool]
     */
    public function compareFaces(string $profilePhotoPath, string $scanImageBase64): array
    {
        if (empty($this->apiKey) || empty($this->apiSecret)) {
            Log::error('Face++ credentials not configured');
            return [
                'success' => false,
                'confidence' => null,
                'threshold' => $this->threshold,
                'message' => 'Konfigurasi Face Recognition belum lengkap. Silakan hubungi administrator.',
                'face_detected' => false,
            ];
        }

        // Check if profile photo exists
        $profilePhotoFullPath = $this->resolvePhotoPath($profilePhotoPath);
        if (!$profilePhotoFullPath) {
            Log::error('Profile photo not found', ['path' => $profilePhotoPath]);
            return [
                'success' => false,
                'confidence' => null,
                'threshold' => $this->threshold,
                'message' => 'Foto profil tidak ditemukan. Silakan upload foto profil terlebih dahulu.',
                'face_detected' => false,
            ];
        }

        try {
            // Read profile photo content (supports local file or remote URL)
            $profilePhotoBytes = null;
            if (str_starts_with($profilePhotoFullPath, 'http://') || str_starts_with($profilePhotoFullPath, 'https://')) {
                $httpRes = Http::timeout(15)->get($profilePhotoFullPath);
                if ($httpRes->successful()) {
                    $profilePhotoBytes = $httpRes->body();
                }
            } elseif (file_exists($profilePhotoFullPath)) {
                $profilePhotoBytes = file_get_contents($profilePhotoFullPath);
            }

            if (!$profilePhotoBytes) {
                return [
                    'success' => false,
                    'confidence' => null,
                    'threshold' => $this->threshold,
                    'message' => 'Gagal membaca berkas foto profil. Silakan upload ulang foto profil Anda.',
                    'face_detected' => false,
                ];
            }

            // Convert profile photo to base64
            $profilePhotoBase64 = base64_encode($profilePhotoBytes);

            // Clean scanImageBase64 if it has data URL prefix like 'data:image/jpeg;base64,'
            if (str_contains($scanImageBase64, ';base64,')) {
                $scanImageBase64 = explode(';base64,', $scanImageBase64)[1];
            }

            $response = Http::timeout(30)
                ->asForm()
                ->post("{$this->apiUrl}/facepp/v3/compare", [
                    'api_key' => $this->apiKey,
                    'api_secret' => $this->apiSecret,
                    'image_base64_1' => $profilePhotoBase64,
                    'image_base64_2' => $scanImageBase64,
                ]);

            if ($response->failed()) {
                Log::error('Face++ API error', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                
                $errorData = $response->json();
                $errorMessage = $errorData['error_message'] ?? 'Gagal menghubungi layanan Face Recognition';
                
                return [
                    'success' => false,
                    'confidence' => null,
                    'threshold' => $this->threshold,
                    'message' => 'Layanan verifikasi wajah mengalami gangguan: ' . $errorMessage,
                    'face_detected' => false,
                ];
            }

            $data = $response->json();
            
            $faces1 = $data['faces1'] ?? [];
            $faces2 = $data['faces2'] ?? [];

            // 1. Verifikasi deteksi wajah pada foto profil
            if (empty($faces1)) {
                return [
                    'success' => false,
                    'confidence' => null,
                    'threshold' => $this->threshold,
                    'message' => 'Wajah tidak terdeteksi pada foto profil Anda. Harap perbarui foto profil dengan foto wajah yang jelas dan menghadap kamera.',
                    'face_detected' => false,
                ];
            }

            if (count($faces1) > 1) {
                return [
                    'success' => false,
                    'confidence' => null,
                    'threshold' => $this->threshold,
                    'message' => 'Terdeteksi lebih dari satu wajah pada foto profil Anda (' . count($faces1) . ' wajah). Harap gunakan foto profil yang hanya menampilkan wajah Anda sendiri.',
                    'face_detected' => false,
                ];
            }

            // 2. Verifikasi deteksi wajah pada hasil scan kamera
            if (empty($faces2)) {
                return [
                    'success' => false,
                    'confidence' => null,
                    'threshold' => $this->threshold,
                    'message' => 'Wajah tidak terdeteksi di kamera. Posisikan wajah Anda tepat di dalam area oval dan pastikan pencahayaan cukup terang.',
                    'face_detected' => false,
                ];
            }

            if (count($faces2) > 1) {
                return [
                    'success' => false,
                    'confidence' => null,
                    'threshold' => $this->threshold,
                    'message' => 'Terdeteksi lebih dari satu wajah di depan kamera (' . count($faces2) . ' wajah). Pastikan hanya Anda sendiri di depan kamera.',
                    'face_detected' => true,
                ];
            }

            // 3. Verifikasi ukuran wajah kamera (cegah wajah terlalu jauh / kecil / buram)
            $face2Rect = $faces2[0]['face_rectangle'] ?? null;
            if ($face2Rect) {
                $faceWidth = $face2Rect['width'] ?? 0;
                $faceHeight = $face2Rect['height'] ?? 0;
                if ($faceWidth < 100 || $faceHeight < 100) {
                    return [
                        'success' => false,
                        'confidence' => null,
                        'threshold' => $this->threshold,
                        'message' => 'Posisi wajah Anda terlalu jauh dari kamera. Silakan dekatkan wajah Anda ke area oval agar fitur biometrik dapat dipindai secara optimal.',
                        'face_detected' => true,
                    ];
                }
            }

            // 4. Kalkulasi Ambang Batas (Threshold) Ketat
            $confidence = (float) ($data['confidence'] ?? 0);
            $thresholds = $data['thresholds'] ?? [];

            // Face++ standard FAR thresholds:
            // 1e-3 (FAR 0.1%): ~62-65% (Terlalu longgar, dilarang dipakai)
            // 1e-4 (FAR 0.01%): ~69-72%
            // 1e-5 (FAR 0.001%): ~74-78% (Tingkat keamanan tinggi biometrik)
            // Sistem memperketat ambang batas minimal ke 85.0% atau (1e-5 + 5.0%), ambil yang tertinggi
            $strictMinThreshold = max($this->threshold, 85.0);
            if (isset($thresholds['1e-5'])) {
                $strictMinThreshold = max($strictMinThreshold, (float) $thresholds['1e-5'] + 5.0);
            }

            $isMatch = $confidence >= $strictMinThreshold;
            $confidenceRounded = round($confidence, 1);
            $thresholdRounded = round($strictMinThreshold, 1);

            // Log untuk audit trail pencocokan biometrik
            Log::info('Face++ Biometric Comparison Result', [
                'profile_photo' => $profilePhotoPath,
                'confidence' => $confidenceRounded,
                'applied_threshold' => $thresholdRounded,
                'is_match' => $isMatch,
                'facepp_thresholds' => $thresholds,
                'face2_rectangle' => $face2Rect,
            ]);

            return [
                'success' => $isMatch,
                'confidence' => $confidenceRounded,
                'threshold' => $thresholdRounded,
                'message' => $isMatch 
                    ? "Verifikasi wajah berhasil! Tingkat kemiripan: {$confidenceRounded}% (ambang batas ketat: {$thresholdRounded}%)." 
                    : "Verifikasi wajah tidak cocok. Tingkat kemiripan hanya {$confidenceRounded}% (ambang batas minimal: {$thresholdRounded}%). Pastikan Anda adalah pemilik profil akun ini dan wajah terlihat jelas di kamera.",
                'face_detected' => true,
            ];

        } catch (\Exception $e) {
            Log::error('FaceRecognitionService exception', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            return [
                'success' => false,
                'confidence' => null,
                'threshold' => $this->threshold,
                'message' => 'Terjadi kesalahan saat memproses verifikasi wajah: ' . $e->getMessage(),
                'face_detected' => false,
            ];
        }
    }

    /**
     * Resolve the full path or URL for a profile photo
     */
    protected function resolvePhotoPath(string $path): ?string
    {
        if (empty($path)) {
            return null;
        }

        // If it's already a full URL
        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        $cleanPath = ltrim($path, '/');
        if (str_starts_with($cleanPath, 'storage/')) {
            $cleanPath = substr($cleanPath, 8);
        }

        if (Storage::disk('public')->exists($cleanPath)) {
            return Storage::disk('public')->path($cleanPath);
        }

        if (Storage::disk('local')->exists($cleanPath)) {
            return Storage::disk('local')->path($cleanPath);
        }

        if (file_exists(public_path('storage/' . $cleanPath))) {
            return public_path('storage/' . $cleanPath);
        }

        $possiblePaths = [
            'foto_profil/' . $cleanPath,
            'profil/' . $cleanPath,
            'public/' . $cleanPath,
            'public/foto_profil/' . $cleanPath,
        ];

        foreach ($possiblePaths as $p) {
            if (Storage::disk('public')->exists($p)) {
                return Storage::disk('public')->path($p);
            }
            if (Storage::disk('local')->exists($p)) {
                return Storage::disk('local')->path($p);
            }
            if (file_exists(public_path('storage/' . $p))) {
                return public_path('storage/' . $p);
            }
        }

        return null;
    }
}