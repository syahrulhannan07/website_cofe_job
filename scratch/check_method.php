<?php
use App\Models\Lamaran;
use App\Models\ProfilPelamar;

$p = ProfilPelamar::where('id_pengguna', 2)->first();
if ($p) {
    echo "Budi Santoso id_profil: " . $p->id_profil . "\n";
} else {
    echo "Budi Santoso profile not found.\n";
}

$l = Lamaran::first();
if ($l) {
    echo "Method logStatus exists in Lamaran model: " . (method_exists($l, 'logStatus') ? 'YES' : 'NO') . "\n";
} else {
    echo "No lamaran records found to test.\n";
}
