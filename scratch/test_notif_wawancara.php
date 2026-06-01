<?php
// =====================================================
// TEST POIN 9: WawancaraScheduled → notif ke Pelamar
// Verifikasi: notifikasi dibuat dengan url yang benar
// =====================================================

use App\Events\WawancaraScheduled;
use App\Models\Pengguna;
use App\Models\Wawancara;
use App\Models\Notifikasi;

$pelamar   = Pengguna::where('peran', 'Pelamar')->first();
$wawancara = Wawancara::first();

if (!$pelamar || !$wawancara) {
    echo "❌ Data pelamar atau wawancara tidak ditemukan.\n";
    return;
}

// Hapus notif lama untuk test bersih
Notifikasi::where('id_pengguna', $pelamar->id_pengguna)->delete();
echo "🧹 Notifikasi lama dihapus\n";

// Fire event (ShouldQueue + sync driver = langsung diproses)
event(new WawancaraScheduled(
    $wawancara,
    'Kopi Cimanuk',
    'Barista',
    $pelamar->id_pengguna
));

// Verifikasi hasil
$notif = Notifikasi::where('id_pengguna', $pelamar->id_pengguna)
                   ->latest()
                   ->first();

if ($notif) {
    echo "✅ NOTIFIKASI BERHASIL DIBUAT:\n";
    echo "   Judul : {$notif->judul}\n";
    echo "   URL   : {$notif->url}\n";
    echo "   Dibaca: " . ($notif->dibaca ? 'Ya' : 'Tidak') . "\n";

    // Validasi URL format yang benar
    $expectedPattern = "/status-lamaran/{$wawancara->id_lamaran}?action=open_modal_wawancara";
    echo "\n   Expected URL : {$expectedPattern}\n";
    echo "   URL Match    : " . ($notif->url === $expectedPattern ? "✅ COCOK" : "❌ TIDAK COCOK") . "\n";
} else {
    echo "❌ NOTIFIKASI TIDAK TERBUAT — cek QUEUE_CONNECTION di .env\n";
    echo "   Jika menggunakan QUEUE_CONNECTION=sync, harusnya langsung terbuat.\n";
}
