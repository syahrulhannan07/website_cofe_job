<?php

use App\Models\Pengguna;
use App\Models\ProfilPerusahaan;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;

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

// 1. Clean up old test data
test("Cleanup", function() {
    $p = Pengguna::where('email', 'admin_test@kafe.com')->first();
    if ($p) $p->delete();
});

// 2. Test Registration
test("POST /auth/register/perusahaan", function() use ($baseUrl) {
    $document = UploadedFile::fake()->create('nib.pdf', 1000); // 1MB

    $response = Http::attach(
        'dokumen_legalitas', file_get_contents($document->getPathname()), 'nib.pdf'
    )->post("$baseUrl/auth/register/perusahaan", [
        'nama_kafe' => 'Kafe Test Antigravity',
        'nama_pengelola' => 'Admin Test',
        'email' => 'admin_test@kafe.com',
        'kata_sandi' => 'password123',
        'konfirmasi_kata_sandi' => 'password123',
        'alamat' => 'Jl. Antigravity No. 1',
        'deskripsi' => 'Kafe masa depan',
    ]);

    if ($response->status() !== 201) throw new \Exception("Status " . $response->status() . ": " . $response->body());
    if ($response->json('success') !== true) throw new \Exception("Success flag missing");
});

// 3. Login as the new Admin
$token = test("Login as Admin_Perusahaan", function() use ($baseUrl) {
    $response = Http::post("$baseUrl/auth/login", [
        'email' => 'admin_test@kafe.com',
        'kata_sandi' => 'password123'
    ]);
    if ($response->failed()) throw new \Exception($response->body());
    return $response->json('data.token');
});

// 4. Test Get Profile
test("GET /admin/profil-perusahaan", function() use ($baseUrl, $token) {
    $response = Http::withToken($token)->get("$baseUrl/admin/profil-perusahaan");
    if ($response->status() !== 200) throw new \Exception("Status " . $response->status());
    if ($response->json('data.nama_perusahaan') !== 'Kafe Test Antigravity') throw new \Exception("Invalid profile data");
});

// 5. Test Update Profile
test("POST /admin/profil-perusahaan", function() use ($baseUrl, $token) {
    $logo = UploadedFile::fake()->image('logo.png', 500, 500);

    $response = Http::withToken($token)->attach(
        'logo', file_get_contents($logo->getPathname()), 'logo.png'
    )->post("$baseUrl/admin/profil-perusahaan", [
        'nama_perusahaan' => 'Kafe Test Updated',
    ]);

    if ($response->status() !== 200) throw new \Exception("Status " . $response->status() . ": " . $response->body());
    if ($response->json('data.nama_perusahaan') !== 'Kafe Test Updated') throw new \Exception("Update failed");
    
    $logoPath = $response->json('data.logo_perusahaan');
    if (!Storage::disk('public')->exists($logoPath)) throw new \Exception("Logo file not stored");
});

echo "\n--- VERIFIKASI SELESAI ---\n";
