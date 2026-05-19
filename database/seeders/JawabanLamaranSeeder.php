<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class JawabanLamaranSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Memulai JawabanLamaranSeeder...');

        // -------------------------------------------------------
        // Ambil semua lamaran yang ada
        // Setiap lamaran perlu diisi jawaban untuk setiap pertanyaan
        // yang tersedia pada lowongan yang bersangkutan
        // -------------------------------------------------------
        $lamaran = DB::table('lamaran')->get();

        if ($lamaran->isEmpty()) {
            $this->command->warn('Tidak ada lamaran. JawabanLamaranSeeder dilewati.');
            return;
        }

        $this->command->info("Ditemukan {$lamaran->count()} lamaran. Memproses jawaban...");

        // -------------------------------------------------------
        // Pool jawaban realistis per kategori pertanyaan
        // Semua tipe jawaban = 'Teks' sesuai instruksi
        // -------------------------------------------------------
        $jawabanMotivasiPool = [
            'Saya tertarik bekerja di industri coffee shop karena sejak kecil saya sudah akrab dengan budaya ngopi keluarga. Saya ingin berkontribusi memberikan pengalaman terbaik kepada pelanggan.',
            'Passion saya ada di dunia pelayanan dan kopi. Saya melihat coffee shop sebagai tempat di mana kreativitas dan hospitality berpadu, dan saya ingin menjadi bagian dari itu.',
            'Industri F&B khususnya coffee shop terus berkembang pesat. Saya ingin mengembangkan karier di bidang ini karena potensinya besar dan saya memiliki ketertarikan yang tulus.',
            'Saya memiliki pengalaman sebelumnya bekerja di cafe dan merasakan kepuasan saat pelanggan menikmati minuman yang saya buat. Hal itulah yang mendorong saya untuk terus berkarya di industri ini.',
            'Coffee shop adalah ruang sosial yang dinamis. Saya tertarik karena lingkungan kerjanya yang aktif dan kesempatan untuk terus belajar tentang dunia kopi setiap harinya.',
        ];

        $jawabanOperasionalPool = [
            'Ya, saya memiliki pengalaman mengoperasikan mesin espresso selama bekerja di Kopi Kenangan selama 8 bulan. Saya terbiasa dengan proses grind, tamp, dan ekstraksi.',
            'Saya pernah mengikuti pelatihan singkat barista selama 3 hari dan belajar dasar-dasar penggunaan mesin espresso semi-otomatis.',
            'Belum pernah secara profesional, namun saya sering berlatih secara mandiri dan memiliki pemahaman dasar yang baik tentang proses pembuatan espresso.',
            'Saya berpengalaman mengoperasikan mesin espresso brand La Marzocco selama bekerja di cafe sebelumnya. Saya juga terbiasa dengan grinder Mazzer dan Mahlkonig.',
            'Saya memahami konsep dasarnya dan siap untuk belajar lebih lanjut. Saya adalah tipe orang yang cepat beradaptasi dengan peralatan baru.',
        ];

        $jawabanCustomerServicePool = [
            'Saya selalu berusaha mendengarkan keluhan pelanggan dengan sabar, minta maaf atas ketidaknyamanan, kemudian mencari solusi terbaik. Pernah ada pelanggan yang tidak puas dengan minumannya dan saya langsung menawarkan penggantian tanpa biaya tambahan.',
            'Prinsip saya adalah "pelanggan adalah prioritas". Saat menghadapi komplain, saya tidak defensif tetapi justru berterima kasih karena itu membantu kami berkembang. Saya segera eskalasi ke supervisor jika di luar kewenangan saya.',
            'Saya pernah menghadapi pelanggan yang sangat tidak puas karena pesanannya tertukar. Saya meminta maaf dengan tulus, segera membuat ulang pesanan, dan memberikan minuman gratis sebagai bentuk apresiasi atas kesabarannya.',
            'Menghadapi pelanggan marah memerlukan kesabaran ekstra. Saya selalu menjaga nada bicara tetap tenang dan ramah, karena itu biasanya meredakan situasi. Penyelesaian masalah secara cepat dan tepat adalah kunci.',
            'Saya menggunakan teknik active listening — mendengarkan dulu sampai pelanggan selesai berbicara, lalu memberikan respons yang empatik. Hal ini terbukti efektif menenangkan pelanggan yang frustasi.',
        ];

        $jawabanAdministratifPool = [
            'Ekspektasi gaji saya berkisar Rp 2.500.000 – Rp 3.000.000 per bulan, disesuaikan dengan kebijakan perusahaan dan pengalaman kerja yang relevan.',
            'Saya mengharapkan gaji sekitar Rp 2.000.000 – Rp 2.800.000 per bulan. Namun saya terbuka untuk negosiasi sesuai dengan job description dan benefit yang ditawarkan.',
            'Untuk ekspektasi gaji, saya merujuk pada standar UMK Kabupaten Indramayu dan bersedia didiskusikan lebih lanjut saat wawancara.',
            'Gaji yang saya harapkan adalah Rp 3.000.000 – Rp 3.500.000 per bulan mengingat pengalaman kerja saya selama lebih dari 1 tahun di industri ini.',
            'Saya fleksibel soal kompensasi dan lebih mengutamakan lingkungan kerja yang positif serta kesempatan berkembang. Namun secara umum saya mengharapkan minimal UMK Indramayu.',
        ];

        $jawabanMulaiKerjaPool = [
            'Saya siap mulai bekerja dalam waktu 1 minggu setelah ada keputusan penerimaan, karena saya masih perlu menyelesaikan administrasi di tempat kerja sebelumnya.',
            'Saya bisa mulai bekerja segera, paling lambat 2 minggu dari sekarang untuk mempersiapkan kebutuhan pribadi.',
            'Saya tersedia mulai bekerja bulan depan karena saat ini masih dalam proses penyelesaian kontrak di perusahaan lama.',
            'Saya dapat mulai bekerja dalam 3 hari setelah pemberitahuan resmi dari pihak perusahaan.',
            'Karena saat ini belum bekerja, saya bisa mulai kapan saja sesuai kebutuhan perusahaan.',
        ];

        $jawabanShiftPool = [
            'Ya, saya bersedia bekerja dalam sistem shift pagi, siang, maupun malam. Saya memahami bahwa industri F&B memerlukan fleksibilitas tinggi dalam jadwal kerja.',
            'Saya bersedia bekerja shift, namun saya lebih prefer shift pagi atau siang. Untuk shift malam saya perlu pertimbangan transportasi, tetapi saya terbuka untuk mendiskusikannya.',
            'Saya sepenuhnya bersedia dengan sistem shift dan sudah terbiasa dengan pola kerja seperti ini dari pengalaman sebelumnya.',
            'Saya bersedia bekerja shift pagi dan siang. Untuk malam hari saya bisa jika mendapat pemberitahuan terlebih dahulu.',
            'Tidak ada masalah dengan sistem shift. Justru saya menyukai variasi jadwal karena membuat ritme kerja tidak monoton.',
        ];

        $jawabanPengalamanPool = [
            'Selama 8 bulan saya bekerja sebagai barista, saya sudah terbiasa menjaga kebersihan area kerja secara konsisten. SOP kebersihan selalu saya terapkan sebelum dan setelah shift.',
            'Saya memiliki kebiasaan membersihkan area kerja setiap 30 menit sekali saat situasi sedang tidak sibuk. Kebersihan bagi saya adalah standar profesionalisme.',
            'Pengalaman saya di KFC Indramayu mengajarkan disiplin kebersihan yang sangat ketat. Semua standar food safety saya terapkan hingga saat ini.',
            'Saya selalu memastikan mesin kopi, grinder, dan area bar bersih sebelum memulai dan setelah mengakhiri shift. Ini adalah kebiasaan yang sudah menjadi karakter.',
            'Di tempat kerja sebelumnya, saya bertanggung jawab atas kebersihan area bar dan customer area. Saya melakukan pengecekan rutin dan mendokumentasikannya di checklist harian.',
        ];

        DB::transaction(function () use (
            $lamaran,
            $jawabanMotivasiPool,
            $jawabanOperasionalPool,
            $jawabanCustomerServicePool,
            $jawabanAdministratifPool,
            $jawabanMulaiKerjaPool,
            $jawabanShiftPool,
            $jawabanPengalamanPool
        ) {
            $totalInserted = 0;

            foreach ($lamaran as $lmr) {
                // -------------------------------------------------------
                // Ambil semua pertanyaan untuk lowongan terkait
                // -------------------------------------------------------
                $pertanyaan = DB::table('pertanyaan_lowongan')
                    ->where('id_lowongan', $lmr->id_lowongan)
                    ->get();

                if ($pertanyaan->isEmpty()) continue;

                foreach ($pertanyaan as $p) {
                    // Cek idempotent — jangan duplikasi jawaban
                    $sudahAda = DB::table('jawaban_pertanyaan')
                        ->where('id_lamaran', $lmr->id_lamaran)
                        ->where('id_pertanyaan', $p->id_pertanyaan)
                        ->exists();

                    if ($sudahAda) continue;

                    // -------------------------------------------------------
                    // Pilih jawaban berdasarkan konten pertanyaan
                    // -------------------------------------------------------
                    $pertanyaanTeks = strtolower($p->pertanyaan);
                    $jawaban = $this->pilihJawaban(
                        $pertanyaanTeks,
                        $jawabanMotivasiPool,
                        $jawabanOperasionalPool,
                        $jawabanCustomerServicePool,
                        $jawabanAdministratifPool,
                        $jawabanMulaiKerjaPool,
                        $jawabanShiftPool,
                        $jawabanPengalamanPool
                    );

                    DB::table('jawaban_pertanyaan')->insert([
                        'id_lamaran'    => $lmr->id_lamaran,
                        'id_pertanyaan' => $p->id_pertanyaan,
                        'jawaban'       => $jawaban,
                        'created_at'    => now(),
                        'updated_at'    => now(),
                    ]);

                    $totalInserted++;
                }
            }

            $this->command->info("JawabanLamaranSeeder selesai. Total jawaban dibuat: {$totalInserted}.");
        });
    }

    /**
     * Pilih jawaban yang relevan berdasarkan kata kunci dalam pertanyaan.
     * Jika tidak ada kata kunci yang cocok, kembalikan jawaban operasional umum.
     */
    private function pilihJawaban(
        string $pertanyaanTeks,
        array $motivasi,
        array $operasional,
        array $customerService,
        array $administratif,
        array $mulaiKerja,
        array $shift,
        array $pengalaman
    ): string {
        // Motivasi & kepribadian
        if (str_contains($pertanyaanTeks, 'tertarik') ||
            str_contains($pertanyaanTeks, 'motivasi') ||
            str_contains($pertanyaanTeks, 'alasan') ||
            str_contains($pertanyaanTeks, 'kelebihan') ||
            str_contains($pertanyaanTeks, 'karier') ||
            str_contains($pertanyaanTeks, 'tahun ke depan')) {
            return $motivasi[array_rand($motivasi)];
        }

        // Customer service
        if (str_contains($pertanyaanTeks, 'pelanggan') ||
            str_contains($pertanyaanTeks, 'komplain') ||
            str_contains($pertanyaanTeks, 'marah') ||
            str_contains($pertanyaanTeks, 'puas') ||
            str_contains($pertanyaanTeks, 'antrian')) {
            return $customerService[array_rand($customerService)];
        }

        // Administrasi
        if (str_contains($pertanyaanTeks, 'gaji') ||
            str_contains($pertanyaanTeks, 'ekspektasi') ||
            str_contains($pertanyaanTeks, 'penempatan') ||
            str_contains($pertanyaanTeks, 'outlet lain')) {
            return $administratif[array_rand($administratif)];
        }

        // Mulai kerja
        if (str_contains($pertanyaanTeks, 'mulai bekerja') ||
            str_contains($pertanyaanTeks, 'kapan') ||
            str_contains($pertanyaanTeks, 'bergabung')) {
            return $mulaiKerja[array_rand($mulaiKerja)];
        }

        // Shift
        if (str_contains($pertanyaanTeks, 'shift') ||
            str_contains($pertanyaanTeks, 'malam') ||
            str_contains($pertanyaanTeks, 'jadwal')) {
            return $shift[array_rand($shift)];
        }

        // Pengalaman kebersihan/operasional
        if (str_contains($pertanyaanTeks, 'kebersihan') ||
            str_contains($pertanyaanTeks, 'pengalaman') ||
            str_contains($pertanyaanTeks, 'sim') ||
            str_contains($pertanyaanTeks, 'kendaraan')) {
            return $pengalaman[array_rand($pengalaman)];
        }

        // Default: jawaban operasional untuk pertanyaan tentang posisi/jabatan
        return $operasional[array_rand($operasional)];
    }
}
