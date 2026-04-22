<?php

use App\Models\JenisDokumen;
use App\Models\PertanyaanLowongan;
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

// 2. Mulai Lamaran
$id_lamaran = test("Mulai Lamaran", function() use ($baseUrl, $token) {
    $response = Http::withToken($token)->post("$baseUrl/lamaran/mulai", [
        'id_lowongan' => 1
    ]);
    if ($response->failed()) throw new \Exception($response->body());
    return $response->json('data.id_lamaran');
});

if (!$id_lamaran) exit;

// 3. Upload Dokumen
test("Upload Dokumen", function() use ($baseUrl, $token, $id_lamaran) {
    $cv = JenisDokumen::where('nama_dokumen', 'CV')->first();
    $filePath = __DIR__ . '/dummy.pdf';
    file_put_contents($filePath, 'dummy content');

    $response = Http::withToken($token)
        ->attach('dokumen[]', file_get_contents($filePath), 'dummy.pdf')
        ->post("$baseUrl/lamaran/$id_lamaran/dokumen", [
            'id_jenis_dokumen' => [$cv->id_jenis_dokumen]
        ]);
    
    unlink($filePath);
    if ($response->failed()) throw new \Exception($response->body());
});

// 4. Simpan Jawaban
test("Simpan Jawaban", function() use ($baseUrl, $token, $id_lamaran) {
    $q = PertanyaanLowongan::first();
    $response = Http::withToken($token)->post("$baseUrl/lamaran/$id_lamaran/jawaban", [
        'jawaban' => [
            ['id_pertanyaan' => $q->id_pertanyaan, 'jawaban' => 'Saya ahli latte art']
        ]
    ]);
    if ($response->failed()) throw new \Exception($response->body());
});

// 5. Kirim Lamaran
test("Kirim Lamaran", function() use ($baseUrl, $token, $id_lamaran) {
    $response = Http::withToken($token)->post("$baseUrl/lamaran/$id_lamaran/kirim");
    if ($response->failed()) throw new \Exception($response->body());
});

// 6. Cek Duplikat
test("Cek Duplikat", function() use ($baseUrl, $token) {
    $response = Http::withToken($token)->post("$baseUrl/lamaran/mulai", [
        'id_lowongan' => 1
    ]);
    // Karena id_lowongan 1 sudah "dikirim" dan lunas, MulaiLamaranRequest harusnya blokir
    if ($response->status() === 422) {
        return true;
    }
    throw new \Exception("Harusnya error 422 (sudah pernah melamar), tapi dapat " . $response->status());
});

echo "\n--- SEMUA PENGUJIAN SELESAI ---\n";
