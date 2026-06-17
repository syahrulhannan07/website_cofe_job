<?php

namespace App\Console\Commands;

use App\Models\Lowongan;
use App\Models\PengaturanAi;
use App\Services\V1\Admin\AIScoringService;
use Illuminate\Console\Command;

class AiSweep extends Command
{
    protected $signature = 'ai:sweep
        {--dry-run : Jangan eksekusi tindakan, hanya log}';

    protected $description = 'Sweep AI Detection — evaluasi ulang semua lowongan aktif';

    public function handle(AIScoringService $aiService): int
    {
        $this->info('Memulai AI Sweep...');

        $lowonganAktif = Lowongan::where('status', 'Active')
            ->with(['perusahaan.pengguna', 'dokumenDibutuhkan', 'pertanyaanSeleksi'])
            ->get();

        if ($lowonganAktif->isEmpty()) {
            $this->info('Tidak ada lowongan aktif untuk dievaluasi.');
            return self::SUCCESS;
        }

        $this->info("Ditemukan {$lowonganAktif->count()} lowongan aktif.");

        $progressBar = $this->output->createProgressBar($lowonganAktif->count());
        $progressBar->start();

        $jumlahFlagged = 0;
        $jumlahWarning = 0;
        $jumlahSuspended = 0;

        foreach ($lowonganAktif as $lowongan) {
            if (!$lowongan->perusahaan?->pengguna) {
                $progressBar->advance();
                continue;
            }

            try {
                $log = $aiService->evaluasiLowongan($lowongan);

                match ($log->tindakan) {
                    'flagged'   => $jumlahFlagged++,
                    'warning'   => $jumlahWarning++,
                    'suspended' => $jumlahSuspended++,
                    default     => null,
                };
            } catch (\Exception $e) {
                $this->warn("Gagal mengevaluasi lowongan #{$lowongan->id_lowongan}: {$e->getMessage()}");
            }

            $progressBar->advance();
        }

        $progressBar->finish();
        $this->newLine();
        $this->info("Sweep selesai!");
        $this->table(
            ['Tindakan', 'Jumlah'],
            [
                ['Flagged', $jumlahFlagged],
                ['Warning', $jumlahWarning],
                ['Suspended', $jumlahSuspended],
                ['Total', $lowonganAktif->count()],
            ]
        );

        return self::SUCCESS;
    }
}
