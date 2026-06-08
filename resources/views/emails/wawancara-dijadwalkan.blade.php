@component('mail::message')
# Undangan Wawancara 📞

Halo **{{ $namaPengguna }}**,

Selamat! Anda mendapatkan undangan wawancara untuk posisi **{{ $posisi }}** di **{{ $namaKafe }}**. Berikut adalah detail jadwal wawancara Anda:

---

@component('mail::table')
| Detail | Informasi |
|:---|:---|
| 📅 **Tanggal & Waktu** | {{ $tanggal }} |
| 📍 **Lokasi** | {{ $lokasi }} |
| 🔗 **Tempat / Link Meet** | {{ $tempatLink }} |
| 📝 **Catatan** | {{ $catatan ?: '-' }} |
@endcomponent

---

> Harap hadir **10 menit sebelum** jadwal dimulai. Pastikan koneksi internet Anda stabil jika wawancara dilakukan secara online.

Semangat dan sukses untuk wawancara Anda!

Salam hangat,<br>
**Tim Cafe Job**
@endcomponent
