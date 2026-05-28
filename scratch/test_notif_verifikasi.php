<?php
// ==========================================================
// TEST POIN 4: CompanyVerificationStatusChanged → notif Admin
// Verifikasi: notifikasi Diterima dan Ditolak punya URL benar
// ==========================================================

use App\Events\CompanyVerificationStatusChanged;
use App\Models\Pengguna;
use App\Models\ProfilPerusahaan;
use App\Models\Notifikasi;

$perusahaan = ProfilPerusahaan::with('pengguna')->first();

if (!$perusahaan || !$perusahaan->pengguna) {
    echo "❌ Perusahaan atau pengguna tidak ditemukan.\n";
    return;
}

$admin = $perusahaan->pengguna;
echo "Testing dengan Admin: {$admin->email} (ID={$admin->id_pengguna})\n\n";

// Hapus notif lama
Notifikasi::where('id_pengguna', $admin->id_pengguna)->delete();
echo "🧹 Notifikasi lama dihapus\n\n";

// --- TEST A: Status DITERIMA ---
echo "--- TEST A: Verifikasi DITERIMA ---\n";
event(new CompanyVerificationStatusChanged($perusahaan, 'Diterima'));

$notifDiterima = Notifikasi::where('id_pengguna', $admin->id_pengguna)->latest()->first();
if ($notifDiterima) {
    echo "✅ Notif Diterima terbuat:\n";
    echo "   Judul: {$notifDiterima->judul}\n";
    echo "   URL  : {$notifDiterima->url}\n";
    echo "   Match: " . ($notifDiterima->url === '/admin?action=go_profil' ? '✅ COCOK' : '❌ SALAH') . "\n";
} else {
    echo "❌ Notifikasi Diterima TIDAK terbuat\n";
}

Notifikasi::where('id_pengguna', $admin->id_pengguna)->delete();

// --- TEST B: Status DITOLAK ---
echo "\n--- TEST B: Verifikasi DITOLAK ---\n";
event(new CompanyVerificationStatusChanged(
    $perusahaan,
    'Ditolak',
    'Dokumen izin usaha tidak lengkap dan tidak sesuai format yang diminta.'
));

$notifDitolak = Notifikasi::where('id_pengguna', $admin->id_pengguna)->latest()->first();
if ($notifDitolak) {
    echo "✅ Notif Ditolak terbuat:\n";
    echo "   Judul: {$notifDitolak->judul}\n";
    echo "   URL  : {$notifDitolak->url}\n";
    echo "   Match: " . ($notifDitolak->url === '/admin?action=show_rejection_notice' ? '✅ COCOK' : '❌ SALAH') . "\n";
} else {
    echo "❌ Notifikasi Ditolak TIDAK terbuat\n";
}

echo "\n=== TEST SELESAI ===\n";
