# Panduan Setup & Konfigurasi Infrastruktur NIB Screening (C.A.F.E. Job)

Dokumen ini memuat panduan lengkap untuk menyiapkan, mengonfigurasi, dan menjalankan infrastruktur OCR (Tesseract), PDF rendering & inspection (Poppler), QR Decoder, Database, dan Queue Worker di dua lingkungan: **Windows / XAMPP** (Lokal) dan **VPS Ubuntu / Docker** (Produksi).

---

## A. Panduan Lokal Windows / XAMPP

Pada lingkungan lokal Windows/XAMPP, aplikasi berjalan secara native di atas PHP XAMPP. Karena Poppler dan Tesseract tidak tersedia secara default di Windows, Anda perlu menginstalnya secara terpisah dan mengonfigurasi path-nya melalui file `.env`.

### 1. Instalasi Tesseract OCR
1. Unduh installer Tesseract OCR untuk Windows (mis. dari UB Mannheim GitHub repository: `tesseract-ocr-w64-setup-5.3.3...exe`).
2. Jalankan installer dan pasang di direktori default, contoh: `C:\Program Files\Tesseract-OCR`.
3. Pastikan untuk mencentang bahasa tambahan saat instalasi (khususnya **Indonesian (`ind`)** dan **English (`eng`)**).
4. Tambahkan path `C:\Program Files\Tesseract-OCR` ke Environment Variables (`PATH`) sistem Windows Anda (opsional, namun direkomendasikan).

### 2. Instalasi Poppler for Windows
1. Unduh rilis Poppler for Windows (mis. dari pembangun Poppler utilities untuk Windows seperti `poppler-24.x.x` zip).
2. Ekstrak arsip ke folder lokal, contoh: `C:\poppler`.
3. Folder ini biasanya memiliki struktur `C:\poppler\Library\bin` yang berisi `pdfinfo.exe` dan `pdftoppm.exe`.
4. Tambahkan `C:\poppler\Library\bin` ke Environment Variables (`PATH`) Windows Anda.

### 3. Konfigurasi File `.env`
Buka file `.env` di root proyek Anda, lalu sesuaikan konfigurasi path berikut sesuai lokasi instalasi Anda:

```env
TESSERACT_PATH="C:/Program Files/Tesseract-OCR/tesseract.exe"
TESSERACT_LANG=ind+eng

PDFINFO_PATH="C:/poppler/Library/bin/pdfinfo.exe"
PDFTOPPM_PATH="C:/poppler/Library/bin/pdftoppm.exe"

NIB_OCR_TIMEOUT=120
NIB_PDF_DPI=200
NIB_MAX_PDF_PAGES=50
```

### 4. Verifikasi Instalasi & Diagnostik
Jalankan perintah Artisan berikut di PowerShell untuk memastikan semua komponen terbaca dengan sukses (`PASS`):

```powershell
php artisan nib:diagnose
```

### 5. Menjalankan Queue Worker (Lokal)
Pemrosesan screening NIB berjalan secara asynchronous melalui Laravel Queue. Jalankan worker di terminal terpisah:

```powershell
php artisan queue:work --tries=3 --sleep=3
```

---

## B. Panduan VPS Docker (Produksi Ubuntu 24.04.4 LTS)

Pada lingkungan produksi VPS Ubuntu menggunakan Docker, seluruh dependensi sistem (Tesseract, bahasa Indonesia/Inggris, dan Poppler) telah dibungkus secara otomatis di dalam `Dockerfile`. Anda tidak perlu menginstal apa pun secara manual di host VPS.

### 1. Build & Deploy Docker Image
Pastikan repositori Anda sudah ter-update dan GitHub Actions / Docker Compose di-set up dengan benar. Untuk build dan menjalankan container di VPS:

```bash
docker compose down
docker compose build --no-cache
docker compose up -d
```

### 2. Memverifikasi Binary di dalam Container
Masuk ke dalam container aplikasi untuk memastikan Tesseract dan Poppler tersedia dan mengenali bahasa:

```bash
docker exec -it website_cofe_job-app-1 tesseract --version
docker exec -it website_cofe_job-app-1 tesseract --list-langs
docker exec -it website_cofe_job-app-1 pdfinfo -v
docker exec -it website_cofe_job-app-1 pdftoppm -v
```
*(Catatan: Sesuaikan nama container `website_cofe_job-app-1` dengan hasil perintah `docker ps`).*

### 3. Menjalankan Diagnostik di dalam Container
```bash
docker exec -it website_cofe_job-app-1 php artisan nib:diagnose
```

### 4. Memastikan Queue Worker Berjalan di Produksi
Jika Anda menggunakan Docker Compose produksi, pastikan service queue worker aktif. Jika worker berjalan di dalam container utama via Supervisor (seperti dikonfigurasi di `Dockerfile`), periksa status supervisord:

```bash
docker exec -it website_cofe_job-app-1 supervisorctl status
```

### 5. Melihat Log Worker / Screening
```bash
docker exec -it website_cofe_job-app-1 tail -f storage/logs/laravel.log
```

### 6. Menjalankan Ulang Screening (Jika Diperlukan)
Jika ada NIB yang gagal diproses sebelumnya, Anda dapat mentrigger ulang screening melalui Artisan tinker atau endpoint Super Admin.
