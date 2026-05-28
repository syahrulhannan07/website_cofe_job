<?php
// ==========================================================
// TEST POIN 2: NewCompanyRegisteredNotification → notif Super Admin
// Verifikasi: notifikasi pendaftaran kafe punya URL benar
// ==========================================================

use App\Notifications\NewCompanyRegisteredNotification;
use App\Models\Pengguna;
use App\Models\ProfilPerusahaan;
use App\Models\Notifikasi;

$superAdmin = Pengguna::where('peran', 'Super_Admin')->first();
$perusahaan = ProfilPerusahaan::first();

if (!$superAdmin || !$perusahaan) {
    echo "❌ Super Admin atau Perusahaan tidak ditemukan.\n";
    return;
}

echo "Testing dengan Super Admin: {$superAdmin->email} (ID={$superAdmin->id_pengguna})\n\n";

// Hapus notif lama
Notifikasi::where('id_pengguna', $superAdmin->id_pengguna)->delete();
echo "🧹 Notifikasi lama dihapus\n\n";

// Kirim notifikasi
$superAdmin->notify(new NewCompanyRegisteredNotification($perusahaan));

$notif = Notifikasi::where('id_pengguna', $superAdmin->id_pengguna)->latest()->first();
if ($notif) {
    echo "✅ Notif Registrasi Kafe terbuat:\n";
    echo "   Judul: {$notif->judul}\n";
    echo "   URL  : {$notif->url}\n";
    $expectedUrl = "/super-admin/verifikasi?open_kafe_id={$perusahaan->id_perusahaan}";
    echo "   Match: " . ($notif->url === $expectedUrl ? '✅ COCOK' : '❌ SALAH') . "\n";
} else {
    echo "❌ Notifikasi Registrasi Kafe TIDAK terbuat\n";
}

echo "\n=== TEST SELESAI ===\n";
