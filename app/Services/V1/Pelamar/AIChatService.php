<?php

namespace App\Services\V1\Pelamar;

use App\Models\Lowongan;
use App\Models\Pengguna;
use App\Models\ProfilPelamar;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AIChatService
{
    protected ?ProfilPelamar $profilPelamar = null;
    protected string $baseUrl = 'https://api.groq.com/openai/v1/chat/completions';

    public function chat(array $messages, ?int $userId = null): array
    {
        $apiKey = config('ai.groq_api_key');
        if (empty($apiKey)) {
            return [
                'role' => 'assistant',
                'content' => 'Maaf, layanan AI sedang tidak tersedia saat ini. Silakan coba lagi nanti.',
            ];
        }

        if ($userId) {
            $pengguna = Pengguna::find($userId);
            $this->profilPelamar = $pengguna?->profilPelamar;
        }

        try {
            $response = $this->callGroq(
                $this->buildIntentPrompt(),
                $this->buildMessages($messages),
                0.3,
                1024,
                $apiKey
            );

            if (!$response) {
                return [
                    'role' => 'assistant',
                    'content' => 'Maaf, terjadi kesalahan saat memproses pesan Anda. Silakan coba lagi.',
                ];
            }

            if (preg_match('/<cafe_query>(.*?)<\/cafe_query>/s', $response, $matches)) {
                $queryParams = json_decode($matches[1], true);
                if ($queryParams && isset($queryParams['posisi'])) {
                    return $this->handleJobQuery($queryParams, $apiKey, $messages);
                }
            }

            return [
                'role' => 'assistant',
                'content' => $response,
            ];
        } catch (\Exception $e) {
            Log::error('Groq API exception', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return [
                'role' => 'assistant',
                'content' => 'Maaf, terjadi kesalahan saat memproses pesan Anda. Silakan coba lagi.',
            ];
        }
    }

    protected function handleJobQuery(array $params, string $apiKey, array $messages): array
    {
        $lowongan = $this->cariLowongan($params);

        if (count($lowongan) > 0) {
            $konteks = "Berikut adalah data lowongan yang tersedia (diurutkan dari gaji tertinggi ke terendah):\n\n";
            foreach ($lowongan as $i => $l) {
                $perusahaan = $l['perusahaan']['nama_perusahaan'] ?? 'Perusahaan tidak diketahui';
                $konteks .= sprintf(
                    "%d. **%s** — %s\n   📍 %s\n   💰 %s\n   ⏳ Batas: %s\n\n",
                    $i + 1,
                    $l['posisi'],
                    $perusahaan,
                    $l['lokasi'] ?? 'Tidak disebutkan',
                    $l['gaji'] ?? 'Tidak disebutkan',
                    $l['batas_akhir']
                );
            }
            $konteks .= "\nGunakan data di atas untuk menjawab pertanyaan pelamar dengan ramah dan informatif.";
        } else {
            $konteks = "Tidak ada lowongan yang cocok dengan kriteria yang diminta pelamar saat ini. Sampaikan dengan ramah bahwa belum ada lowongan yang sesuai.";
        }

        $phase2Messages = array_merge(
            [['role' => 'system', 'content' => $this->buildSystemPrompt() . "\n\n" . $konteks]],
            $this->buildMessages($messages)
        );

        $response = $this->callGroq(
            $this->buildSystemPrompt() . "\n\n" . $konteks,
            $this->buildMessages($messages),
            0.7,
            2048,
            $apiKey
        );

        if ($response) {
            return ['role' => 'assistant', 'content' => $response];
        }

        return [
            'role' => 'assistant',
            'content' => $this->formatLowonganFallback($lowongan),
        ];
    }

    protected function callGroq(string $systemPrompt, array $messages, float $temperature, int $maxTokens, string $apiKey): ?string
    {
        $payload = [
            'model' => config('ai.groq_model', 'llama-3.3-70b-versatile'),
            'messages' => array_merge(
                [['role' => 'system', 'content' => $systemPrompt]],
                $messages
            ),
            'temperature' => $temperature,
            'max_tokens' => $maxTokens,
        ];

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $apiKey,
            'Content-Type' => 'application/json',
        ])->timeout(30)->post($this->baseUrl, $payload);

        if ($response->failed()) {
            Log::error('Groq API gagal', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            return null;
        }

        $data = $response->json();
        return $data['choices'][0]['message']['content'] ?? null;
    }

    protected function formatLowonganFallback(array $lowongan): string
    {
        if (count($lowongan) === 0) {
            return 'Maaf, belum ada lowongan yang sesuai dengan kriteria yang Anda cari. Silakan coba kata kunci lain atau pantau terus portal kami untuk lowongan terbaru.';
        }

        $teks = 'Berikut lowongan yang saya temukan untuk Anda (diurutkan dari gaji tertinggi):' . "\n\n";
        foreach ($lowongan as $i => $l) {
            $perusahaan = $l['perusahaan']['nama_perusahaan'] ?? 'Perusahaan tidak diketahui';
            $teks .= sprintf(
                "%d. **%s** — %s\n   📍 %s\n   💰 %s\n   ⏳ Batas: %s\n\n",
                $i + 1,
                $l['posisi'],
                $perusahaan,
                $l['lokasi'] ?? 'Tidak disebutkan',
                $l['gaji'] ?? 'Tidak disebutkan',
                $l['batas_akhir']
            );
        }
        $teks .= 'Semoga membantu! Jika ada yang ingin ditanyakan lebih lanjut, silakan hubungi kami.';

        return $teks;
    }

    protected function cariLowongan(array $params): array
    {
        $query = Lowongan::aktifTerverifikasi()->with('perusahaan');

        if (!empty($params['posisi'])) {
            $query->where('posisi', 'like', '%' . $params['posisi'] . '%');
        }

        if (!empty($params['lokasi'])) {
            $query->where('lokasi', 'like', '%' . $params['lokasi'] . '%');
        }

        $results = $query->get();

        $results = $results->sortByDesc(function ($item) {
            return $this->extractGajiMax($item->gaji);
        })->values();

        return $results->take(20)->toArray();
    }

    protected function extractGajiMax($gaji): float
    {
        if (empty($gaji)) {
            return 0;
        }
        $clean = str_replace('.', '', $gaji);
        preg_match_all('/\d+/', $clean, $matches);
        $numbers = array_map('floatval', $matches[0] ?? []);
        return !empty($numbers) ? max($numbers) : 0;
    }

    protected function buildMessages(array $messages): array
    {
        $groqMessages = [];
        $foundUser = false;

        foreach ($messages as $msg) {
            if ($msg['role'] === 'assistant' && !$foundUser) {
                continue;
            }

            $foundUser = true;

            $groqMessages[] = [
                'role' => $msg['role'] === 'assistant' ? 'assistant' : 'user',
                'content' => $msg['content'],
            ];
        }

        return $groqMessages;
    }

    protected function buildIntentPrompt(): string
    {
        $profileInfo = '';
        if ($this->profilPelamar) {
            $skills = $this->profilPelamar->skills->pluck('nama_skill')->implode(', ') ?: 'belum diisi';
            $profileInfo = sprintf(
                "Informasi pelamar:\n- Nama: %s\n- Lokasi: %s\n- Skill: %s",
                $this->profilPelamar->nama_lengkap ?? 'tidak diketahui',
                $this->profilPelamar->alamat ?? 'tidak disebutkan',
                $skills
            );
        }

        return <<<PROMPT
Anda adalah **CafeBot**, asisten AI dari portal lowongan kerja C.A.F.E. Job Portal.

### PENTING — Deteksi Pencarian Lowongan:
Analisis PERCAKAPAN di bawah. Jika user **meminta rekomendasi atau pencarian lowongan** (berdasarkan posisi, lokasi, gaji, skill), Anda HARUS merespon EXACT dengan format:

<cafe_query>{"posisi":"<kata kunci>","lokasi":"<lokasi jika disebut>"}</cafe_query>

Contoh:
- User: "cari lowongan barista" → <cafe_query>{"posisi":"barista","lokasi":""}</cafe_query>
- User: "lowongan kasir di Indramayu" → <cafe_query>{"posisi":"kasir","lokasi":"Indramayu"}</cafe_query>
- User: "rekomendasi kerja cafe" → <cafe_query>{"posisi":"cafe","lokasi":""}</cafe_query>
- User: "lowongan yang cocok untuk saya" → <cafe_query>{"posisi":"<skill pertama pelamar>","lokasi":""}</cafe_query>
- User: "info lowongan" atau "cari kerja" → <cafe_query>{"posisi":"","lokasi":""}</cafe_query>

Jika user hanya bertanya umum atau ngobrol biasa, jawab seperti biasa TANPA tag <cafe_query>.

{$profileInfo}
PROMPT;
    }

    protected function buildSystemPrompt(): string
    {
        $profileInfo = '';
        if ($this->profilPelamar) {
            $skills = $this->profilPelamar->skills->pluck('nama_skill')->implode(', ') ?: 'belum diisi';
            $pengalamanCount = $this->profilPelamar->pengalamanKerja->count();
            $profileInfo = sprintf(
                "Informasi pelamar:\n- Nama: %s\n- Lokasi: %s\n- Skill: %s\n- Pengalaman: %s pengalaman tercatat",
                $this->profilPelamar->nama_lengkap ?? 'tidak diketahui',
                $this->profilPelamar->alamat ?? 'tidak disebutkan',
                $skills,
                $pengalamanCount
            );
        }

        return <<<PROMPT
Anda adalah **CafeBot**, asisten AI resmi dari platform **C.A.F.E. Job Portal** — portal lowongan pekerjaan khusus cafe dan F&B di Indonesia, terutama wilayah Indramayu dan sekitarnya.

### Tugas Anda:
- Membantu pelamar mencari lowongan pekerjaan cafe yang sesuai dengan preferensi mereka
- Menjawab pertanyaan seputar platform C.A.F.E. Job Portal
- Memberikan tips karir, persiapan wawancara, dan dunia kerja cafe/F&B
- Menjawab pertanyaan umum apa pun dengan ramah dan sopan

### Kepribadian:
- Gunakan **Bahasa Indonesia** yang ramah, santai, dan membantu
- Bersikap profesional namun hangat
- Gunakan nama pelamar jika tersedia untuk sapaan yang personal

{$profileInfo}
PROMPT;
    }
}
