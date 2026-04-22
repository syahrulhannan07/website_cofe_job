<?php

use App\Models\Lamaran;
use App\Models\LogStatusLamaran;
use App\Models\Wawancara;
use Illuminate\Support\Facades\Http;

function test($name, $callback) {
    echo "TEST: $name... ";
    try {
        $result = $callback();
        echo "SUCCESS\n";
        return $result;
    } catch (\Throwable $e) {
        echo "FAILED: " . $e->getMessage() . "\n";
        return null;
    }
}

$baseUrl = 'http://127.0.0.1:8000/api/v1';

// 1. Login
$token = test("Login", function() use ($baseUrl) {
    $response = Http::post("$baseUrl/auth/login", [
        'email' => 'budi@example.com',
        'kata_sandi' => 'password123'
    ]);
    if ($response->failed()) throw new \Exception($response->body());
    return $response->json('data.token');
});

if (!$token) exit;

// 2. Persiapan Data (Seeding via Eloquent)
test("Persiapan Data", function() {
    // Cari lamaran terakhir Budi
    $lamaran = Lamaran::where('id_profil', 2)->latest()->first();
    if (!$lamaran) {
        // Buat dummy jika belum ada
        $lamaran = Lamaran::create([
            'id_lowongan' => 1,
            'id_profil' => 2,
            'status' => 'Diproses'
        ]);
    }

    // Trigger update status ke 'Wawancara' untuk ngetes log otomatis
    $lamaran->update(['status' => 'Wawancara']);

    // Buat jadwal wawancara
    Wawancara::updateOrCreate(
        ['id_lamaran' => $lamaran->id_lamaran],
        [
            'tanggal_wawancara' => now()->addDays(2),
            'lokasi' => 'Starbucks Thamrin',
            'catatan' => 'Harap membawa CV fisik.',
            'status' => 'Terjadwal'
        ]
    );

    return $lamaran;
});

$lamaran = Lamaran::where('id_profil', 2)->latest()->first();

// 3. Test List Lamaran
test("GET /pelamar/lamaran", function() use ($baseUrl, $token) {
    $response = Http::withToken($token)->get("$baseUrl/pelamar/lamaran");
    if ($response->failed()) throw new \Exception($response->body());
    if ($response->json('status') !== 'success') throw new \Exception("Status bukan success");
});

// 4. Test Detail & Timeline
test("GET /pelamar/lamaran/{id}", function() use ($baseUrl, $token, $lamaran) {
    $response = Http::withToken($token)->get("$baseUrl/pelamar/lamaran/{$lamaran->id_lamaran}");
    if ($response->failed()) throw new \Exception($response->body());
    $data = $response->json('data');
    if (count($data['timeline']) < 2) throw new \Exception("Timeline harusnya punya minimal 2 entri (Diproses, Wawancara)");
});

// 5. Test Detail Wawancara
test("GET /pelamar/lamaran/{id}/wawancara", function() use ($baseUrl, $token, $lamaran) {
    $response = Http::withToken($token)->get("$baseUrl/pelamar/lamaran/{$lamaran->id_lamaran}/wawancara");
    if ($response->failed()) throw new \Exception($response->body());
    if ($response->json('data.is_expired') !== false) throw new \Exception("Harusnya belum expired");
});

echo "\n--- VERIFIKASI STATUS LAMARAN SELESAI ---\n";
