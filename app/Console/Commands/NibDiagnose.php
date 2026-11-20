<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\Process\Process;
use Zxing\QrReader;

class NibDiagnose extends Command
{
    protected $signature = 'nib:diagnose';
    protected $description = 'Melakukan diagnosa kesiapan infrastruktur OCR, Poppler, Tesseract, QR Decoder, Storage, Queue, dan Database untuk NIB Screening';

    public function handle(): int
    {
        $this->info('============================================================');
        $this->info('          DIAGNOSA INFRASTRUKTUR NIB SCREENING              ');
        $this->info('============================================================');
        $this->info('OS Family: ' . PHP_OS_FAMILY);
        $this->info('PHP Version: ' . PHP_VERSION);
        $this->newLine();

        $results = [];

        // 1. PHP Extensions
        $hasGd = extension_loaded('gd');
        $hasImagick = extension_loaded('imagick');
        $results[] = [
            'Komponen' => 'PHP Image Extension (GD / Imagick)',
            'Status' => ($hasGd || $hasImagick) ? 'PASS' : 'FAIL',
            'Detail' => 'GD: ' . ($hasGd ? 'Aktif' : 'Tidak Aktif') . ' | Imagick: ' . ($hasImagick ? 'Aktif' : 'Tidak Aktif'),
        ];

        // 2. Tesseract Binary
        $tesseractBin = config('nib.tesseract_path', 'tesseract');
        $tesseractAvailable = $this->binaryAvailable($tesseractBin);
        $tesseractVersion = 'Tidak Diketahui';
        if ($tesseractAvailable) {
            $tesseractVersion = $this->getProcessOutput([$tesseractBin, '--version']);
        }
        $results[] = [
            'Komponen' => 'Tesseract OCR Binary (' . $tesseractBin . ')',
            'Status' => $tesseractAvailable ? 'PASS' : 'FAIL',
            'Detail' => $tesseractAvailable ? trim(explode("\n", $tesseractVersion)[0] ?? 'Tersedia') : 'Binary tidak ditemukan di path.',
        ];

        // 3. Tesseract Languages (ind / eng)
        $tesseractLang = config('nib.tesseract_lang', 'ind+eng');
        $langStatus = 'FAIL';
        $langDetail = 'Tidak dapat memuat daftar bahasa';
        if ($tesseractAvailable) {
            $langProcess = new Process([$tesseractBin, '--list-langs']);
            $langProcess->run();
            if ($langProcess->isSuccessful()) {
                $output = $langProcess->getOutput();
                $hasInd = str_contains($output, 'ind');
                $hasEng = str_contains($output, 'eng');
                $langStatus = ($hasInd || $hasEng) ? 'PASS' : 'WARNING';
                $langDetail = 'Ditemukan bahasa: ' . trim(str_replace("\n", ", ", $output));
            }
        }
        $results[] = [
            'Komponen' => 'Tesseract Bahasa (' . $tesseractLang . ')',
            'Status' => $langStatus,
            'Detail' => $langDetail,
        ];

        // 4. Poppler pdfinfo
        $pdfinfoBin = config('nib.pdfinfo_path', 'pdfinfo');
        $pdfinfoAvailable = $this->binaryAvailable($pdfinfoBin);
        $pdfinfoVersion = 'Tidak Diketahui';
        if ($pdfinfoAvailable) {
            $pdfinfoVersion = $this->getProcessOutput([$pdfinfoBin, '-v']);
        }
        $results[] = [
            'Komponen' => 'Poppler pdfinfo (' . $pdfinfoBin . ')',
            'Status' => $pdfinfoAvailable ? 'PASS' : 'FAIL',
            'Detail' => $pdfinfoAvailable ? trim(explode("\n", $pdfinfoVersion)[0] ?? 'Tersedia') : 'Binary tidak ditemukan.',
        ];

        // 5. Poppler pdftoppm
        $pdftoppmBin = config('nib.pdftoppm_path', 'pdftoppm');
        $pdftoppmAvailable = $this->binaryAvailable($pdftoppmBin);
        $pdftoppmVersion = 'Tidak Diketahui';
        if ($pdftoppmAvailable) {
            $pdftoppmVersion = $this->getProcessOutput([$pdftoppmBin, '-v']);
        }
        $results[] = [
            'Komponen' => 'Poppler pdftoppm (' . $pdftoppmBin . ')',
            'Status' => $pdftoppmAvailable ? 'PASS' : 'FAIL',
            'Detail' => $pdftoppmAvailable ? trim(explode("\n", $pdftoppmVersion)[0] ?? 'Tersedia') : 'Binary tidak ditemukan.',
        ];

        // 6. QR Decoder Class (Zxing\QrReader)
        $qrClassExists = class_exists(QrReader::class);
        $results[] = [
            'Komponen' => 'QR Decoder Library (Zxing\QrReader)',
            'Status' => $qrClassExists ? 'PASS' : 'FAIL',
            'Detail' => $qrClassExists ? 'Class tersedia di composer' : 'Class Zxing\QrReader tidak ditemukan.',
        ];

        // 7. Storage Disk (local)
        $storagePass = false;
        try {
            Storage::disk('local')->put('diagnose_test.txt', 'test');
            $storagePass = Storage::disk('local')->exists('diagnose_test.txt');
            Storage::disk('local')->delete('diagnose_test.txt');
        } catch (\Throwable $e) {
            $storagePass = false;
        }
        $results[] = [
            'Komponen' => 'Storage Disk (local private)',
            'Status' => $storagePass ? 'PASS' : 'FAIL',
            'Detail' => $storagePass ? 'Dapat menulis dan membaca file' : 'Gagal mengakses storage local.',
        ];

        // 8. Database Connection
        $dbPass = false;
        $dbError = null;
        try {
            DB::connection()->getPdo();
            $dbPass = true;
        } catch (\Throwable $e) {
            $dbPass = false;
            $dbError = $e->getMessage();
        }
        $results[] = [
            'Komponen' => 'Database Connection',
            'Status' => $dbPass ? 'PASS' : 'FAIL',
            'Detail' => $dbPass ? 'Koneksi database berhasil' : 'Gagal terhubung ke DB: ' . $dbError,
        ];

        // 9. Queue Connection
        $queueConnection = config('queue.default');
        $results[] = [
            'Komponen' => 'Queue Connection (' . $queueConnection . ')',
            'Status' => 'PASS',
            'Detail' => 'Driver queue dikonfigurasi menggunakan ' . $queueConnection,
        ];

        // Tampilkan Tabel Hasil Diagnosa
        $this->table(
            ['Komponen', 'Status', 'Detail'],
            array_map(fn($r) => [
                $r['Komponen'],
                $r['Status'] === 'PASS' ? '<fg=green>PASS</>' : ($r['Status'] === 'WARNING' ? '<fg=yellow>WARNING</>' : '<fg=red>FAIL</>'),
                $r['Detail'],
            ], $results)
        );

        $this->newLine();
        $this->info('Diagnosa selesai. Periksa komponen dengan status FAIL atau WARNING di atas.');

        return 0;
    }

    private function binaryAvailable(string $binary): bool
    {
        if (file_exists($binary) && is_file($binary)) {
            return is_executable($binary) || PHP_OS_FAMILY === 'Windows';
        }

        $cmd = PHP_OS_FAMILY === 'Windows'
            ? "where " . escapeshellarg($binary) . " 2>nul"
            : "which " . escapeshellarg($binary) . " 2>/dev/null";

        $output = shell_exec($cmd);

        return is_string($output) && trim($output) !== '';
    }

    private function getProcessOutput(array $command): string
    {
        try {
            $process = new Process($command);
            $process->run();
            if ($process->isSuccessful()) {
                return $process->getOutput() ?: $process->getErrorOutput();
            }
            return $process->getErrorOutput();
        } catch (\Throwable $e) {
            return $e->getMessage();
        }
    }
}
