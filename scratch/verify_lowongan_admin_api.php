<?php

use App\Models\Pengguna;
use App\Models\ProfilPerusahaan;
use App\Models\JenisDokumen;
use App\Models\Lowongan;
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

// 1. Setup Data
test("Setup Document Types", function() {
    JenisDokumen::updateOrCreate(['nama_dokumen' => 'CV'], ['keterangan' => 'Curriculum Vitae']);
    JenisDokumen::updateOrCreate(['nama_dokumen' => 'Portofolio'], ['keterangan' => 'Hasil Karya']);
});

// 2. Login as Admin
$token = test("Login as Admin_Perusahaan", function() use ($baseUrl) {
    $admin = Pengguna::where('email', 'admin_test@kafe.com')->first();
    if (!$admin) throw new \Exception("Admin not found. Run previous test first.");
    
    $response = Http::post("$baseUrl/auth/login", [
        'email' => 'admin_test@kafe.com',
        'kata_sandi' => 'password123'
    ]);
    if ($response->failed()) throw new \Exception($response->body());
    return $response->json('data.token');
});

// 3. Test GET Jenis Dokumen
test("GET /jenis-dokumen", function() use ($baseUrl) {
    $response = Http::get("$baseUrl/jenis-dokumen");
    if ($response->status() !== 200) throw new \Exception("Status " . $response->status());
    if (count($response->json('data')) < 1) throw new \Exception("No data returned");
});

// 4. Test Create Lowongan (Draft)
$lowonganId = test("POST /admin/lowongan (Draft)", function() use ($baseUrl, $token) {
    $response = Http::withToken($token)->post("$baseUrl/admin/lowongan", [
        'posisi' => 'Barista Senior',
        'deskripsi' => 'Mampu membuat latte art',
        'persyaratan' => 'Pengalaman 2 tahun',
        'batas_awal' => date('Y-m-d'),
        'batas_akhir' => date('Y-m-d', strtotime('+1 month')),
        'status' => 'Draft',
        'dokumen_dibutuhkan' => [
            ['id_jenis_dokumen' => 1, 'wajib' => true],
            ['id_jenis_dokumen' => 2, 'wajib' => false],
        ],
        'pertanyaan' => [
            ['pertanyaan' => 'Punya sertifikat barista?', 'tipe_jawaban' => 'text'],
        ]
    ]);

    if ($response->status() !== 201) throw new \Exception("Status " . $response->status() . ": " . $response->body());
    return $response->json('data.id_lowongan');
});

// 5. Test GET Detail Lowongan
test("GET /admin/lowongan/{id}", function() use ($baseUrl, $token, $lowonganId) {
    $response = Http::withToken($token)->get("$baseUrl/admin/lowongan/$lowonganId");
    if ($response->status() !== 200) throw new \Exception("Status " . $response->status());
    if ($response->json('data.posisi') !== 'Barista Senior') throw new \Exception("Invalid data");
});

// 6. Test Publish Lowongan
test("POST /admin/lowongan/{id}/publish", function() use ($baseUrl, $token, $lowonganId) {
    $response = Http::withToken($token)->post("$baseUrl/admin/lowongan/$lowonganId/publish");
    if ($response->status() !== 200) throw new \Exception("Status " . $response->status() . ": " . $response->body());
    
    // Check if status is now Aktif
    $lowongan = Lowongan::find($lowonganId);
    if ($lowongan->status !== 'Aktif') throw new \Exception("Status not updated");
});

// 7. Test Delete (Should Success because no applicants)
test("DELETE /admin/lowongan/{id}", function() use ($baseUrl, $token, $lowonganId) {
    $response = Http::withToken($token)->delete("$baseUrl/admin/lowongan/$lowonganId");
    if ($response->status() !== 200) throw new \Exception("Status " . $response->status() . ": " . $response->body());
});

echo "\n--- VERIFIKASI SELESAI ---\n";
