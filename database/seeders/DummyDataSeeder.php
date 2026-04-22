<?php

namespace Database\Seeders;

use App\Models\JenisDokumen;
use App\Models\Lamaran;
use App\Models\Lowongan;
use App\Models\LowonganDokumen;
use App\Models\Pengguna;
use App\Models\PertanyaanLowongan;
use App\Models\ProfilPelamar;
use App\Models\ProfilPerusahaan;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DummyDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Buat Jenis Dokumen Dasar jika belum ada
        $jenisDokumen = [
            ['nama_dokumen' => 'CV / Curriculum Vitae'],
            ['nama_dokumen' => 'Ijazah Terakhir'],
            ['nama_dokumen' => 'Sertifikat Keahlian'],
            ['nama_dokumen' => 'SKCK'],
            ['nama_dokumen' => 'Portofolio'],
        ];

        foreach ($jenisDokumen as $jd) {
            JenisDokumen::firstOrCreate(['nama_dokumen' => $jd['nama_dokumen']], $jd);
        }

        $allJenis = JenisDokumen::all();

        // 2. Buat Super Admin
        Pengguna::firstOrCreate(
            ['email' => 'superadmin@cofejob.id'],
            [
                'nama_pengguna' => 'Super Admin CofeJob',
                'kata_sandi'    => Hash::make('password'),
                'peran'         => 'Super_Admin',
                'status_akun'   => 'Aktif'
            ]
        );

        // 3. Buat Kafe di Indramayu
        $cafes = [
            [
                'nama' => 'Teras Kulon Indramayu',
                'email' => 'admin@teraskulon.com',
                'alamat' => 'Jl. Letnan Jendral S. Parman No.1, Margadadi, Kec. Indramayu, Kabupaten Indramayu, Jawa Barat 45211',
                'deskripsi' => 'Kafe kekinian dengan nuansa outdoor yang nyaman untuk nongkrong dan bekerja.'
            ],
            [
                'nama' => 'Kopi n Friends',
                'email' => 'hello@kopinfriends.id',
                'alamat' => 'Jl. Sudirman No.67, Lemahabang, Kec. Indramayu, Kabupaten Indramayu',
                'deskripsi' => 'Tempat berkumpulnya komunitas kopi terbaik di Indramayu.'
            ],
            [
                'nama' => 'Hopes Coffee',
                'email' => 'hopes@gmail.com',
                'alamat' => 'Jl. Di Panjaitan No.12, Karanganyar, Kec. Indramayu',
                'deskripsi' => 'Brewing hopes and great coffee every day.'
            ],
            [
                'nama' => 'About Coffee Indramayu',
                'email' => 'aboutcoffee@yahoo.com',
                'alamat' => 'Jl. Pasarean No.5, Karangmalang, Kec. Indramayu',
                'deskripsi' => 'It is all about the taste of local beans.'
            ],
        ];

        foreach ($cafes as $c) {
            $user = Pengguna::firstOrCreate(
                ['email' => $c['email']],
                [
                    'nama_pengguna' => 'Admin ' . $c['nama'],
                    'kata_sandi'    => Hash::make('password'),
                    'peran'         => 'Admin_Perusahaan',
                    'status_akun'   => 'Aktif'
                ]
            );

            $profil = ProfilPerusahaan::updateOrCreate(
                ['id_pengguna' => $user->id_pengguna],
                [
                    'nama_perusahaan'   => $c['nama'],
                    'alamat_perusahaan' => $c['alamat'],
                    'deskripsi'         => $c['deskripsi'],
                    'logo_perusahaan'   => 'dummy/logo_cafe.png', // Placeholder
                    'status_verifikasi' => 'Diterima'
                ]
            );

            // 4. Buat Lowongan untuk tiap Kafe
            $posisiList = ['Barista', 'Waiter/Waitress', 'Cashier', 'Cook Helper'];
            
            for ($i = 0; $i < 2; $i++) {
                $posisi = $posisiList[array_rand($posisiList)];
                $lowongan = Lowongan::create([
                    'id_perusahaan' => $profil->id_perusahaan,
                    'posisi'        => $posisi,
                    'deskripsi'     => "Dibutuhkan {$posisi} berpengalaman untuk bergabung dengan tim {$c['nama']}.",
                    'persyaratan'   => "- Pria/Wanita max 25 thn\n- Jujur dan disiplin\n- Bersedia shift",
                    'batas_awal'    => now()->format('Y-m-d'),
                    'batas_akhir'   => now()->addMonths(1)->format('Y-m-d'),
                    'status'        => 'Aktif',
                ]);

                // Tambah dokumen dibutuhkan
                LowonganDokumen::create([
                    'id_lowongan'      => $lowongan->id_lowongan,
                    'id_jenis_dokumen' => $allJenis->firstWhere('nama_dokumen', 'CV / Curriculum Vitae')->id_jenis_dokumen,
                    'wajib'            => true
                ]);

                // Tambah pertanyaan seleksi
                PertanyaanLowongan::create([
                    'id_lowongan'  => $lowongan->id_lowongan,
                    'pertanyaan'   => 'Apakah Anda memiliki pengalaman di posisi ini?',
                    'tipe_jawaban' => 'text'
                ]);
            }
        }

        // 5. Buat Pelamar
        $pelamars = [
            ['nama' => 'Budi Santoso', 'email' => 'budi@gmail.com'],
            ['nama' => 'Siti Aminah', 'email' => 'siti@gmail.com'],
            ['nama' => 'Agus Hermawan', 'email' => 'agus@gmail.com'],
            ['nama' => 'Dewi Lestari', 'email' => 'dewi@gmail.com'],
            ['nama' => 'Rian Hidayat', 'email' => 'rian@gmail.com'],
        ];

        foreach ($pelamars as $p) {
            $user = Pengguna::firstOrCreate(
                ['email' => $p['email']],
                [
                    'nama_pengguna' => $p['nama'],
                    'kata_sandi'    => Hash::make('password'),
                    'peran'         => 'Pelamar',
                    'status_akun'   => 'Aktif'
                ]
            );

            ProfilPelamar::updateOrCreate(
                ['id_pengguna' => $user->id_pengguna],
                [
                    'nama_lengkap' => $p['nama'],
                    'jenis_kelamin'=> rand(0, 1) ? 'Laki-laki' : 'Perempuan',
                    'nomor_telepon'=> '0812345678' . rand(10, 99),
                    'alamat'       => 'Kec. Sindang, Indramayu'
                ]
            );
        }

        // 6. Buat beberapa lamaran dummy
        $allLowongan = Lowongan::all();
        $allPelamar  = ProfilPelamar::all();

        foreach ($allPelamar as $pelamar) {
            // Tiap pelamar melamar ke 1 lowongan random
            $lowongan = $allLowongan->random();
            
            Lamaran::create([
                'id_lowongan' => $lowongan->id_lowongan,
                'id_profil'   => $pelamar->id_profil,
                'status'      => 'Diproses',
            ]);
        }
    }
}
