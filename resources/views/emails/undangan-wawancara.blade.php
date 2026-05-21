<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Undangan Wawancara</title>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4ece9; margin: 0; padding: 0; }
        .container { max-width: 580px; margin: 32px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(75,46,43,0.08); }
        .header { background: #4B2E2B; padding: 32px; text-align: center; }
        .header h1 { color: #F3EDE6; font-size: 22px; margin: 0; letter-spacing: 0.5px; }
        .header p { color: #F7B750; font-size: 13px; margin: 6px 0 0; }
        .body { padding: 32px; }
        .greeting { font-size: 16px; color: #4B2E2B; font-weight: 600; margin-bottom: 12px; }
        .body p { font-size: 14px; color: #504440; line-height: 1.7; margin: 0 0 16px; }
        .info-box { background: #F4ECE9; border-left: 4px solid #F7B750; border-radius: 6px; padding: 14px 18px; margin: 16px 0; }
        .info-box p { margin: 6px 0; font-size: 14px; color: #504440; }
        .info-box strong { color: #4B2E2B; }
        .footer { background: #F4ECE9; padding: 20px 32px; text-align: center; font-size: 12px; color: #9E8A85; }
        .footer a { color: #4B2E2B; text-decoration: none; }
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <h1>C.A.F.E. E-Recruitment</h1>
        <p>Undangan Wawancara Kerja</p>
    </div>
    <div class="body">
        <p class="greeting">Halo, {{ $namaLengkap }}!</p>
        <p>Selamat! Anda diundang untuk mengikuti sesi wawancara kerja untuk posisi <strong>{{ $posisi }}</strong> di <strong>{{ $namaPerusahaan }}</strong>.</p>
        
        <p>Berikut adalah rincian jadwal wawancara Anda:</p>
        
        <div class="info-box">
            <p>🗓️ <strong>Hari / Tanggal:</strong> {{ \Carbon\Carbon::parse($wawancara->tanggal_wawancara)->translatedFormat('l, d F Y') }}</p>
            <p>⏰ <strong>Waktu:</strong> {{ \Carbon\Carbon::parse($wawancara->tanggal_wawancara)->format('H:i') }} WIB</p>
            <p>📍 <strong>Tempat / Link:</strong> {{ $wawancara->lokasi }}</p>
            @if($wawancara->catatan)
                <p>📝 <strong>Catatan Tambahan:</strong> {{ $wawancara->catatan }}</p>
            @endif
        </div>

        <p>Harap persiapkan diri Anda dengan baik dan pastikan untuk hadir tepat waktu sesuai dengan jadwal yang telah ditentukan. Jika Anda berhalangan hadir atau membutuhkan perubahan jadwal, silakan hubungi kami sesegera mungkin.</p>
    </div>
    <div class="footer">
        <p>Email ini dikirim secara otomatis oleh sistem C.A.F.E. E-Recruitment. Harap tidak membalas email ini.</p>
        <p>&copy; {{ date('Y') }} C.A.F.E. E-Recruitment. All rights reserved.</p>
    </div>
</div>
</body>
</html>
