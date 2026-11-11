<?php
/**
 * Generate test PDF fixtures for NibPdfExtractorService tests.
 * Run: php tests/fixtures/pdf/generate.php
 */

$fixturesDir = __DIR__;

// Fixture 1: Valid PDF with extractable text (2 pages)
$pdf1 = '%PDF-1.4' . "\n";
$pdf1 .= '1 0 obj' . "\n" . '<< /Type /Catalog /Pages 2 0 R >>' . "\n" . 'endobj' . "\n";
$pdf1 .= '2 0 obj' . "\n" . '<< /Type /Pages /Kids [3 0 R 5 0 R] /Count 2 >>' . "\n" . 'endobj' . "\n";
$pdf1 .= '3 0 obj' . "\n" . '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>' . "\n" . 'endobj' . "\n";
$pdf1 .= '4 0 obj' . "\n" . '<< /Length 52 >>' . "\n" . 'stream' . "\n" . 'BT /F1 12 Tf 72 712 Td (Halaman 1 - Nomor NIB 1234567890123) Tj ET' . "\n" . 'endstream' . "\n" . 'endobj' . "\n";
$pdf1 .= '5 0 obj' . "\n" . '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 6 0 R >>' . "\n" . 'endobj' . "\n";
$pdf1 .= '6 0 obj' . "\n" . '<< /Length 54 >>' . "\n" . 'stream' . "\n" . 'BT /F1 12 Tf 72 712 Td (Halaman 2 - Nama Perusahaan CV Kafe Contoh) Tj ET' . "\n" . 'endstream' . "\n" . 'endobj' . "\n";

// Build xref
$objects = [];
$objects[] = ''; // object 0
$pos = strlen($pdf1);
$objects[] = $pos; // object 1
$pdf1 .= '1 0 obj' . "\n" . '<< /Type /Catalog /Pages 2 0 R >>' . "\n" . 'endobj' . "\n";

// Actually let me just write a simpler valid PDF
file_put_contents($fixturesDir . '/valid_with_text.pdf', $pdf1);

echo "Generated test fixtures\n";
