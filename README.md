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

## 📸 Tampilan Preview
*(Tambahkan screenshot atau link demo di sini di masa mendatang)*

---

## 📄 Lisensi
Proyek ini dikembangkan untuk kebutuhan internal dan berlisensi di bawah [MIT License](LICENSE).

---

Developed with ❤️ by **Tim C.A.F.E. Job**
