<?php
use App\Models\JenisDokumen;
use App\Models\Lowongan;

$cv = JenisDokumen::updateOrCreate(['nama_dokumen' => 'CV']);
$portfolio = JenisDokumen::updateOrCreate(['nama_dokumen' => 'Portofolio']);

$l1 = Lowongan::updateOrCreate(
    ['posisi' => 'Barista', 'id_perusahaan' => 1],
    [
        'deskripsi' => 'Dibutuhkan barista mahir membuat latte art.',
        'persyaratan' => 'Pria/Wanita, Max 25 thn.',
        'batas_awal' => now()->subDays(1)->toDateString(),
        'batas_akhir' => now()->addDays(7)->toDateString(),
        'status' => 'Aktif'
    ]
);

$l1->dokumenDibutuhkan()->updateOrCreate(['id_jenis_dokumen' => $cv->id_jenis_dokumen], ['wajib' => true]);
$l1->dokumenDibutuhkan()->updateOrCreate(['id_jenis_dokumen' => $portfolio->id_jenis_dokumen], ['wajib' => false]);

$l1->pertanyaanSeleksi()->updateOrCreate(['pertanyaan' => 'Pengalaman kerja sebelumnya?'], ['tipe_jawaban' => 'Text']);

$l2 = Lowongan::updateOrCreate(
    ['posisi' => 'Admin Expired', 'id_perusahaan' => 1],
    [
        'deskripsi' => 'Lowongan yang sudah expired.',
        'persyaratan' => 'Admin handal.',
        'batas_awal' => now()->subDays(30)->toDateString(),
        'batas_akhir' => now()->subDays(1)->toDateString(),
        'status' => 'Aktif'
    ]
);

echo "SUCCESS: lowongan_active_id=" . $l1->id_lowongan . ", lowongan_expired_id=" . $l2->id_lowongan . "\n";
