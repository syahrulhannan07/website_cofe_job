<?php
use App\Models\ProfilPelamar;

$p = ProfilPelamar::where('id_pengguna', 2)->first();
if ($p) {
    $p->update([
        'nama_lengkap' => 'Budi Santoso',
        'nomor_telepon' => '08123456789'
    ]);
    echo "SUCCESS: Profile Budi Santoso updated.\n";
} else {
    echo "ERROR: Profil Pelamar for user 2 not found.\n";
}
