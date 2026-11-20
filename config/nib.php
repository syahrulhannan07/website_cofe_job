<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Konfigurasi Infrastruktur NIB (Tesseract & Poppler)
    |--------------------------------------------------------------------------
    |
    | Konfigurasi ini mendefinisikan path executable Tesseract dan Poppler (pdfinfo, pdftoppm),
    | model bahasa OCR, timeout proses, DPI rendering, serta batas jumlah halaman.
    | Mendukung lingkungan Windows/XAMPP maupun Linux/Docker secara fleksibel melalui env.
    |
    */

    'tesseract_path' => env('TESSERACT_PATH', 'tesseract'),
    'tesseract_lang' => env('TESSERACT_LANG', 'ind+eng'),

    'pdfinfo_path' => env('PDFINFO_PATH', 'pdfinfo'),
    'pdftoppm_path' => env('PDFTOPPM_PATH', 'pdftoppm'),
    'pdfimages_path' => env('PDFIMAGES_PATH', 'pdfimages'),

    'timeout' => (int) env('NIB_OCR_TIMEOUT', 120),
    'dpi' => (int) env('NIB_PDF_DPI', 200),
    'max_pages' => (int) env('NIB_MAX_PDF_PAGES', 50),

    // Resolusi fallback (dipisahkan koma) yang dicoba ketika QR belum ditemukan
    // pada resolusi awal. Contoh: "300,400".
    'qr_dpi_fallbacks' => array_values(array_filter(array_map(
        'intval',
        explode(',', (string) env('NIB_QR_DPI_FALLBACKS', '300'))
    ))),

    // Faktor pembesaran gambar untuk preprocessing QR.
    'qr_upscale_factor' => (int) env('NIB_QR_UPSCALE_FACTOR', 2),

    // Batas piksel untuk decode halaman penuh. Gambar yang lebih besar akan
    // diperkecil agar decoder Zxing tidak kehabisan memori. 0 = tanpa batas.
    'qr_max_pixels' => (int) env('NIB_QR_MAX_PIXELS', 4000000),

    // Anggaran waktu (detik) per halaman/gambar untuk seluruh strategi decode
    // QR. 0 = tanpa batas.
    'qr_page_time_budget' => (int) env('NIB_QR_PAGE_TIME_BUDGET', 120),

    // Batas jumlah gambar tertanam (embedded) yang dicoba saat pra-pindai PDF.
    'qr_embedded_max_images' => (int) env('NIB_QR_EMBEDDED_MAX_IMAGES', 10),

];
