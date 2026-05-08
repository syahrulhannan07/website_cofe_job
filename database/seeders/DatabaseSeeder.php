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
                    'status_akun' => 'Aktif', // ✅ FIX: kolom status_akun wajib diisi
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
                // ✅ FIX: Tentukan status verifikasi dengan distribusi yang benar
                // 60% Diterima, 25% Pending, 15% Ditolak
                $statusRand = rand(1, 100);
                $statusVerif = match(true) {
                    $statusRand <= 60 => 'Diterima',
                    $statusRand <= 85 => 'Pending',
                    default           => 'Ditolak',
                };

                // ✅ FIX: Isi alasan_penolakan jika status Ditolak
                $alasanPenolakanPool = [
                    'Dokumen izin usaha yang diunggah tidak terbaca dengan jelas.',
                    'Nama perusahaan pada SIUP tidak sesuai dengan nama yang didaftarkan.',
                    'Alamat perusahaan tidak dapat diverifikasi melalui data administrasi daerah.',
                    'Dokumen kadaluarsa lebih dari 1 tahun sejak tanggal pengajuan.',
                    'Bidang usaha yang dicantumkan tidak termasuk dalam kategori F&B yang diizinkan.',
                ];
                $alasanPenolakan = ($statusVerif === 'Ditolak')
                    ? $alasanPenolakanPool[array_rand($alasanPenolakanPool)]
                    : null;

                $idPerusahaan = DB::table('profil_perusahaan')->insertGetId([
                    'id_pengguna'       => $idUserPerusahaan,
                    'nama_perusahaan'   => $namaCafeRealistis[$i - 1] ?? ($faker->company . " Coffee"),
                    'alamat_perusahaan' => 'Jl. Raya ' . $kec . ' No. ' . rand(1, 200) . ', Kecamatan ' . $kec . ', Kab. Indramayu',
                    'kecamatan'         => $kec, // ✅ Tambahkan kolom kecamatan
                    'deskripsi'         => 'Sebuah kafe yang berlokasi strategis di ' . $kec . ' dengan konsep modern dan suasana nyaman. Kami berkomitmen menyajikan kopi berkualitas tinggi kepada masyarakat Indramayu.',
                    'status_verifikasi' => $statusVerif,
                    'alasan_penolakan'  => $alasanPenolakan, // ✅ FIX: wajib diisi jika Ditolak
                    'dokumen_izin'      => 'legalitas/dummy_izin_' . $i . '.pdf',
                    'created_at'        => now(),
                    'updated_at'        => now(),
                ]);

                // Lowongan (4 per perusahaan)
                $lowongans = [];
                for ($j = 1; $j <= 4; $j++) {
                    $posisi = $faker->randomElement($posisiKopi);

                    // ✅ FIX: Enum status lowongan yang benar setelah migration update
                    // ['Draft', 'Active', 'Closed'] — bukan 'Aktif'
                    $statusLowongan = $faker->randomElement(['Active', 'Active', 'Active', 'Closed', 'Draft']);

                    // ✅ FIX: Kolom gaji sudah diubah ke string 'gaji' (bukan gaji_min/gaji_max)
                    $gajiMin = rand(2, 4) * 500000;
                    $gajiMax = $gajiMin + rand(1, 3) * 500000;
                    $gajiStr = 'Rp ' . number_format($gajiMin, 0, ',', '.') . ' – Rp ' . number_format($gajiMax, 0, ',', '.');

                    $idLowongan = DB::table('lowongan')->insertGetId([
                        'id_perusahaan' => $idPerusahaan,
                        'posisi'        => $posisi,
                        'deskripsi'     => "Dicari {$posisi} profesional dan berpengalaman untuk bergabung bersama tim kami di cabang {$kec}. Kandidat yang kami cari adalah sosok yang ramah, jujur, dan berkomitmen tinggi.",
                        'persyaratan'   => "1. Pengalaman minimal 6 bulan di bidang F&B\n2. Jujur dan bertanggung jawab\n3. Domisili Kabupaten Indramayu atau bersedia pindah\n4. Mampu bekerja dalam tim dan di bawah tekanan",
                        'lokasi'        => 'Kecamatan ' . $kec . ', Kabupaten Indramayu',
                        'gaji'          => $gajiStr, // ✅ FIX: kolom 'gaji' string
                        'batas_awal'    => '2026-04-01',
                        'batas_akhir'   => Carbon::create(2026, 4, 30)->addDays(rand(1, 60))->format('Y-m-d'),
                        'status'        => $statusLowongan,
                        'created_at'    => '2026-04-01 08:00:00',
                        'updated_at'    => now(),
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
            $this->command->info("Seeding data utama SELESAI! Total 1.250 pelamar berhasil dibuat.");

            // ✅ Jalankan seeder tambahan setelah data utama selesai
            $this->command->info('Menjalankan JawabanLamaranSeeder...');
            $this->call(JawabanLamaranSeeder::class);

            $this->command->info('Menjalankan WawancaraSeeder...');
            $this->call(WawancaraSeeder::class);

        } catch (\Exception $e) {
            DB::rollBack();
            $this->command->error("Gagal di baris: " . $e->getLine());
            $this->command->error("Pesan: " . $e->getMessage());
            throw $e; // re-throw agar proses berhenti dengan jelas
        }
    }

    private function seedSuperAdmins() {
        $data = [
            // ✅ FIX: Tambahkan status_akun untuk super admin
            ['nama_pengguna' => 'Ramadhan Sanjaya', 'email' => 'ramadhansanjaya18@gmail.com', 'kata_sandi' => Hash::make('cofe-job-sprama'),    'peran' => 'Super_Admin', 'status_akun' => 'Aktif', 'created_at' => now(), 'updated_at' => now()],
            ['nama_pengguna' => 'Syahrul Hannan',   'email' => 'syahrulhannan07@gmail.com',   'kata_sandi' => Hash::make('cofe-job-spsyahrul'), 'peran' => 'Super_Admin', 'status_akun' => 'Aktif', 'created_at' => now(), 'updated_at' => now()],
            ['nama_pengguna' => 'Junanti',           'email' => 'junanti@gmail.com',           'kata_sandi' => Hash::make('cofe-job-spanti'),    'peran' => 'Super_Admin', 'status_akun' => 'Aktif', 'created_at' => now(), 'updated_at' => now()],
        ];
        // Idempotent: hanya insert jika belum ada
        foreach ($data as $admin) {
            DB::table('pengguna')->updateOrInsert(['email' => $admin['email']], $admin);
        }
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

        // Pool Pertanyaan
        $pertanyaanPool = [
            "Apa yang membuat Anda tertarik bekerja sebagai $pos di industri coffee shop?",
            "Bagaimana cara Anda menjaga semangat kerja saat sedang sibuk di outlet?",
            "Apakah Anda memiliki pengalaman mengoperasikan mesin kopi espresso atau peralatan terkait?",
            "Bagaimana cara Anda menghadapi pelanggan yang memberikan komplain atau sedang marah?",
            "Ceritakan pengalaman Anda dalam menjaga kebersihan area kerja di tempat sebelumnya.",
            "Berapa ekspektasi gaji Anda per bulan untuk posisi $pos?",
            "Kapan Anda bisa mulai bekerja jika diterima oleh tim kami?",
            "Apakah Anda bersedia bekerja dalam sistem shift (pagi/siang/malam)?",
            "Apa yang Anda lakukan ketika ada menu yang habis dan pelanggan sudah memesan?",
            "Bagaimana cara Anda menangani antrian panjang pelanggan saat peak hour?"
        ];

        // Ambil 3 pertanyaan acak
        $selectedQuestions = $faker->randomElements($pertanyaanPool, 3);

        foreach ($selectedQuestions as $pertanyaan) {
            DB::table('pertanyaan_lowongan')->insert([
                'id_lowongan' => $idL,
                'pertanyaan' => $pertanyaan,
                'tipe_jawaban' => 'Teks',
                'created_at' => now()
            ]);
        }
    }

    private function seedPelamar($i, $p, $lowongans, $kec, $faker) {
        $tgl = Carbon::create(2026, 3, 1)->addDays(rand(0, 60));
        
        // Jenis Kelamin & Nama
        $isMale = (rand(0, 1) === 0);
        $namaLaki = ['Rizky Maulana', 'Dani Saputra', 'Bayu Aji', 'Fajar Nugroho', 'Galih Prasetya', 'Hendra Kusuma', 'Ilham Ramadhan', 'Joko Susanto', 'Kevin Pratama', 'Lutfi Hakim', 'Muhamad Fauzan', 'Nanda Putra', 'Ogi Firmansyah', 'Pandu Wicaksono', 'Rafi Ahmad Setiawan', 'Sandi Kurniawan', 'Teguh Santoso', 'Umar Habibi', 'Vicky Permana', 'Wahyu Hidayat'];
        $namaPerempuan = ['Siti Nurhaliza', 'Dewi Rahayu', 'Fitri Handayani', 'Gita Safitri', 'Hana Permata', 'Indah Lestari', 'Jihan Aulia', 'Kartini Wulandari', 'Laila Nur Azizah', 'Mega Puspita', 'Nisa Fadhilah', 'Okta Sari', 'Putri Anggraini', 'Rina Febriani', 'Santi Rahmawati', 'Tika Aprilia', 'Ulfa Novianti', 'Vina Ramadhani', 'Wulan Maharani', 'Yuni Astuti'];
        
        $namaLengkap = $isMale ? $faker->randomElement($namaLaki) : $faker->randomElement($namaPerempuan);
        $namaLengkap .= " " . $faker->lastName;

        $uid = DB::table('pengguna')->insertGetId([
            'nama_pengguna' => strtolower(str_replace(' ', '', $namaLengkap)) . rand(10, 99),
            'email'         => "pelamar_cafe{$i}_{$p}@gmail.com",
            'kata_sandi'    => Hash::make('password'),
            'peran'         => 'Pelamar',
            'status_akun'   => 'Aktif',
            'created_at'    => $tgl,
            'updated_at'    => $tgl,
        ]);

        // Alamat Indramayu
        $alamatPool = [
            ['desa' => 'Karangsong', 'kecamatan' => 'Indramayu'],
            ['desa' => 'Margadadi', 'kecamatan' => 'Indramayu'],
            ['desa' => 'Paoman', 'kecamatan' => 'Indramayu'],
            ['desa' => 'Singaraja', 'kecamatan' => 'Indramayu'],
            ['desa' => 'Telukagung', 'kecamatan' => 'Indramayu'],
            ['desa' => 'Jatibarang', 'kecamatan' => 'Jatibarang'],
            ['desa' => 'Pilangsari', 'kecamatan' => 'Jatibarang'],
            ['desa' => 'Haurgeulis', 'kecamatan' => 'Haurgeulis'],
            ['desa' => 'Karangampel', 'kecamatan' => 'Karangampel'],
            ['desa' => 'Arahan Kidul', 'kecamatan' => 'Arahan'],
            ['desa' => 'Widasari', 'kecamatan' => 'Widasari'],
            ['desa' => 'Sliyeg', 'kecamatan' => 'Sliyeg'],
            ['desa' => 'Losarang', 'kecamatan' => 'Losarang'],
            ['desa' => 'Patrol', 'kecamatan' => 'Patrol'],
        ];
        $randAlamat = $faker->randomElement($alamatPool);
        $alamatLengkap = "Jl. " . $faker->streetName . " No. " . rand(1, 150) . ", Desa " . $randAlamat['desa'] . ", Kec. " . $randAlamat['kecamatan'] . ", Kab. Indramayu";

        // Tanggal Lahir Gen Z (18-26 tahun)
        $tglLahir = Carbon::create(rand(1999, 2006), rand(1, 12), rand(1, 28))->format('Y-m-d');

        // Tentang Saya - Naratif
        $tentangSayaPool = [
            "Saya adalah pribadi yang energik, komunikatif, dan memiliki passion yang tulus terhadap dunia kopi dan industri F&B. Sejak duduk di bangku SMA, saya sudah terbiasa membantu usaha kedai minuman milik keluarga di Jatibarang, di mana saya belajar tentang pelayanan pelanggan secara langsung. Saya percaya bahwa secangkir kopi yang baik bukan hanya soal rasa, tetapi juga soal pengalaman yang diberikan kepada pelanggan.",
            "Sebagai lulusan Tata Boga, saya memiliki ketertarikan mendalam dalam seni pembuatan minuman dan hospitality. Saya adalah pekerja keras yang teliti dan selalu ingin belajar hal-hal baru, terutama dalam teknik manual brew dan latte art. Saya berdomisili di Indramayu dan siap memberikan kontribusi terbaik bagi kemajuan outlet Anda melalui dedikasi dan kejujuran.",
            "Saya memiliki pengalaman 1 tahun sebagai waiter di salah satu cafe di Cirebon dan kini ingin mengembangkan karier saya di tanah kelahiran saya, Indramayu. Saya memiliki kemampuan komunikasi yang baik, mampu bekerja di bawah tekanan saat jam sibuk, dan sangat menjaga kebersihan area kerja. Bagi saya, kepuasan pelanggan adalah prioritas utama dalam bekerja.",
            "Saya adalah individu yang disiplin dan memiliki etos kerja tinggi. Saya sangat tertarik bergabung dengan industri coffee shop karena lingkungan kerjanya yang dinamis. Saya mampu beradaptasi dengan cepat dalam tim, memiliki keterampilan dasar dalam melayani pelanggan, dan bersedia bekerja dengan sistem shift demi mendukung operasional perusahaan.",
            "Kecintaan saya pada dunia kopi bermula dari hobi yang kini ingin saya jadikan profesionalitas. Saya memiliki kepribadian yang ramah dan mudah bergaul, yang saya rasa sangat penting dalam peran customer service atau barista. Saya berkomitmen untuk terus meningkatkan skill saya dan memberikan pelayanan yang ramah serta efisien bagi setiap tamu yang datang."
        ];

        $pid = DB::table('profil_pelamar')->insertGetId([
            'id_pengguna'   => $uid,
            'nama_lengkap'  => $namaLengkap,
            'tentang_saya'  => $faker->randomElement($tentangSayaPool),
            'tanggal_lahir' => $tglLahir,
            'nomor_telepon' => "08" . rand(11, 99) . rand(1000, 9999) . rand(1000, 9999),
            'alamat'        => $alamatLengkap,
            'jenis_kelamin' => $isMale ? 'Laki-laki' : 'Perempuan',
            'created_at'    => $tgl,
            'updated_at'    => $tgl,
        ]);

        // Data Pendidikan Realistis Indramayu
        $dataPendidikan = [
            ['nama' => 'SMKN 1 Indramayu', 'tingkat' => 'SMK', 'jurusan' => ['Tata Boga', 'Perhotelan', 'Teknik Komputer & Jaringan']],
            ['nama' => 'SMAN 1 Indramayu', 'tingkat' => 'SMA', 'jurusan' => ['MIPA', 'IPS']],
            ['nama' => 'Universitas Wiralodra', 'tingkat' => 'S1', 'jurusan' => ['Manajemen', 'Akuntansi', 'Ilmu Hukum']],
            ['nama' => 'Politeknik Negeri Indramayu', 'tingkat' => 'D3', 'jurusan' => ['Teknik Mesin', 'Teknik Informatika']],
        ];

        $edu = $faker->randomElement($dataPendidikan);
        $jurusan = $faker->randomElement($edu['jurusan']);

        DB::table('pendidikan')->insert([
            'id_profil'     => $pid,
            'institusi'     => $edu['nama'],
            'jurusan'       => $jurusan,
            'tingkat'       => $edu['tingkat'],
            'tahun_mulai'   => '2020-07-01',
            'tahun_selesai' => '2023-06-30',
            'created_at'    => $tgl,
        ]);

        // Data Skill Realistis Industri Kopi
        $daftarSkill = [
            'Espresso Calibration', 'Latte Art', 'Manual Brewing (V60)', 'Customer Hospitality',
            'POS System/Kasir', 'Inventory Management', 'Milk Steaming'
        ];

        $selectedSkills = $faker->randomElements($daftarSkill, rand(2, 3));
        foreach ($selectedSkills as $skName) {
            DB::table('skill')->insert([
                'id_profil'  => $pid,
                'nama_skill' => $skName,
                'deskripsi'  => 'Memiliki kemampuan ' . $skName . ' yang baik.',
                'created_at' => $tgl,
            ]);
        }
        
        $targetL = $faker->randomElement($lowongans);
        $status = $faker->randomElement(['Diproses', 'Wawancara', 'Diterima', 'Ditolak']);
        $lamaranId = DB::table('lamaran')->insertGetId([
            'id_lowongan' => $targetL,
            'id_profil'   => $pid,
            'status'      => $status,
            'created_at'  => $tgl,
            'updated_at'  => $tgl,
        ]);

        // Dokumen Lamaran
        DB::table('lamaran_dokumen')->insert([
            'id_lamaran'       => $lamaranId,
            'id_jenis_dokumen' => 1, // CV
            'lokasi_file'      => 'lamaran/dummy_cv.pdf',
            'created_at'       => $tgl,
        ]);
    }
}
