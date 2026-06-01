<?php
// Script testing: cek data tersedia untuk testing

use App\Models\Pengguna;
use App\Models\Lamaran;
use App\Models\Wawancara;
use App\Models\ProfilPerusahaan;

echo "=== DATA TERSEDIA UNTUK TESTING ===\n\n";

// 1. Pelamar
$pelamar = Pengguna::where('peran', 'Pelamar')->first();
echo "PELAMAR: " . ($pelamar ? "ID={$pelamar->id_pengguna} | {$pelamar->email}" : "TIDAK ADA") . "\n";

// 2. Admin Perusahaan
$admin = Pengguna::where('peran', 'Admin_Perusahaan')->first();
echo "ADMIN  : " . ($admin ? "ID={$admin->id_pengguna} | {$admin->email}" : "TIDAK ADA") . "\n";

// 3. Super Admin
$superAdmin = Pengguna::where('peran', 'Super_Admin')->first();
echo "S.ADMIN: " . ($superAdmin ? "ID={$superAdmin->id_pengguna} | {$superAdmin->email}" : "TIDAK ADA") . "\n";

// 4. Lamaran aktif
$lamaran = Lamaran::with(['profil.pengguna', 'lowongan'])->first();
echo "LAMARAN: " . ($lamaran ? "ID={$lamaran->id_lamaran} | status={$lamaran->status}" : "TIDAK ADA") . "\n";

// 5. Wawancara
$wawancara = Wawancara::with('lamaran')->first();
echo "WAWANC.: " . ($wawancara ? "ID={$wawancara->id_wawancara} | id_lamaran={$wawancara->id_lamaran}" : "TIDAK ADA") . "\n";

// 6. Perusahaan
$perusahaan = ProfilPerusahaan::with('pengguna')->first();
echo "PERUS. : " . ($perusahaan ? "ID={$perusahaan->id_perusahaan} | {$perusahaan->nama_perusahaan}" : "TIDAK ADA") . "\n";

echo "\n=== SELESAI ===\n";
