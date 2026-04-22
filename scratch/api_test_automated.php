<?php

/**
 * Automated API Test Script for CofeJob
 * Run with: php scratch/api_test_automated.php
 */

$baseUrl = "http://127.0.0.1:8000/api/v1";

function request($method, $path, $body = null, $token = null) {
    global $baseUrl;
    $ch = curl_init($baseUrl . $path);
    
    $headers = ['Content-Type: application/json', 'Accept: application/json'];
    if ($token) $headers[] = "Authorization: Bearer $token";
    
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    
    if ($body) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    return [
        'code' => $httpCode,
        'data' => json_decode($response, true)
    ];
}

function logTest($name, $result) {
    $status = $result['code'] >= 200 && $result['code'] < 300 ? "\e[32m[PASSED]\e[0m" : "\e[31m[FAILED]\e[0m";
    echo "$status $name (HTTP {$result['code']})\n";
    if ($result['code'] >= 400) {
        echo "   Error: " . ($result['data']['message'] ?? 'Unknown Error') . "\n";
    }
}

echo "--- STARTING AUTOMATED API TEST ---\n\n";

// --- 1. AUTH TEST (Login as Super Admin) ---
echo "Testing Authentication...\n";
$login = request('POST', '/auth/login', [
    'email' => 'superadmin@cofejob.id',
    'kata_sandi' => 'password'
]);
logTest("Login Super Admin", $login);
$superToken = $login['data']['data']['token'] ?? null;

if ($superToken) {
    $me = request('GET', '/auth/me', null, $superToken);
    logTest("Get Me (Profile)", $me);
}

// --- 2. SUPER ADMIN TEST ---
echo "\nTesting Super Admin Features...\n";
logTest("Get Dashboard Stats", request('GET', '/superadmin/dashboard', null, $superToken));
logTest("Get List Verifikasi", request('GET', '/superadmin/verifikasi', null, $superToken));
logTest("Get List Admin Kafe", request('GET', '/superadmin/admin', null, $superToken));

// --- 3. ADMIN KAFE TEST ---
echo "\nTesting Admin Kafe Features...\n";
$loginKafe = request('POST', '/auth/login', [
    'email' => 'admin@teraskulon.com',
    'kata_sandi' => 'password'
]);
$kafeToken = $loginKafe['data']['data']['token'] ?? null;

if ($kafeToken) {
    $lowongan = request('GET', '/admin/lowongan', null, $kafeToken);
    logTest("List Lowongan Kafe", $lowongan);
    
    if (!empty($lowongan['data']['data'])) {
        $idLowongan = $lowongan['data']['data'][0]['id'];
        $pelamar = request('GET', "/admin/lowongan/$idLowongan/pelamar", null, $kafeToken);
        logTest("List Pelamar per Lowongan", $pelamar);
        
        if (!empty($pelamar['data']['data'])) {
            $idLamaran = $pelamar['data']['data'][0]['id_lamaran'];
            logTest("Get Detail Lamaran", request('GET', "/admin/lamaran/$idLamaran", null, $kafeToken));
        }
    }
}

// --- 4. NOTIFIKASI TEST (Login as Pelamar) ---
echo "\nTesting Pelamar Features...\n";
$loginPelamar = request('POST', '/auth/login', [
    'email' => 'budi@gmail.com',
    'kata_sandi' => 'password'
]);
$pelamarToken = $loginPelamar['data']['data']['token'] ?? null;

if ($pelamarToken) {
    logTest("Get List Notifikasi", request('GET', '/notifikasi', null, $pelamarToken));
}

// --- 5. LOGOUT TEST ---
echo "\nTesting Logout...\n";
logTest("Logout Super Admin", request('POST', '/auth/logout', null, $superToken));

echo "\n--- TEST COMPLETED ---\n";
