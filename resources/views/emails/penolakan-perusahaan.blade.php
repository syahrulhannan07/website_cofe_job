<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pendaftaran Kafe Ditolak</title>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4ece9; margin: 0; padding: 0; }
        .container { max-width: 580px; margin: 32px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(75,46,43,0.08); }
        .header { background: #4B2E2B; padding: 32px; text-align: center; }
        .header h1 { color: #F3EDE6; font-size: 22px; margin: 0; letter-spacing: 0.5px; }
        .header p { color: #F7B750; font-size: 13px; margin: 6px 0 0; }
        .body { padding: 32px; }
        .greeting { font-size: 16px; color: #4B2E2B; font-weight: 600; margin-bottom: 12px; }
        .body p { font-size: 14px; color: #504440; line-height: 1.7; margin: 0 0 16px; }
        .info-box { background: #F4ECE9; border-left: 4px solid #C98285; border-radius: 6px; padding: 14px 18px; margin: 16px 0; }
        .info-box p { margin: 6px 0; font-size: 14px; color: #504440; }
        .info-box strong { color: #4B2E2B; }
        .footer { background: #F4ECE9; padding: 20px 32px; text-align: center; font-size: 12px; color: #9E8A85; }
        .footer a { color: #4B2E2B; text-decoration: none; }
    </style>
</head>
<body>
<div class="container">
    <!-- [UPDATE LOGIC] -->
    <div class="header">
        <h1>C.A.F.E. E-Recruitment</h1>
        <p>Pendaftaran Perusahaan Ditolak</p>
    </div>
    <div class="body">
        <p class="greeting">Halo, {{ optional($profilPerusahaan->pengguna)->nama_pengguna ?? 'Admin Kafe' }}!</p>
        <p>Terima kasih telah mendaftarkan kafe Anda <strong>{{ $profilPerusahaan->nama_perusahaan }}</strong> pada platform C.A.F.E. E-Recruitment.</p>
        
        <p>Mohon maaf, setelah melakukan verifikasi berkas dan profil kafe, Super Admin memutuskan untuk <strong>menolak</strong> pendaftaran akun Anda.</p>
        
        <div class="info-box">
            <p>☕ <strong>Nama Kafe:</strong> {{ $profilPerusahaan->nama_perusahaan }}</p>
            <p>❌ <strong>Status Verifikasi:</strong> Ditolak</p>
            <p>⚠️ <strong>Alasan Penolakan:</strong></p>
            <p style="color: #BA1A1A; font-weight: bold; background: #fff; padding: 10px; border-radius: 4px; border: 1px solid #C98285; margin-top: 8px;">
                "{{ $alasanPenolakan }}"
            </p>
        </div>

        <p>Anda dapat melakukan pendaftaran ulang dengan menggunakan berkas atau data yang benar sesuai dengan alasan penolakan di atas.</p>
        <p style="text-align: center; margin: 24px 0;">
            <a href="{{ url('/daftar-perusahaan') }}" style="background: #4B2E2B; color: #F3EDE6; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">Daftar Ulang</a>
        </p>
    </div>
    <div class="footer">
        <p>Email ini dikirim secara otomatis oleh sistem C.A.F.E. E-Recruitment. Harap tidak membalas email ini.</p>
        <p>&copy; {{ date('Y') }} C.A.F.E. E-Recruitment. All rights reserved.</p>
    </div>
</div>
</body>
</html>
