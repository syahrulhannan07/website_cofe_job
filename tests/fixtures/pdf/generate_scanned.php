<?php
/**
 * Generate scanned-image PDF fixtures for NibOcrService integration tests.
 * Setiap halaman adalah berkas gambir (JPEG) yang berisi teks, diselubung
 * sebagai XObject dalam PDF sehingga tidak ada teks yang dapat diekstrak
 * secara langsung (memerlukan OCR).
 *
 * Run: php tests/fixtures/pdf/generate_scanned.php
 */

function makeTextImage(string $text, int $width = 1700, int $height = 2200): string
{
    $im = imagecreatetruecolor($width, $height);
    $white = imagecolorallocate($im, 255, 255, 255);
    $black = imagecolorallocate($im, 0, 0, 0);

    imagefilledrectangle($im, 0, 0, $width, $height, $white);

    $lines = explode("\n", $text);
    $y = 250;
    foreach ($lines as $line) {
        imagestring($im, 5, 120, $y, $line, $black);
        $y += 130;
    }

    ob_start();
    imagejpeg($im, null, 92);
    $bytes = ob_get_clean();
    imagedestroy($im);

    return $bytes;
}

function createScannedPdf(array $pageTexts): string
{
    $fixturesDir = __DIR__;
    $width = 1700;
    $height = 2200;
    $mediaBox = [0, 0, 612, 792];

    $objects = [];
    $objects[] = null;

    $pdf = '%PDF-1.4' . "\n";

    $objects[1] = strlen($pdf);
    $pdf .= "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n";

    $pageObjNums = [];
    $objNum = 3;

    foreach ($pageTexts as $index => $text) {
        $imageBytes = makeTextImage($text);
        $imageLength = strlen($imageBytes);

        $pageObjNums[] = $objNum;
        $imageObjNum = $objNum + 1;
        $contentObjNum = $objNum + 2;

        $pdf .= sprintf(
            "%d 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [%d %d %d %d] /Resources << /XObject << /Im%d %d 0 R >> >> /Contents %d 0 R >>\nendobj\n",
            $objNum,
            $mediaBox[0], $mediaBox[1], $mediaBox[2], $mediaBox[3],
            $index + 1, $imageObjNum,
            $contentObjNum
        );
        $objNum++;

        $objects[$imageObjNum] = strlen($pdf);
        $pdf .= sprintf(
            "%d 0 obj\n<< /Type /XObject /Subtype /Image /Width %d /Height %d /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length %d >>\nstream\n",
            $imageObjNum,
            $width,
            $height,
            $imageLength
        );
        $pdf .= $imageBytes . "\nendstream\nendobj\n";
        $objNum++;

        $contentStream = sprintf("q %d 0 0 %d 0 0 cm /Im%d Do Q", $mediaBox[2], $mediaBox[3], $index + 1);
        $contentLength = strlen($contentStream);
        $objects[$contentObjNum] = strlen($pdf);
        $pdf .= sprintf(
            "%d 0 obj\n<< /Length %d >>\nstream\n%s\nendstream\nendobj\n",
            $contentObjNum,
            $contentLength,
            $contentStream
        );
        $objNum++;
    }

    $kids = implode(' ', array_map(fn($n) => "$n 0 R", $pageObjNums));
    $objects[2] = strlen($pdf);
    $pdf .= sprintf("2 0 obj\n<< /Type /Pages /Kids [%s] /Count %d >>\nendobj\n", $kids, count($pageTexts));

    $xrefOffset = strlen($pdf);
    $totalObjects = $objNum;
    $pdf .= "xref\n";
    $pdf .= "0 $totalObjects\n";
    $pdf .= "0000000000 65535 f \n";
    for ($i = 1; $i < $totalObjects; $i++) {
        $offset = $objects[$i] ?? 0;
        $pdf .= sprintf("%010d 00000 n \n", $offset);
    }

    $pdf .= "trailer\n";
    $pdf .= sprintf("<< /Size %d /Root 1 0 R >>\n", $totalObjects);
    $pdf .= "startxref\n";
    $pdf .= $xrefOffset . "\n";
    $pdf .= "%%EOF\n";

    $filename = 'scanned_' . count($pageTexts) . '_page.pdf';
    $path = $fixturesDir . DIRECTORY_SEPARATOR . $filename;
    file_put_contents($path, $pdf);

    echo "Generated: $filename (" . count($pageTexts) . " page(s))\n";

    return $pdf;
}

createScannedPdf(['NIB 1234567890123', 'CV Kafe Contoh', 'Indramayu']);
createScannedPdf(['Halaman Satu - NIB 1112223334445', 'Halaman Dua - Nama Perusahaan Contoh']);

// Halaman kosong (tanpa teks) untuk pengujian OCR_EMPTY.
createScannedPdf(['']);

echo "Selesai generate fixture scan\n";
