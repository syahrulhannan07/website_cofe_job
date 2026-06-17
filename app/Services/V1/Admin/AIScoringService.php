<?php

namespace App\Services\V1\Admin;

use App\Models\Lowongan;
use App\Models\Pengguna;
use App\Models\DeteksiLog;
use App\Models\PengaturanAi;
use App\Events\CompanyAccountStatusChanged;
use App\Repositories\V1\Admin\LowonganRepository;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AIScoringService
{
    const KEYWORD_MENCURIGAKAN = [
        'tanpa pengalaman', 'no experience needed',
        'tanpa ijazah', 'tanpa modal',
        'dibutuhkan segera', 'urgent',
        'gaji besar', 'gaji tinggi', 'pendapatan tak terbatas',
        'modal kecil', 'kerja online', 'work from home',
        'daftar sekarang', 'transfer pulsa',
        'penghasilan tambahan', 'reseller', 'dropship',
    ];

    const KEYWORD_FNB = [
        'barista', 'chef', 'cook', 'waiter', 'waitress',
        'kasir', 'kitchen', 'baker', 'pastry',
        'host', 'hostes', 'server', 'dishwasher',
        'cleaner', 'manajer', 'manager', 'supervisor',
        'crew', 'staff', 'helper', 'asisten',
        'koki', 'pelayan', 'pramusaji', 'kafe', 'cafe',
        'restoran', 'restaurant', 'coffee', 'kopi',
        'food', 'beverage', 'minuman', 'makanan',
        'shift', 'outlet', 'store', 'counter',
    ];

    public function __construct(
        protected LowonganRepository $lowonganRepository
    ) {}

    public function evaluasiLowongan(Lowongan $lowongan, bool $autoExecute = true): DeteksiLog
    {
        $signals = $this->deteksiSignalLowongan($lowongan);
        $perusahaanSignals = $this->deteksiSignalPerusahaan($lowongan->perusahaan?->pengguna);

        $allSignals = array_merge($signals, $perusahaanSignals);

        $aiSignal = $this->deteksiSignalAI($lowongan);
        if ($aiSignal) {
            $allSignals[] = $aiSignal;
        }

        $skor = array_sum(array_column($allSignals, 'bobot'));

        $penalty = $this->hitungPenaltyRiwayat($lowongan->perusahaan?->pengguna);
        $skor += $penalty;

        $tindakan = $this->tentukanTindakan($skor);

        $log = DeteksiLog::create([
            'id_pengguna'   => $lowongan->perusahaan?->id_pengguna,
            'id_lowongan'   => $lowongan->id_lowongan,
            'skor_total'    => $skor,
            'tindakan'      => $tindakan,
            'detail_signal' => $allSignals,
            'catatan'       => $penalty > 0 ? "Penalty riwayat: +{$penalty}" : null,
            'dieksekusi_oleh' => 'system',
        ]);

        if ($autoExecute && $tindakan !== 'aman') {
            $this->eksekusiTindakan($lowongan, $tindakan, $skor, $allSignals);
        }

        $this->logDeteksi($tindakan, $skor, $lowongan, $allSignals);

        return $log;
    }

    public function evaluasiPerusahaan(Pengguna $pengguna): ?DeteksiLog
    {
        if ($pengguna->peran !== 'Admin_Perusahaan') {
            return null;
        }

        $signals = $this->deteksiSignalPerusahaan($pengguna);

        if (empty($signals)) {
            return null;
        }

        $skor = array_sum(array_column($signals, 'bobot'));
        $penalty = $this->hitungPenaltyRiwayat($pengguna);
        $skor += $penalty;

        $tindakan = $this->tentukanTindakan($skor);

        $cafe = $pengguna->profilPerusahaan;
        $lowonganTerbaru = $cafe?->lowongan()->latest()->first();

        $log = DeteksiLog::create([
            'id_pengguna'   => $pengguna->id_pengguna,
            'id_lowongan'   => $lowonganTerbaru?->id_lowongan,
            'skor_total'    => $skor,
            'tindakan'      => $tindakan,
            'detail_signal' => $signals,
            'catatan'       => $penalty > 0 ? "Penalty riwayat: +{$penalty}" : null,
            'dieksekusi_oleh' => 'system',
        ]);

        if ($tindakan !== 'aman' && $tindakan !== 'flagged') {
            $this->eksekusiTindakanPerusahaan($pengguna, $tindakan, $skor, $signals);
        }

        return $log;
    }

    protected function deteksiSignalLowongan(Lowongan $lowongan): array
    {
        $signals = [];
        $bobotTinggi = PengaturanAi::ambilInt('bobot_tinggi', 30);
        $bobotSedang = PengaturanAi::ambilInt('bobot_sedang', 15);
        $bobotRendah = PengaturanAi::ambilInt('bobot_rendah', 5);

        if (empty($lowongan->gaji)) {
            $signals[] = $this->buatSignal('gaji_tidak_disebut', 'Gaji tidak disebutkan', $bobotRendah);
        } elseif ($this->deteksiGajiTidakRealistis($lowongan->gaji)) {
            $signals[] = $this->buatSignal('gaji_tidak_realistis', "Gaji tidak realistis: {$lowongan->gaji}", $bobotTinggi);
        }

        $deskripsiMin = PengaturanAi::ambilInt('deskripsi_min_char', 100);
        if (strlen(trim($lowongan->deskripsi ?? '')) < $deskripsiMin) {
            $signals[] = $this->buatSignal('deskripsi_pendek', 'Deskripsi terlalu pendek', $bobotSedang);
        }

        $persyaratanMin = PengaturanAi::ambilInt('persyaratan_min_char', 30);
        $persy = trim($lowongan->persyaratan ?? '');
        if (strlen($persy) < $persyaratanMin || in_array(strtolower($persy), ['tidak ada', '-', '', 'none', 'tidak ada persyaratan'])) {
            $signals[] = $this->buatSignal('persyaratan_minim', 'Persyaratan tidak mencukupi', $bobotTinggi);
        }

        if ($lowongan->batas_awal && $lowongan->batas_akhir) {
            $diff = now()->parse($lowongan->batas_awal)->diffInDays(now()->parse($lowongan->batas_akhir));
            $rentangMaks = PengaturanAi::ambilInt('rentang_maks_hari', 90);
            $rentangMin = PengaturanAi::ambilInt('rentang_min_hari', 3);
            if ($diff > $rentangMaks) {
                $signals[] = $this->buatSignal('rentang_waktu_panjang', "Rentang waktu terlalu panjang ({$diff} hari)", $bobotSedang);
            } elseif ($diff < $rentangMin) {
                $signals[] = $this->buatSignal('rentang_waktu_pendek', "Rentang waktu terlalu pendek ({$diff} hari)", $bobotRendah);
            }
        }

        $teksGabung = strtolower(($lowongan->posisi ?? '') . ' ' . ($lowongan->deskripsi ?? ''));
        foreach (self::KEYWORD_MENCURIGAKAN as $keyword) {
            if (str_contains($teksGabung, $keyword)) {
                $signals[] = $this->buatSignal('teks_mencurigakan', "Mengandung teks mencurigakan: '{$keyword}'", $bobotTinggi);
                break;
            }
        }

        $posisiLower = strtolower($lowongan->posisi ?? '');
        $relevan = false;
        foreach (self::KEYWORD_FNB as $kw) {
            if (str_contains($posisiLower, $kw)) {
                $relevan = true;
                break;
            }
        }
        if (!$relevan) {
            $signals[] = $this->buatSignal('judul_tidak_relevan', "Judul tidak relevan dengan F&B: '{$lowongan->posisi}'", $bobotSedang);
        }

        if (!$lowongan->relationLoaded('dokumenDibutuhkan')) {
            $lowongan->load('dokumenDibutuhkan');
        }
        if ($lowongan->dokumenDibutuhkan->isEmpty()) {
            $signals[] = $this->buatSignal('tanpa_dokumen', 'Tidak ada dokumen yang dibutuhkan', $bobotRendah);
        }

        if (!$lowongan->relationLoaded('pertanyaanSeleksi')) {
            $lowongan->load('pertanyaanSeleksi');
        }
        if ($lowongan->pertanyaanSeleksi->isEmpty()) {
            $signals[] = $this->buatSignal('tanpa_pertanyaan', 'Tidak ada pertanyaan seleksi', $bobotRendah);
        }

        $lowonganIdentik = $this->deteksiLowonganIdentik($lowongan);
        if ($lowonganIdentik > 0) {
            $signals[] = $this->buatSignal('lowongan_identik', "Terdapat {$lowonganIdentik} lowongan dengan deskripsi serupa", $bobotTinggi);
        }

        return $signals;
    }

    protected function deteksiSignalPerusahaan(?Pengguna $pengguna): array
    {
        $signals = [];
        if (!$pengguna || $pengguna->peran !== 'Admin_Perusahaan') {
            return $signals;
        }

        $bobotTinggi = PengaturanAi::ambilInt('bobot_tinggi', 30);
        $bobotSedang = PengaturanAi::ambilInt('bobot_sedang', 15);
        $bobotRendah = PengaturanAi::ambilInt('bobot_rendah', 5);

        $cafe = $pengguna->profilPerusahaan;

        if (!$cafe || empty($cafe->nama_perusahaan) || empty($cafe->alamat_perusahaan) || empty($cafe->logo_perusahaan)) {
            $signals[] = $this->buatSignal('profil_tidak_lengkap', 'Profil perusahaan tidak lengkap', $bobotSedang);
        }

        if ($cafe && !empty($cafe->alamat_perusahaan)) {
            $alamat = strtolower($cafe->alamat_perusahaan);
            if (!preg_match('/\b(jl|jalan|gg|gang|no|rt|rw|kelurahan|kecamatan|kota|kabupaten)\b/i', $alamat)) {
                $signals[] = $this->buatSignal('alamat_tidak_valid', "Alamat tidak valid: {$cafe->alamat_perusahaan}", $bobotRendah);
            }
        }

        $akunMinHari = PengaturanAi::ambilInt('akun_min_hari', 7);
        $usiaAkun = $pengguna->created_at?->diffInDays(now()) ?? 999;
        $jmlLowongan = $cafe?->lowongan()->count() ?? 0;
        if ($usiaAkun < $akunMinHari && $jmlLowongan > 0) {
            $signals[] = $this->buatSignal('akun_baru_lowongan_cepat', "Akun baru ({$usiaAkun} hari) sudah buat lowongan", $bobotTinggi);
        }

        $lonjakanMaks = PengaturanAi::ambilInt('lonjakan_maks_per_hari', 3);
        $lonjakan = $cafe?->lowongan()
            ->where('created_at', '>=', now()->subDay())
            ->count() ?? 0;
        if ($lonjakan > $lonjakanMaks) {
            $signals[] = $this->buatSignal('lonjakan_lowongan', "{$lonjakan} lowongan dalam 24 jam", $bobotTinggi);
        }

        if ($cafe) {
            $avgPelamar = $cafe->lowongan()
                ->withCount('lamaran')
                ->get()
                ->avg('lamaran_count') ?? 0;
            if ($jmlLowongan >= 2 && $avgPelamar < 2) {
                $signals[] = $this->buatSignal('minat_pelamar_rendah', "Rata-rata pelamar per lowongan: {$avgPelamar}", $bobotRendah);
            }
        }

        $email = strtolower($pengguna->email ?? '');
        if (!empty($email) && !preg_match('/@(gmail|yahoo|outlook|hotmail|live|protonmail|icloud)\./', $email)) {
            $signals[] = $this->buatSignal('email_mencurigakan', "Domain email tidak umum: " . explode('@', $email)[1] ?? '', $bobotRendah);
        }

        return $signals;
    }

    protected function deteksiSignalAI(Lowongan $lowongan): ?array
    {
        $apiKey = config('ai.groq_api_key');
        if (empty($apiKey)) {
            return null;
        }

        $model = config('ai.groq_model', 'llama-3.3-70b-versatile');

        $gaji = $lowongan->gaji ?? 'tidak disebutkan';
        $posisi = $lowongan->posisi ?? 'tidak disebutkan';
        $deskripsi = $lowongan->deskripsi ?? 'tidak ada';
        $persyaratan = $lowongan->persyaratan ?? 'tidak ada';
        $namaPerusahaan = $lowongan->perusahaan?->nama_perusahaan ?? 'tidak diketahui';

        $prompt = <<<PROMPT
Anda adalah asisten AI untuk deteksi lowongan pekerjaan mencurigakan di platform C.A.F.E. Job Portal (khusus cafe/F&B).

Analisis lowongan berikut dan identifikasi indikasi mencurigakan:

POSISI: {$posisi}
PERUSAHAAN: {$namaPerusahaan}
GAJI: {$gaji}
DESKRIPSI: {$deskripsi}
PERSYARATAN: {$persyaratan}

Yang perlu diperiksa:
1. Apakah gaji realistis untuk posisi ini?
2. Apakah posisi relevan dengan industri cafe/F&B?
3. Apakah deskripsi lowongan masuk akal atau copy-paste?
4. Apakah persyaratan sesuai dengan posisi?
5. Adakah indikasi penipuan?

Berikan skor (0-100) seberapa mencurigakan lowongan ini.
0 = sangat aman, normal
100 = sangat mencurigakan, pasti scam

Respons dalam format JSON PERSIS seperti ini (tanpa markdown, tanpa backtick):
{"skor":<0-100>,"alasan":"<penjelasan singkat>","masalah":["<masalah1>","<masalah2>"]}
PROMPT;

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type' => 'application/json',
            ])->timeout(15)->post('https://api.groq.com/openai/v1/chat/completions', [
                'model' => $model,
                'messages' => [
                    ['role' => 'system', 'content' => 'Anda adalah asisten AI untuk deteksi lowongan mencurigakan. Selalu respon dalam format JSON yang diminta.'],
                    ['role' => 'user', 'content' => $prompt],
                ],
                'temperature' => 0.1,
                'max_tokens' => 512,
            ]);

            if ($response->failed()) {
                Log::warning('Groq AI detection gagal', ['status' => $response->status(), 'body' => $response->body()]);
                return null;
            }

            $text = $response->json('choices.0.message.content');
            if (!$text) return null;

            $text = trim($text);
            if (str_starts_with($text, '```')) {
                $text = preg_replace('/^```(?:json)?\s*|\s*```$/i', '', $text);
            }

            $data = json_decode($text, true);
            if (!$data || !isset($data['skor'])) return null;

            $skorAi = (int) $data['skor'];
            $alasan = $data['alasan'] ?? 'Tidak ada alasan';
            $masalah = $data['masalah'] ?? [];

            if ($skorAi <= 0) return null;

            // Map AI score (0-100) to bobot (0-30)
            $bobotAi = min(30, max(0, (int) round($skorAi * 0.3)));

            $deskripsiSignal = 'Analisis AI: ' . $alasan;
            if (!empty($masalah)) {
                $deskripsiSignal .= ' (' . implode('; ', $masalah) . ')';
            }

            return [
                'signal'    => 'analisis_ai_groq',
                'deskripsi' => $deskripsiSignal,
                'bobot'     => $bobotAi,
                'detail_ai' => [
                    'skor'    => $skorAi,
                    'alasan'  => $alasan,
                    'masalah' => $masalah,
                ],
            ];
        } catch (\Exception $e) {
            Log::error('Groq AI detection exception', ['message' => $e->getMessage()]);
            return null;
        }
    }

    protected function deteksiGajiTidakRealistis(string $gaji): bool
    {
        $gaji = strtolower(str_replace([' ', '.', ','], '', $gaji));
        if (preg_match('/\d{9,}/', $gaji)) {
            return true;
        }
        $angka = (int) filter_var($gaji, FILTER_SANITIZE_NUMBER_INT);
        if ($angka > 100000000) {
            return true;
        }
        if (preg_match('/\b(100jt|200jt|500jt|milyar|miliar|1m)\b/i', $gaji)) {
            return true;
        }
        return false;
    }

    protected function deteksiLowonganIdentik(Lowongan $lowongan): int
    {
        $perusahaanId = $lowongan->id_perusahaan ?? $lowongan->perusahaan?->id_perusahaan;
        if (!$perusahaanId) {
            return 0;
        }

        $deskripsi = trim($lowongan->deskripsi ?? '');
        if (strlen($deskripsi) < 50) {
            return 0;
        }

        $serupa = Lowongan::where('id_perusahaan', $perusahaanId)
            ->where('id_lowongan', '!=', $lowongan->id_lowongan)
            ->get()
            ->filter(function ($l) use ($deskripsi) {
                $otherDesc = trim($l->deskripsi ?? '');
                if (strlen($otherDesc) < 50) return false;
                similar_text($deskripsi, $otherDesc, $percent);
                return $percent > 85;
            });

        return $serupa->count();
    }

    protected function hitungPenaltyRiwayat(?Pengguna $pengguna): int
    {
        if (!$pengguna) return 0;

        $pernahNonaktif = DeteksiLog::where('id_pengguna', $pengguna->id_pengguna)
            ->whereIn('tindakan', ['warning', 'suspended'])
            ->exists();

        if ($pernahNonaktif) {
            return PengaturanAi::ambilInt('penalty_riwayat', 20);
        }

        return 0;
    }

    protected function tentukanTindakan(int $skor): string
    {
        $thresholdSuspend = PengaturanAi::ambilInt('threshold_suspend', 100);
        $thresholdWarning = PengaturanAi::ambilInt('threshold_warning', 65);
        $thresholdFlagged = PengaturanAi::ambilInt('threshold_flagged', 35);

        if ($skor >= $thresholdSuspend) return 'suspended';
        if ($skor >= $thresholdWarning) return 'warning';
        if ($skor >= $thresholdFlagged) return 'flagged';
        return 'aman';
    }

    protected function eksekusiTindakan(Lowongan $lowongan, string $tindakan, int $skor, array $signals): void
    {
        $pengguna = $lowongan->perusahaan?->pengguna;
        if (!$pengguna) return;

        if ($tindakan === 'warning') {
            DB::transaction(function () use ($pengguna, $lowongan, $skor) {
                $pengguna->update(['status_akun' => 'Nonaktif']);

                $pengguna->notify(new \App\Notifications\AIAkunWarningNotification($lowongan, $skor));

                $this->notifikasiSuperAdmin($pengguna, $lowongan, $skor, 'warning');
            });
        }

        if ($tindakan === 'suspended') {
            DB::transaction(function () use ($pengguna, $lowongan, $skor) {
                $pengguna->update(['status_akun' => 'Diblokir']);

                Lowongan::where('id_perusahaan', $lowongan->id_perusahaan)
                    ->where('status', 'Active')
                    ->update(['status' => 'Closed']);

                event(new CompanyAccountStatusChanged($pengguna, 'Diblokir'));

                $pengguna->notify(new \App\Notifications\AIAkunSuspendedNotification($lowongan, $skor));

                $this->notifikasiSuperAdmin($pengguna, $lowongan, $skor, 'suspended');
            });
        }

        if ($tindakan === 'flagged') {
            $this->notifikasiSuperAdmin($pengguna, $lowongan, $skor, 'flagged');
        }
    }

    protected function eksekusiTindakanPerusahaan(Pengguna $pengguna, string $tindakan, int $skor, array $signals): void
    {
        if ($tindakan === 'warning') {
            DB::transaction(function () use ($pengguna, $skor) {
                $pengguna->update(['status_akun' => 'Nonaktif']);
                event(new CompanyAccountStatusChanged($pengguna, 'Nonaktif'));

                $pengguna->notify(new \App\Notifications\AIAkunWarningNotification(null, $skor));

                $this->notifikasiSuperAdmin($pengguna, null, $skor, 'warning');
            });
        }

        if ($tindakan === 'suspended') {
            DB::transaction(function () use ($pengguna, $skor) {
                $pengguna->update(['status_akun' => 'Diblokir']);

                $cafe = $pengguna->profilPerusahaan;
                if ($cafe) {
                    Lowongan::where('id_perusahaan', $cafe->id_perusahaan)
                        ->where('status', 'Active')
                        ->update(['status' => 'Closed']);
                }

                event(new CompanyAccountStatusChanged($pengguna, 'Diblokir'));

                $pengguna->notify(new \App\Notifications\AIAkunSuspendedNotification(null, $skor));

                $this->notifikasiSuperAdmin($pengguna, null, $skor, 'suspended');
            });
        }
    }

    protected function notifikasiSuperAdmin(Pengguna $pengguna, ?Lowongan $lowongan, int $skor, string $tindakan): void
    {
        $superAdmins = \App\Models\Pengguna::where('peran', 'Super_Admin')->get();

        foreach ($superAdmins as $sa) {
            $sa->notify(new \App\Notifications\AIPeringatanNotification($pengguna, $lowongan, $skor, $tindakan));
        }
    }

    protected function buatSignal(string $kode, string $deskripsi, int $bobot): array
    {
        return [
            'signal'    => $kode,
            'deskripsi' => $deskripsi,
            'bobot'     => $bobot,
        ];
    }

    protected function logDeteksi(string $tindakan, int $skor, Lowongan $lowongan, array $signals): void
    {
        $level = match ($tindakan) {
            'suspended' => 'critical',
            'warning'   => 'warning',
            'flagged'   => 'info',
            default     => 'debug',
        };

        Log::channel('stack')->log($level, "[AI Detection] {$tindakan} - Lowongan #{$lowongan->id_lowongan} '{$lowongan->posisi}' oleh perusahaan #{$lowongan->id_perusahaan} (skor: {$skor})");
    }
}
