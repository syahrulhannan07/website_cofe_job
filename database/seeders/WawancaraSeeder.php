<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class WawancaraSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Memulai WawancaraSeeder...');

        // -------------------------------------------------------
        // Ambil semua lamaran dengan status 'Wawancara'
        // Hanya lamaran berstatus Wawancara yang boleh punya jadwal
        // -------------------------------------------------------
        $lamaranWawancara = DB::table('lamaran')
            ->where('status', 'Wawancara')
            ->get();

        if ($lamaranWawancara->isEmpty()) {
            $this->command->warn('Tidak ada lamaran berstatus Wawancara. WawancaraSeeder dilewati.');
            return;
        }

        $this->command->info("Ditemukan {$lamaranWawancara->count()} lamaran berstatus Wawancara.");

        // -------------------------------------------------------
        // Pool lokasi wawancara — campuran onsite & online
        // -------------------------------------------------------
        $lokasiPool = [
            // Onsite — nama sesuai kafe di Indramayu
            'Kopi Cimanuk, Jl. Raya Karangsong No. 12, Indramayu',
            'Senja Jatibarang, Jl. Ahmad Yani No. 45, Jatibarang',
            'Haurgeulis Coffee House, Jl. Pahlawan No. 8, Haurgeulis',
            'Brew Patrol Indramayu, Jl. Diponegoro No. 77, Indramayu',
            'Kopi Paoman, Jl. Gatot Subroto No. 23, Indramayu',
            'Kantor HRD Kopi Mangga, Jl. Soekarno-Hatta No. 101, Indramayu',
            'Kedai Kopi Indah, Jl. Letjend Suprapto No. 5, Jatibarang',
            'Griya Kopi Widasari, Jl. Raya Widasari No. 19, Widasari',
            // Online
            'Zoom Meeting — link akan dikirim melalui email',
            'Google Meet — kode meeting: cofe-hr-2026',
            'WhatsApp Video Call — nomor HRD akan dihubungi H-1',
        ];

        // -------------------------------------------------------
        // Pool catatan wawancara — realistis untuk industri F&B
        // -------------------------------------------------------
        $catatanPool = [
            'Harap membawa CV terbaru dalam format cetak (2 rangkap) dan identitas diri (KTP) yang masih berlaku.',
            'Siapkan portofolio atau dokumentasi pengalaman barista jika ada. Interview berlangsung sekitar 30–45 menit.',
            'Akan ada tes praktik membuat minuman dasar — harap berpakaian rapi dan siap secara fisik.',
            'Membawa sertifikat pelatihan barista atau food handler jika dimiliki. Berpakaian rapi dan sopan.',
            'Interview dilakukan secara panel oleh HRD dan Kepala Outlet. Harap datang tepat waktu.',
            'Harap konfirmasi kehadiran minimal H-1 melalui WhatsApp ke nomor yang tertera di email.',
            'Membawa identitas diri (KTP) yang masih berlaku. Wawancara berlangsung sekitar 30 menit.',
            'Siapkan jawaban mengenai motivasi kerja dan pengalaman pelayanan pelanggan Anda.',
            'Proses wawancara meliputi sesi tanya jawab dan demonstrasi singkat kemampuan komunikasi.',
            null, // Sebagian wawancara boleh tanpa catatan khusus
            null,
        ];

        $today = Carbon::today();
        $tahunBerjalan = Carbon::now()->year;

        // -------------------------------------------------------
        // Hari kerja valid: Senin s.d. Sabtu (1–6)
        // Jam wawancara: 09:00 – 16:00
        // -------------------------------------------------------
        $jamPool = ['09:00:00', '09:30:00', '10:00:00', '10:30:00', '11:00:00',
                    '13:00:00', '13:30:00', '14:00:00', '14:30:00', '15:00:00', '15:30:00'];

        DB::transaction(function () use (
            $lamaranWawancara, $lokasiPool, $catatanPool, $jamPool, $today, $tahunBerjalan
        ) {
            $count = 0;

            foreach ($lamaranWawancara as $lamaran) {
                // -------------------------------------------------------
                // Cek idempotent — jangan insert duplikat
                // -------------------------------------------------------
                $sudahAda = DB::table('wawancara')
                    ->where('id_lamaran', $lamaran->id_lamaran)
                    ->exists();

                if ($sudahAda) continue;

                // -------------------------------------------------------
                // Tentukan tanggal wawancara
                // Distribusi: 60% masa lalu, 40% masa depan (atau hari ini)
                // -------------------------------------------------------
                $isPastDate = (rand(1, 10) <= 6);

                if ($isPastDate) {
                    // Tanggal di masa lalu: 1 Jan s.d. kemarin
                    $startOfYear = Carbon::create($tahunBerjalan, 1, 1);
                    $daysDiff = $today->copy()->subDay()->diffInDays($startOfYear);
                    if ($daysDiff < 1) $daysDiff = 1;
                    $tanggal = $startOfYear->copy()->addDays(rand(0, $daysDiff));
                } else {
                    // Tanggal di masa depan: besok s.d. akhir tahun
                    $endOfYear = Carbon::create($tahunBerjalan, 12, 31);
                    $daysToEnd = $today->copy()->addDay()->diffInDays($endOfYear);
                    if ($daysToEnd < 1) $daysToEnd = 30;
                    $tanggal = $today->copy()->addDays(rand(1, $daysToEnd));
                }

                // Pastikan hari kerja (Senin–Sabtu, dayOfWeek 1–6)
                // Jika jatuh di Minggu (0), geser ke Senin
                if ($tanggal->dayOfWeek === Carbon::SUNDAY) {
                    $tanggal->addDay();
                }

                // Gabungkan tanggal + jam
                $jam = $jamPool[array_rand($jamPool)];
                $tanggalWawancara = $tanggal->format('Y-m-d') . ' ' . $jam;

                // -------------------------------------------------------
                // ATURAN BISNIS STATUS WAWANCARA:
                // Tanggal lampau  → 75% 'Selesai', 25% 'Dibatalkan'
                // Tanggal depan  → 'Terjadwal'
                // -------------------------------------------------------
                $tanggalCarbon = Carbon::parse($tanggalWawancara);
                if ($tanggalCarbon->lt($today)) {
                    // Masa lalu
                    $status = (rand(1, 4) <= 3) ? 'Selesai' : 'Dibatalkan';
                } else {
                    // Masa depan atau hari ini
                    $status = 'Terjadwal';
                }

                DB::table('wawancara')->insert([
                    'id_lamaran'        => $lamaran->id_lamaran,
                    'tanggal_wawancara' => $tanggalWawancara,
                    'lokasi'            => $lokasiPool[array_rand($lokasiPool)],
                    'catatan'           => $catatanPool[array_rand($catatanPool)],
                    'status'            => $status,
                    'created_at'        => now(),
                    'updated_at'        => now(),
                ]);

                $count++;
            }

            $this->command->info("WawancaraSeeder selesai. Total jadwal dibuat: {$count}.");
        });
    }
}
