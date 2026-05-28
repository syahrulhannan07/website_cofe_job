@component('mail::message')
# Pendaftaran Kafe Ditolak ❌

Halo **{{ $namaPengguna }}**,

Kami menyampaikan bahwa pendaftaran kafe **{{ $namaKafe }}** pada platform **Cafe Job** belum dapat kami setujui pada saat ini.

---

@component('mail::panel')
**Alasan Penolakan:**

{{ $alasan }}
@endcomponent

---

Apabila Anda merasa ada kesalahan atau ingin melakukan perbaikan, silakan hubungi tim kami atau daftarkan kembali akun Anda dengan dokumen yang telah dilengkapi.

Terima kasih telah mempercayakan rekrutmen Anda kepada platform **Cafe Job**.

Salam hangat,<br>
**Tim Cafe Job**
@endcomponent
