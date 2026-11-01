# C.A.F.E. Job Portal ☕💼

**C.A.F.E. Job Portal** (Career & Food Enterprise) adalah platform rekrutmen inovatif yang dikhususkan untuk industri F&B, khususnya kafe dan restoran. Platform ini mempertemukan talenta berbakat dengan pemilik bisnis kafe untuk mempermudah proses pencarian kerja dan manajemen kandidat.

---

## 🌟 Fitur Utama

### 1. Pelamar (Applicant)
- **Pencarian Lowongan:** Filter lowongan berdasarkan posisi, lokasi, dan tipe kafe.
- **Profil Profesional:** Bangun CV online dengan riwayat pendidikan, pengalaman kerja, dan keahlian.
- **Tracking Timeline:** Pantau status lamaran secara real-time (Diproses, Wawancara, Diterima/Ditolak).
- **Notifikasi Push & Email:** Dapatkan undangan wawancara dan update status langsung ke perangkat Anda.

### 2. Admin Perusahaan (Company Admin)
- **Kelola Lowongan:** Buat, edit, dan publikasikan lowongan kerja dengan pertanyaan kustom.
- **Manajemen Kandidat:** Review lamaran yang masuk, download dokumen legalitas, dan kelola status pelamar.
- **Penjadwalan Wawancara:** Kirim undangan wawancara otomatis dengan detail lokasi atau link meeting.
- **Statistik Dashboard:** Pantau jumlah pelamar dan performa lowongan aktif.

### 3. Super Admin (Portal Pusat)
- **Verifikasi Bisnis:** Validasi dokumen NIB/Izin Usaha kafe yang mendaftar untuk menjaga keamanan platform.
- **Manajemen Akun:** Kontrol penuh terhadap seluruh akun pengguna (aktifkan/nonaktifkan).
- **Moderasi Konten:** Memastikan lowongan yang dipublikasikan sesuai dengan standar platform.

---

## 🛠️ Teknologi yang Digunakan

| Komponen | Teknologi |
| --- | --- |
| **Backend** | PHP 8.2+, Laravel 11 |
| **Frontend** | React 18 (Vite), Tailwind CSS |
| **Database** | MySQL / MariaDB |
| **Notifikasi** | Firebase Cloud Messaging (FCM) & SMTP Mail |
| **Real-time** | Laravel Reverb (WebSockets) |
| **Icons** | Heroicons |

---

## 🚀 Instalasi Lokal

### Prasyarat
- PHP >= 8.2
- Composer
- Node.js & NPM
- MySQL

### Langkah-langkah
1. **Clone Repository**
   ```bash
   git clone https://github.com/syahrulhannan07/website_cofe_job.git
   cd website_cofe_job
   ```

2. **Instal Dependency Backend**
   ```bash
   composer install
   ```

3. **Instal Dependency Frontend**
   ```bash
   npm install
   ```

4. **Konfigurasi Environment**
   Salin file `.env.example` menjadi `.env` dan sesuaikan pengaturan database serta Firebase Anda.
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

5. **Migrasi & Seeding**
   ```bash
   php artisan migrate --seed
   ```

6. **Jalankan Aplikasi**
   Buka dua terminal:
   - Terminal 1 (Backend): `php artisan serve`
   - Terminal 2 (Frontend): `npm run dev`

---

## Verifikasi Wajah dan Presensi Wawancara

Pencocokan foto menggunakan Face++ di backend. Konfigurasikan `FACEPLUSPLUS_API_KEY`, `FACEPLUSPLUS_API_SECRET`, dan pengaturan Face++ pada `config/services.php`. Gunakan HTTPS saat deployment agar browser dapat mengakses kamera. Jalankan queue worker sesuai konfigurasi aplikasi untuk pengiriman email/push; notifikasi kehadiran di dalam aplikasi disimpan langsung setelah transaksi presensi berhasil.

Terapkan migrasi tambahan tanpa menghapus data lama:

```bash
php artisan migrate
```

Penyimpanan mengikuti relasi diagram:

- `data_wajah`: referensi path foto profil pelamar, bukan salinan hasil kamera atau face token.
- `verifikasi_wajah`: riwayat percobaan, pengguna, lamaran/jadwal terkait, jenis verifikasi, skor, ambang batas, dan status. Percobaan yang konteks profil/jadwalnya berubah ditandai kedaluwarsa.
- `presensi_wawancara`: jadwal, pengguna, verifikasi yang berhasil, waktu presensi, dan status kehadiran. Satu jadwal hanya memiliki satu presensi.

Pengiriman lamaran memerlukan hasil verifikasi database terbaru yang berhasil, berusia maksimal 30 menit, dan menggunakan foto profil yang masih sama. Percobaan ulang yang gagal atau belum selesai membatalkan kelayakan hasil lama. Ringkasan verifikasi tetap disertakan dalam `snapshot_profil`; snapshot lamaran lama tidak diubah atau dibuatkan bukti presensi secara otomatis.

Tombol konfirmasi jadwal pelamar diganti menjadi **Presensi Wajah**. Presensi tersedia pada tanggal wawancara menurut zona waktu `Asia/Jakarta`, selama jadwal masih `Terjadwal` dan lamaran berada dalam tahap wawancara. Jam mulai yang sudah terlewat tidak langsung menutup presensi pada hari tersebut. Status hadir dicatat hanya setelah pencocokan berhasil; dalam transaksi yang sama, status jadwal wawancara otomatis berubah dari `Terjadwal` menjadi `Selesai`. Perusahaan tetap menerima pemberitahuan bahwa pelamar hadir dan siap diwawancarai. Status `Selesai` di sini menandai proses presensi/jadwal, bukan keputusan menerima pelamar; status lamaran tidak berubah. Permintaan ulang tidak menggandakan presensi atau notifikasi. Jadwal yang sudah memiliki presensi tidak dapat diedit/dihapus dan tidak perlu diselesaikan manual oleh perusahaan. Presensi gagal tidak mengubah status jadwal. Perubahan otomatis berlaku untuk presensi baru; data presensi lama tidak diperbarui secara massal.

Endpoint `POST /api/v1/pelamar/lamaran/{id}/konfirmasi-wawancara` kini membutuhkan `id_wawancara` dan `image_base64`; konfirmasi kosong tidak lagi diterima. Kedua endpoint pencocokan wajah berbagi batas lima percobaan per menit per pengguna. Hasil kamera dikirim ke Face++ untuk pemrosesan tetapi tidak disimpan oleh aplikasi. Perlakukan referensi foto, skor, dan riwayat verifikasi sebagai data pribadi: batasi akses serta tentukan kebijakan retensi dan persetujuan pengguna sebelum penggunaan produksi.

**Batasan:** pencocokan wajah ini belum merupakan pemeriksaan liveness/anti-spoofing atau bukti keberadaan fisik di lokasi kafe. Presensi berarti pelamar terverifikasi telah menyatakan hadir dan siap, termasuk untuk wawancara daring.

Validasi khusus fitur:

```bash
php artisan test --compact tests/Feature/FaceVerificationAttendanceTest.php
node --test tests/Browser/presensiWawancara.test.js
npm run build
```

Tes browser menggunakan layanan dan kamera tiruan; tidak mengirim foto ke Face++. Tes memerlukan Chrome Windows yang terpasang pada lokasi standar, atau browser Chromium Playwright (`npx playwright install chromium`). Server uji dihentikan setelah tes selesai.

## 📸 Tampilan Preview
*(Tambahkan screenshot atau link demo di sini di masa mendatang)*

---

## 📄 Lisensi
Proyek ini dikembangkan untuk kebutuhan internal dan berlisensi di bawah [MIT License](LICENSE).

---

Developed with ❤️ by **Tim C.A.F.E. Job**
