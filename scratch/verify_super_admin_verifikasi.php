<?php

use App\Models\Pengguna;
use App\Models\ProfilPerusahaan;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Hash;

function test($name, $callback) {
    echo "TEST: $name... ";
    try {
        $result = $callback();
        echo "\033[32mSUCCESS\033[0m\n";
        return $result;
    } catch (\Throwable $e) {
        echo "\033[31mFAILED\033[0m: " . $e->getMessage() . "\n";
        return null;
    }
}

$baseUrl = 'http://127.0.0.1:8000/api/v1';

// 1. Get Super Admin Token
$token = test("Login as Super Admin", function() use ($baseUrl) {
    $response = Http::post("$baseUrl/auth/portal-pusat/login", [
        'username_email' => 'ramadhansanjaya18@gmail.com',
        'kata_sandi' => 'cofe-job-sprama'
    ]);
    if ($response->failed()) throw new \Exception("Login failed: " . $response->body());
    $token = $response->json('data.token');
    if (!$token) throw new \Exception("Token not found in response");
    return $token;
});

if (!$token) {
    echo "Failed to obtain token, exiting.\n";
    exit(1);
}

// 2. Setup a test company in Pending state
$testCompId = test("Setup test Pending Company 1", function() {
    // Delete if existing
    $oldUser = Pengguna::where('email', 'pending_test1@kafe.com')->first();
    if ($oldUser) $oldUser->delete();

    $user = Pengguna::create([
        'nama_pengguna' => 'pending_test1',
        'email' => 'pending_test1@kafe.com',
        'kata_sandi' => Hash::make('password123'),
        'peran' => 'Admin_Perusahaan',
        'status_akun' => 'Nonaktif', // Start as Nonaktif until verified
    ]);

    $profil = ProfilPerusahaan::create([
        'id_pengguna' => $user->id_pengguna,
        'nama_perusahaan' => 'Antigravity Cafe Test 1',
        'alamat_perusahaan' => 'Jl. Test 123',
        'dokumen_izin' => 'legalitas/test1.pdf',
        'status_verifikasi' => 'Pending',
    ]);

    return $profil->id_perusahaan;
});

// 3. Test GET pending verification list
test("GET /super-admin/verifikasi (List pending)", function() use ($baseUrl, $token, $testCompId) {
    $response = Http::withToken($token)->get("$baseUrl/super-admin/verifikasi");
    if ($response->status() !== 200) throw new \Exception("Status " . $response->status() . ": " . $response->body());
    
    $list = $response->json('data');
    if (!is_array($list)) throw new \Exception("Expected array data");
    
    $found = false;
    foreach ($list as $item) {
        if ($item['id'] === $testCompId) {
            $found = true;
            if ($item['nama_perusahaan'] !== 'Antigravity Cafe Test 1') {
                throw new \Exception("Name mismatch");
            }
            if ($item['email'] !== 'pending_test1@kafe.com') {
                throw new \Exception("Email mismatch");
            }
            break;
        }
    }
    
    if (!$found) throw new \Exception("Test company ID $testCompId not found in pending list");
});

// 4. Test Approve action
test("PUT /super-admin/verifikasi/{id}/setuju (Approve)", function() use ($baseUrl, $token, $testCompId) {
    $response = Http::withToken($token)->put("$baseUrl/super-admin/verifikasi/$testCompId/setuju");
    if ($response->status() !== 200) throw new \Exception("Status " . $response->status() . ": " . $response->body());
    
    if ($response->json('status') !== 'success') throw new \Exception("Expected success status");
    
    // Check Database status
    $profil = ProfilPerusahaan::with('pengguna')->find($testCompId);
    if ($profil->status_verifikasi !== 'Diterima') {
        throw new \Exception("Expected status_verifikasi 'Diterima', got " . $profil->status_verifikasi);
    }
    if ($profil->pengguna->status_akun !== 'Aktif') {
        throw new \Exception("Expected status_akun 'Aktif', got " . $profil->pengguna->status_akun);
    }
});

// 5. Setup a second test company in Pending state for rejection
$testCompId2 = test("Setup test Pending Company 2", function() {
    $oldUser = Pengguna::where('email', 'pending_test2@kafe.com')->first();
    if ($oldUser) $oldUser->delete();

    $user = Pengguna::create([
        'nama_pengguna' => 'pending_test2',
        'email' => 'pending_test2@kafe.com',
        'kata_sandi' => Hash::make('password123'),
        'peran' => 'Admin_Perusahaan',
        'status_akun' => 'Nonaktif',
    ]);

    $profil = ProfilPerusahaan::create([
        'id_pengguna' => $user->id_pengguna,
        'nama_perusahaan' => 'Antigravity Cafe Test 2',
        'alamat_perusahaan' => 'Jl. Test 456',
        'dokumen_izin' => 'legalitas/test2.pdf',
        'status_verifikasi' => 'Pending',
    ]);

    return $profil->id_perusahaan;
});

// 6. Test Reject action with validation error (empty alasan)
test("PUT /super-admin/verifikasi/{id}/tolak (Rejection validation fail)", function() use ($baseUrl, $token, $testCompId2) {
    $response = Http::withToken($token)->put("$baseUrl/super-admin/verifikasi/$testCompId2/tolak", [
        'alasan' => ''
    ]);
    if ($response->status() !== 422) throw new \Exception("Expected 422 status for validation fail, got " . $response->status());
});

// 7. Test Reject action success
test("PUT /super-admin/verifikasi/{id}/tolak (Reject)", function() use ($baseUrl, $token, $testCompId2) {
    $response = Http::withToken($token)->put("$baseUrl/super-admin/verifikasi/$testCompId2/tolak", [
        'alasan' => 'Dokumen legalitas buram dan tidak terbaca.'
    ]);
    if ($response->status() !== 200) throw new \Exception("Status " . $response->status() . ": " . $response->body());
    
    if ($response->json('status') !== 'success') throw new \Exception("Expected success status");
    
    // Check Database status
    $profil = ProfilPerusahaan::with('pengguna')->find($testCompId2);
    if ($profil->status_verifikasi !== 'Ditolak') {
        throw new \Exception("Expected status_verifikasi 'Ditolak', got " . $profil->status_verifikasi);
    }
    if ($profil->alasan_penolakan !== 'Dokumen legalitas buram dan tidak terbaca.') {
        throw new \Exception("Expected alasan_penolakan to match input, got: " . $profil->alasan_penolakan);
    }
});

// 8. Clean up
test("Cleanup test data", function() use ($testCompId, $testCompId2) {
    $p1 = ProfilPerusahaan::find($testCompId);
    if ($p1) {
        $u1 = $p1->pengguna;
        $p1->delete();
        if ($u1) $u1->delete();
    }
    
    $p2 = ProfilPerusahaan::find($testCompId2);
    if ($p2) {
        $u2 = $p2->pengguna;
        $p2->delete();
        if ($u2) $u2->delete();
    }
});

echo "\n--- ALL SUPER ADMIN VERIFIKASI TESTS PASSED ---\n";
