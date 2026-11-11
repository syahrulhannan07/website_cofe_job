<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Daftar host OSS yang diizinkan untuk validasi URL QR Code NIB
    |--------------------------------------------------------------------------
    |
    | Hanya host yang dicantumkan secara eksplisit di bawah ini yang dianggap
    | domain OSS resmi. Pencocokan dilakukan secara tepat (exact match) pada
    | hostname. Subdomain, domain mirip, dan IP address tidak dipercayai
    | secara otomatis.
    |
    | BUKTI VERIFIKASI (berdasarkan riset dokumentasi resmi OSS):
    | - oss.go.id: Portal resmi OSS (Online Single Submission) yang dikelola
    |   Lembaga OSS / Kementerian Investasi dan Hilirisasi (BKPM) RI.
    |   Terlihat pada https://oss.go.id/ dan https://oss.go.id/id sebagai
    |   Sistem Perizinan Berusaha Terintegrasi Secara Elektronik.
    |
    | TIDAK dimasukkan (tidak terverifikasi sebagai host verifikasi NIB):
    | - www.oss.go.id (subdomain, belum diverifikasi)
    | - ui-login.oss.go.id (halaman login, bukan host verifikasi NIB)
    | - s3.oss.go.id (penyimpanan berkas panduan, bukan host verifikasi NIB)
    | - oss.go.id.example.com, oss-go.id, ossgo.id (domain tiruan)
    |
    | Tidak ada dokumentasi API publik resmi untuk verifikasi NIB yang
    | ditemukan pada fase ini. Pola path/query untuk verifikasi NIB melalui
    | QR Code juga belum terverifikasi. Hasil validasi hanya menyatakan
    | domain tepercaya, bukan bukti keaslian NIB.
    */

    'allowed_hosts' => [
        'oss.go.id',
    ],

];
