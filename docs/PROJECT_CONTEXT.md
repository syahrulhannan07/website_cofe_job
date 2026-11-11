# Konteks Proyek C.A.F.E. Job untuk Agen OpenCode

Ringkasan ini mengekstrak kebutuhan dan model dari tiga dokumen di folder ini. Ringkasan dibuat untuk membantu agen memahami domain proyek; detail yang tidak terbaca jelas atau bertentangan dengan kode ditandai, bukan ditebak.

## Sumber

1. [`SRS CAFE PROYEK 3.docx.pdf`](SRS%20CAFE%20PROYEK%203.docx.pdf), SRS 71 halaman, bertanggal 2 Februari 2026.
2. [`class.png`](class.png), diagram kelas UML.
3. [`ERD.drawio (3).png`](ERD.drawio%20(3).png), diagram relasi entitas basis data.

## Gambaran Produk

C.A.F.E. adalah sistem e-rekrutmen untuk ekosistem kafe/F&B, terutama di wilayah Kabupaten Indramayu. Sistem mempertemukan pencari kerja dengan kafe, mendukung pengelolaan profil kandidat, publikasi lowongan, lamaran, seleksi, dan wawancara.

### Aktor

- **Pelamar**: membuat akun, mengelola profil dan keahlian, mencari lowongan, mengirim lamaran, memantau status, dan melihat jadwal wawancara.
- **Admin Kafe/Perusahaan**: mengelola profil usaha dan lowongan, meninjau kandidat, mengubah status lamaran, dan menjadwalkan wawancara.
- **Super Admin**: memverifikasi perusahaan/NIB dan mengelola akun admin kafe.

SRS membayangkan pengalaman pelamar melalui aplikasi mobile dan pengalaman admin melalui web. Implementasi dalam repositori saat ini perlu diperiksa sebelum menganggap batas platform tersebut masih berlaku.

## Kebutuhan Fungsional SRS

| ID | Ringkasan |
|---|---|
| FR-01 | Registrasi akun pelamar |
| FR-02 | Login pelamar |
| FR-03 | Melihat, melengkapi, dan mengubah profil serta keahlian F&B |
| FR-04 | Mengirim lamaran untuk lowongan yang tersedia |
| FR-04.01 / FR-04.02 | Verifikasi wajah dan bantuan chatbot; penomoran kedua fitur ini tidak konsisten di bagian SRS, lihat catatan perbedaan |
| FR-05 | Melihat status dan riwayat lamaran |
| FR-05.01 | Melihat jadwal wawancara |
| FR-06 | Registrasi akun perusahaan |
| FR-06.01 | Menentukan koordinat outlet pada peta |
| FR-06.02 | Mengunggah foto outlet |
| FR-07 | Login admin kafe |
| FR-08 | Mengelola profil perusahaan |
| FR-08.01 | CRUD lowongan |
| FR-09 | Meninjau kandidat dan memperbarui status lamaran |
| FR-09.01 | Menjadwalkan wawancara |
| FR-10 | Login super admin |
| FR-11 | Memverifikasi pendaftaran perusahaan |
| FR-11.01 | Screening NIB |
| FR-12 | Melihat dan menonaktifkan/memblokir akun admin |

### Alur Utama Lamaran

1. Pelamar memilih lowongan dan melihat detailnya.
2. Pelamar mengunggah dokumen yang diminta lowongan.
3. Pelamar menjawab pertanyaan penyaringan yang wajib.
4. Pelamar meninjau atau melengkapi profil.
5. Pelamar meninjau ringkasan, lalu mengirim lamaran.
6. SRS memasukkan verifikasi wajah ke alur pengiriman lamaran.
7. Admin meninjau berkas, memperbarui status, dan dapat mengundang kandidat untuk wawancara.
8. Pelamar melihat status/timeline dan detail jadwal; sistem mengirim notifikasi.

Status yang disebut SRS untuk lamaran: diproses, wawancara, diterima, ditolak. Status nyata dan transisinya harus diperiksa pada kode karena repositori dapat memiliki perubahan lebih baru.

### Use Case yang Terdaftar

SRS memuat 20 use case: registrasi dan login pelamar; kelola profil; melamar; verifikasi wajah; chatbot bantuan; lihat status lamaran; lihat jadwal wawancara; registrasi perusahaan; tentukan lokasi outlet; unggah foto outlet; login admin perusahaan; kelola profil perusahaan; kelola lowongan; kelola status lamaran; jadwalkan wawancara; login super admin; verifikasi perusahaan; screening NIB; dan kelola akun admin perusahaan.

## Kebutuhan Nonfungsional SRS

- **Kinerja:** target respons maksimal 3 detik pada kondisi normal hingga 50 pengguna bersamaan.
- **Keamanan:** password di-hash (SRS menyebut bcrypt); validasi input untuk mengurangi risiko SQL injection dan XSS.
- **Kegunaan:** UI intuitif, responsif, dan mudah digunakan.
- **Ketersediaan:** target minimal 95% selama jam operasional, bergantung pada server.
- **Kompatibilitas:** browser modern (Chrome, Edge, Firefox).
- **Portabilitas:** target dapat dijalankan pada XAMPP, Laragon, atau hosting tanpa perubahan besar.
- **Skalabilitas, maintainability, reliability, backup/recovery:** sistem diharapkan dapat dikembangkan, menangani pertumbuhan, memiliki error handling yang jelas, dan mendukung pencadangan/pemulihan.

Angka di atas adalah **target yang tertulis di SRS**, bukan hasil pengukuran atau jaminan bahwa implementasi saat ini telah memenuhinya.

## Model Data dan Hubungan

Diagram kelas/ERD menggambarkan entitas bisnis berikut:

- **Akun dan profil:** `pengguna`, `profil_pelamar`, `profil_perusahaan`, `nib`.
- **Riwayat pelamar:** `skill`, `pendidikan`, `pengalaman_kerja`, `data_wajah`.
- **Lowongan:** `lowongan`, `jenis_dokumen`, `lowongan_dokumen`, `pertanyaan_lowongan`.
- **Lamaran:** `lamaran`, `lamaran_dokumen`, `jawaban_pertanyaan`, `log_status_lamaran`.
- **Wawancara dan notifikasi:** `wawancara`, `notifikasi`.
- **Verifikasi/kehadiran:** `verifikasi_wajah`, `presensi_wawancara`.

Hubungan utama:

- Satu pengguna memiliki profil pelamar atau profil perusahaan sesuai perannya.
- Profil pelamar dapat memiliki banyak skill, pendidikan, pengalaman kerja, dan lamaran; profil dapat memiliki satu referensi data wajah.
- Profil perusahaan dapat memiliki data NIB dan banyak lowongan.
- Lowongan dapat memiliki persyaratan dokumen dan pertanyaan penyaringan.
- Lamaran menghubungkan pelamar dan lowongan, serta dapat memiliki dokumen, jawaban, riwayat status, dan wawancara.
- Pengguna menerima notifikasi. Verifikasi wajah terkait pengguna dan, sesuai konteks, lamaran atau wawancara. Presensi menghubungkan pengguna, wawancara, dan verifikasi yang berhasil.

Daftar ini adalah ringkasan domain dari diagram, bukan pengganti definisi kolom atau relasi database. Untuk skema yang berjalan, baca migrasi Laravel.

## Implementasi yang Terlihat di Repositori

Manifest proyek saat ringkasan ini dibuat menunjukkan:

- Backend: PHP `^8.2`, Laravel `^12.0` (`composer.json`).
- Frontend: React `^19`, Vite, Tailwind CSS (`package.json`).
- Database yang disebut README: MySQL/MariaDB.
- Fitur verifikasi wajah yang didokumentasikan README menggunakan Face++ di backend.
- Ada migrasi NIB serta migrasi `data_wajah`, `verifikasi_wajah`, dan `presensi_wawancara`.

Dokumentasi implementasi dalam README menjelaskan aturan tambahan berikut. Verifikasi untuk pengiriman lamaran harus berhasil, paling lama 30 menit, dan memakai foto profil yang sama. Hasil kamera dikirim ke Face++ dan tidak disimpan aplikasi. Batas percobaan adalah lima per menit per pengguna. Presensi hanya tersedia pada tanggal wawancara menurut `Asia/Jakarta`, selama jadwal masih `Terjadwal` dan lamaran berada pada tahap wawancara. Presensi sukses mencatat kehadiran dan menyelesaikan status jadwal, tetapi tidak mengubah keputusan/status lamaran. Detail ini harus tetap dikonfirmasi terhadap service, controller, migrasi, dan tes terkait sebelum mengubah perilaku.

## Perbedaan Dokumen yang Perlu Diwaspadai

1. **Penomoran chatbot/verifikasi wajah:** tabel kebutuhan pengguna SRS menyebut FR-04.01 untuk verifikasi wajah dan FR-04.02 untuk chatbot. Tabel kebutuhan fungsional menyebut FR-04.01 untuk chatbot, sedangkan use case memberi UC-04.01 untuk verifikasi wajah dan UC-04.02 untuk chatbot. Jangan mengandalkan nomor saja; cocokkan nama fitur dan implementasi.
2. **Stack berubah:** SRS menyebut PHP/Laravel 12, React 19 + Vite, juga mencantumkan Flutter pada lingkungan operasi. `composer.json` dan `package.json` saat ini menunjukkan Laravel 12 dan React 19; jangan mengasumsikan aplikasi Flutter ada.
3. **README mungkin kedaluwarsa:** tabel teknologi README masih menyebut Laravel 11 dan React 18, sedangkan manifest dependency menyatakan Laravel 12 dan React 19. Gunakan manifest untuk versi dependency saat ini.
4. **Rancangan vs kondisi nyata:** diagram dan SRS menjelaskan model/kebutuhan, bukan bukti seluruh fitur sudah selesai. Verifikasi melalui kode, rute, migrasi, serta tes sebelum menyatakan fitur tersedia.
5. **Status dan aturan presensi:** SRS menggambarkan alur rekrutmen umum; README/migrasi terbaru menjelaskan presensi wajah dan aturan waktu tambahan. Periksa implementasi terbaru ketika keduanya berbeda.

## Privasi dan Batasan Data

Foto profil, referensi wajah, skor kemiripan, dokumen NIB, dokumen lamaran, dan riwayat verifikasi adalah data sensitif/pribadi. Jangan menyalinnya ke fixture/contoh/log tanpa kebutuhan, jangan mengekspos kredensial integrasi, dan jaga batas akses serta validasi. README juga menyatakan pencocokan wajah bukan pemeriksaan liveness/anti-spoofing dan bukan bukti keberadaan fisik di lokasi; presensi dapat menyatakan kesiapan untuk wawancara daring.

## Panduan untuk Agen

- Baca migrasi, model, route, service, controller, dan tes sebelum membuat perubahan domain.
- Pertahankan istilah Indonesia yang digunakan kode/API kecuali ada alasan kompatibilitas untuk mengubahnya.
- Jika perbedaan dokumen memengaruhi keputusan produk, jelaskan konflik dan minta keputusan; jangan membuat aturan baru diam-diam.
- Untuk perubahan skema, buat migrasi baru dan pertahankan data yang ada kecuali diminta sebaliknya.
- Jangan menyatakan target kinerja, ketersediaan, keamanan, atau kelengkapan fitur sebagai fakta terverifikasi tanpa pengukuran/bukti dari implementasi.
