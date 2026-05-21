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

// 2. Setup a test company admin
$testAdminId = test("Setup test Company Admin for Suspend", function() {
    // Delete if existing
    $oldUser = Pengguna::where('email', 'admin_test_suspend@kafe.com')->first();
    if ($oldUser) $oldUser->delete();

    $user = Pengguna::create([
        'nama_pengguna' => 'admintelkom',
        'email' => 'admin_test_suspend@kafe.com',
        'kata_sandi' => Hash::make('password123'),
        'peran' => 'Admin_Perusahaan',
        'status_akun' => 'Aktif',
    ]);

    ProfilPerusahaan::create([
        'id_pengguna' => $user->id_pengguna,
        'nama_perusahaan' => 'Telkom Cafe Indramayu',
        'alamat_perusahaan' => 'Jl. Merdeka No. 12',
        'dokumen_izin' => 'legalitas/telkom.pdf',
        'status_verifikasi' => 'Diterima',
    ]);

    return $user->id_pengguna;
});

// 3. Setup another test company admin for searching
$testAdminId2 = test("Setup test Company Admin for Search", function() {
    $oldUser = Pengguna::where('email', 'admin_test_search@kafe.com')->first();
    if ($oldUser) $oldUser->delete();

    $user = Pengguna::create([
        'nama_pengguna' => 'adminseafood',
        'email' => 'admin_test_search@kafe.com',
        'kata_sandi' => Hash::make('password123'),
        'peran' => 'Admin_Perusahaan',
        'status_akun' => 'Aktif',
    ]);

    ProfilPerusahaan::create([
        'id_pengguna' => $user->id_pengguna,
        'nama_perusahaan' => 'Seafood Cafe Jatibarang',
        'alamat_perusahaan' => 'Jl. Pantai No. 4',
        'dokumen_izin' => 'legalitas/seafood.pdf',
        'status_verifikasi' => 'Diterima',
    ]);

    return $user->id_pengguna;
});

// 4. Test GET /super-admin/akun-kafe (List all)
test("GET /super-admin/akun-kafe (List accounts)", function() use ($baseUrl, $token, $testAdminId) {
    $response = Http::withToken($token)->get("$baseUrl/super-admin/akun-kafe");
    if ($response->status() !== 200) throw new \Exception("Status " . $response->status() . ": " . $response->body());
    
    $list = $response->json('data');
    if (!is_array($list)) throw new \Exception("Expected array data");
    
    $found = false;
    foreach ($list as $item) {
        if ($item['id'] === $testAdminId) {
            $found = true;
            if ($item['nama_pengguna'] !== 'admintelkom') throw new \Exception("Username mismatch");
            if ($item['nama_perusahaan'] !== 'Telkom Cafe Indramayu') throw new \Exception("Company name mismatch");
            if ($item['status'] !== 'Aktif') throw new \Exception("Status mismatch, expected Aktif");
            break;
        }
    }
    
    if (!$found) throw new \Exception("Test admin ID $testAdminId not found in list");
});

// 5. Test Search by Username
test("GET /super-admin/akun-kafe?search=admintelkom (Search by Username)", function() use ($baseUrl, $token, $testAdminId) {
    $response = Http::withToken($token)->get("$baseUrl/super-admin/akun-kafe", [
        'search' => 'admintelkom'
    ]);
    if ($response->status() !== 200) throw new \Exception("Status " . $response->status() . ": " . $response->body());
    
    $list = $response->json('data');
    if (count($list) !== 1) throw new \Exception("Expected exactly 1 result, got " . count($list));
    if ($list[0]['id'] !== $testAdminId) throw new \Exception("ID mismatch, expected $testAdminId, got " . $list[0]['id']);
});

// 6. Test Search by Company Name
test("GET /super-admin/akun-kafe?search=Seafood (Search by Company Name)", function() use ($baseUrl, $token, $testAdminId2) {
    $response = Http::withToken($token)->get("$baseUrl/super-admin/akun-kafe", [
        'search' => 'Seafood'
    ]);
    if ($response->status() !== 200) throw new \Exception("Status " . $response->status() . ": " . $response->body());
    
    $list = $response->json('data');
    if (count($list) !== 1) throw new \Exception("Expected exactly 1 result, got " . count($list));
    if ($list[0]['id'] !== $testAdminId2) throw new \Exception("ID mismatch, expected $testAdminId2, got " . $list[0]['id']);
});

// 7. Test PUT /super-admin/akun-kafe/{id}/suspend
test("PUT /super-admin/akun-kafe/{id}/suspend (Suspend admin)", function() use ($baseUrl, $token, $testAdminId) {
    $response = Http::withToken($token)->put("$baseUrl/super-admin/akun-kafe/$testAdminId/suspend");
    if ($response->status() !== 200) throw new \Exception("Status " . $response->status() . ": " . $response->body());
    if ($response->json('status') !== 'success') throw new \Exception("Expected success response status");

    // Check directly in Database
    $admin = Pengguna::find($testAdminId);
    if ($admin->status_akun !== 'Diblokir') {
        throw new \Exception("Database status is not 'Diblokir', got: " . $admin->status_akun);
    }
});

// 8. Test suspended user login block (should return 403 Forbidden)
test("Login with Suspended Admin (Should be blocked)", function() use ($baseUrl) {
    $response = Http::post("$baseUrl/auth/login", [
        'email' => 'admin_test_suspend@kafe.com',
        'kata_sandi' => 'password123'
    ]);
    if ($response->status() !== 403) {
        throw new \Exception("Expected 403 Forbidden for suspended user, got: " . $response->status() . " with body: " . $response->body());
    }
});

// 9. Clean up
test("Cleanup test data", function() use ($testAdminId, $testAdminId2) {
    $u1 = Pengguna::find($testAdminId);
    if ($u1) {
        $p1 = $u1->profilPerusahaan;
        if ($p1) $p1->delete();
        $u1->delete();
    }
    
    $u2 = Pengguna::find($testAdminId2);
    if ($u2) {
        $p2 = $u2->profilPerusahaan;
        if ($p2) $p2->delete();
        $u2->delete();
    }
});

echo "\n--- ALL SUPER ADMIN KELOLA AKUN TESTS PASSED ---\n";
