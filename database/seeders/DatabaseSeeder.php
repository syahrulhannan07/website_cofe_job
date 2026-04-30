<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;
use Faker\Factory as Faker;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create('id_ID');
        $this->command->info("Memulai seeding data...");

        DB::beginTransaction();
        try {
            // 1. Super Admin
            $this->seedSuperAdmins();

            // 2. Data Pendukung
            $idsJenisDokumen = $this->seedJenisDokumen();
            $kecamatanIndramayu = ['Jatibarang', 'Sindang', 'Haurgeulis', 'Karangampel', 'Pasekan', 'Indramayu', 'Lohbener', 'Widasari'];
            $posisiKopi = ['Barista', 'Waiter', 'Kasir', 'Cook', 'Menejer', 'Helper', 'Cleaning Service', 'Pencuci Piring', 'Admin Medsos'];

            // 3. Loop Perusahaan (25)
            for ($i = 1; $i <= 25; $i++) {
                $this->command->comment("Seeding Perusahaan $i/25...");
                
                $idUserPerusahaan = DB::table('pengguna')->insertGetId([
                    'nama_pengguna' => "Owner " . $faker->name,
                    'email' => "cafe" . $i . "@gmail.com",
                    'kata_sandi' => Hash::make('password'),
                    'peran' => 'Admin_Perusahaan',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                $namaCafeRealistis = [
                    'Kopi Cimanuk', 'Indramayu Coffee House', 'Griya Kopi', 'Pojok Kopi', 'Kopi Rakyat', 
                    'Kilang Kopi', 'Halaman Kopi', 'Ruang Temu Kopi', 'Kopi Mangga', 'Kedai Kopi Indah',
                    'Kopi Toean', 'Warung Kopi Tjilik', 'Kopi Janji Manis', 'Fore Coffee Indramayu', 
                    'Kopi Kenangan Masa', 'Anomali Coffee Indramayu', 'Djournal Coffee', 'Kopi Tuku',
                    'Kopi Lain Hati', 'Kopi Soe', 'Kopi Kenangan', 'Excelso Indramayu', 'Starbucks Indramayu',
                    'Maxx Coffee', 'The Coffee Bean'
                ];

                $kec = $faker->randomElement($kecamatanIndramayu);
                $idPerusahaan = DB::table('profil_perusahaan')->insertGetId([
                    'id_pengguna' => $idUserPerusahaan,
                    'nama_perusahaan' => $namaCafeRealistis[$i - 1] ?? ($faker->company . " Coffee"),
                    'alamat_perusahaan' => $faker->address . ", Kecamatan " . $kec . ", Indramayu",
                    'deskripsi' => "Sebuah kafe yang berlokasi di " . $kec . " dengan konsep industri kopi terbaik di Indramayu.",
                    'status_verifikasi' => $faker->randomElement(['Pending', 'Diterima', 'Ditolak']),
                    'dokumen_izin' => 'legalitas/dummy_izin_' . $i . '.pdf',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // Lowongan (4 per perusahaan)
                $lowongans = [];
                for ($j = 1; $j <= 4; $j++) {
                    $posisi = $faker->randomElement($posisiKopi);
                    $idLowongan = DB::table('lowongan')->insertGetId([
                        'id_perusahaan' => $idPerusahaan,
                        'posisi' => $posisi,
                        'deskripsi' => "Dicari {$posisi} profesional untuk cabang {$kec}.",
                        'persyaratan' => "1. Pengalaman 6 bulan\n2. Jujur\n3. Domisili Indramayu",
                        'batas_awal' => '2026-04-01',
                        'batas_akhir' => Carbon::create(2026, 4, 30)->addDays(rand(1, 31))->format('Y-m-d'),
                        'status' => 'Aktif',
                        'created_at' => '2026-04-01 08:00:00',
                        'updated_at' => now(),
                    ]);
                    $lowongans[] = $idLowongan;

                    // Dokumen & Pertanyaan
                    $this->seedLowonganDetails($idLowongan, $idsJenisDokumen, $faker, $posisi);
                }

                // Pelamar (50 per perusahaan)
                for ($p = 1; $p <= 50; $p++) {
                    $this->seedPelamar($i, $p, $lowongans, $kec, $faker);
                }
            }

            DB::commit();
            $this->command->info("Seeding SELESAI! Total 1.250 pelamar berhasil dibuat.");
        } catch (\Exception $e) {
            DB::rollBack();
            $this->command->error("Gagal di baris: " . $e->getLine());
            $this->command->error("Pesan: " . $e->getMessage());
        }
    }

    private function seedSuperAdmins() {
        $data = [
            ['nama_pengguna' => 'Ramadhan Sanjaya', 'email' => 'ramadhansanjaya18@gmail.com', 'kata_sandi' => Hash::make('cofe-job-sprama'), 'peran' => 'Super_Admin', 'created_at' => now()],
            ['nama_pengguna' => 'Syahrul Hannan', 'email' => 'syahrulhannan07@gmail.com', 'kata_sandi' => Hash::make('cofe-job-spsyahrul'), 'peran' => 'Super_Admin', 'created_at' => now()],
            ['nama_pengguna' => 'Junanti', 'email' => 'junanti@gmail.com', 'kata_sandi' => Hash::make('cofe-job-spanti'), 'peran' => 'Super_Admin', 'created_at' => now()],
        ];
        DB::table('pengguna')->insert($data);
    }

    private function seedJenisDokumen() {
        $docs = ['CV', 'KTP', 'SKCK', 'Sertifikat Barista', 'Pas Foto', 'Ijazah Terakhir', 'Surat Kesehatan'];
        foreach ($docs as $d) {
            DB::table('jenis_dokumen')->updateOrInsert(['nama_dokumen' => $d], ['created_at' => now()]);
        }
        return DB::table('jenis_dokumen')->pluck('id_jenis_dokumen')->toArray();
    }

    private function seedLowonganDetails($idL, $idsD, $faker, $pos) {
        // Dokumen
        $shuffled = $faker->shuffle($idsD);
        for ($d = 0; $d < rand(2, 4); $d++) {
            DB::table('lowongan_dokumen')->insert([
                'id_lowongan' => $idL,
                'id_jenis_dokumen' => $shuffled[$d],
                'wajib' => ($d < 2)
            ]);
        }
        // Pertanyaan
        DB::table('pertanyaan_lowongan')->insert([
            'id_lowongan' => $idL,
            'pertanyaan' => "Berapa lama pengalaman anda sebagai $pos?",
            'tipe_jawaban' => 'Teks',
            'created_at' => now()
        ]);
    }

    private function seedPelamar($i, $p, $lowongans, $kec, $faker) {
        $tgl = Carbon::create(2026, 3, 1)->addDays(rand(0, 60));
        $uid = DB::table('pengguna')->insertGetId([
            'nama_pengguna' => $faker->name,
            'email' => "pelamar_cafe{$i}_{$p}@gmail.com",
            'kata_sandi' => Hash::make('password'),
            'peran' => 'Pelamar',
            'created_at' => $tgl,
        ]);
        $pid = DB::table('profil_pelamar')->insertGetId([
            'id_pengguna' => $uid,
            'nama_lengkap' => $faker->name,
            'nomor_telepon' => "08" . $faker->numerify('##########'),
            'alamat' => $faker->address,
            'jenis_kelamin' => $faker->randomElement(['Laki-laki', 'Perempuan']),
            'created_at' => $tgl,
        ]);

        // Data Pendidikan Realistis Indramayu
        $dataPendidikan = [
            ['nama' => 'SMKN 1 Indramayu', 'tingkat' => 'SMK', 'jurusan' => ['Tata Boga', 'Perhotelan', 'Teknik Komputer & Jaringan', 'Rekayasa Perangkat Lunak']],
            ['nama' => 'SMKN 1 Balongan', 'tingkat' => 'SMK', 'jurusan' => ['Teknik Perminyakan & Gas', 'Teknik Otomotif', 'Teknik Pengelasan']],
            ['nama' => 'SMKN 1 Losarang', 'tingkat' => 'SMK', 'jurusan' => ['Kemaritiman', 'Teknika Kapal', 'Nautika Kapal']],
            ['nama' => 'SMAN 1 Indramayu', 'tingkat' => 'SMA', 'jurusan' => ['MIPA', 'IPS', 'Bahasa']],
            ['nama' => 'SMAN 1 Sindang', 'tingkat' => 'SMA', 'jurusan' => ['MIPA', 'IPS', 'Bahasa']],
            ['nama' => 'Universitas Wiralodra', 'tingkat' => 'S1', 'jurusan' => ['Manajemen', 'Akuntansi', 'Ilmu Hukum', 'Teknik Sipil', 'Teknik Mesin', 'Agroteknologi', 'Ilmu Keperawatan']],
            ['nama' => 'Politeknik Negeri Indramayu', 'tingkat' => 'D3', 'jurusan' => ['Teknik Mesin', 'Teknik Pendingin & Tata Udara', 'Teknik Informatika', 'Keperawatan']],
            ['nama' => 'Politeknik Negeri Indramayu', 'tingkat' => 'D4', 'jurusan' => ['Perancangan Manufaktur', 'Sistem Informasi Kota Cerdas', 'Rekayasa Perangkat Lunak']],
            ['nama' => 'STKIP NU Indramayu', 'tingkat' => 'S1', 'jurusan' => ['Pendidikan Bahasa Indonesia', 'Pendidikan Matematika', 'PGSD']],
            ['nama' => 'Politeknik Akamigas Balongan', 'tingkat' => 'D3', 'jurusan' => ['Teknik Perminyakan', 'Fire and Safety', 'Teknik Kimia']]
        ];

        $edu = $faker->randomElement($dataPendidikan);
        $jurusan = $faker->randomElement($edu['jurusan']);

        DB::table('pendidikan')->insert([
            'id_profil' => $pid,
            'institusi' => $edu['nama'],
            'jurusan' => $jurusan,
            'tingkat' => $edu['tingkat'],
            'tahun_mulai' => '2020-07-01',
            'tahun_selesai' => '2023-06-30',
            'created_at' => $tgl,
        ]);

        // Data Skill Realistis Industri Kopi
        $daftarSkill = [
            'Espresso Calibration', 'Latte Art', 'Manual Brewing (V60/Aeropress)', 'Grinder Adjustment',
            'Cupping Coffee', 'Roasting Basics', 'Milk Steaming', 'Customer Hospitality',
            'POS System/Kasir', 'Inventory Management', 'Opening/Closing Procedures',
            'Food Safety & Hygiene', 'Upselling Techniques', 'Basic Pastry/Plating',
            'Teamwork & Collaboration', 'Problem Solving', 'Public Speaking/Communication'
        ];

        $selectedSkills = $faker->randomElements($daftarSkill, rand(2, 3));
        foreach ($selectedSkills as $skName) {
            DB::table('skill')->insert([
                'id_profil' => $pid,
                'nama_skill' => $skName,
                'deskripsi' => 'Memiliki kemampuan ' . $skName . ' yang baik untuk menunjang operasional kafe.',
                'created_at' => $tgl,
            ]);
        }
        
        $targetL = $faker->randomElement($lowongans);
        $status = $faker->randomElement(['Diproses', 'Wawancara', 'Diterima', 'Ditolak']);
        $lamaranId = DB::table('lamaran')->insertGetId([
            'id_lowongan' => $targetL,
            'id_profil' => $pid,
            'status' => $status,
            'created_at' => $tgl,
        ]);

        // Dokumen Lamaran
        DB::table('lamaran_dokumen')->insert([
            'id_lamaran' => $lamaranId,
            'id_jenis_dokumen' => 1, // CV
            'lokasi_file' => 'lamaran/dummy_cv.pdf',
            'created_at' => $tgl,
        ]);
    }
}
