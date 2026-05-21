<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Update Status Lamaran</title>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4ece9; margin: 0; padding: 0; }
        .container { max-width: 580px; margin: 32px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(75,46,43,0.08); }
        .header { background: #4B2E2B; padding: 32px; text-align: center; }
        .header h1 { color: #F3EDE6; font-size: 22px; margin: 0; letter-spacing: 0.5px; }
        .header p { color: #F7B750; font-size: 13px; margin: 6px 0 0; }
        .body { padding: 32px; }
        .greeting { font-size: 16px; color: #4B2E2B; font-weight: 600; margin-bottom: 12px; }
        .body p { font-size: 14px; color: #504440; line-height: 1.7; margin: 0 0 16px; }
        .status-badge { display: inline-block; padding: 8px 22px; border-radius: 50px; font-size: 15px; font-weight: 700; margin: 4px 0 20px; }
        .status-wawancara { background: #FFE6BD; color: #B08949; }
        .status-diterima   { background: #DBFEE6; color: #509564; }
        .status-ditolak    { background: #FEEBEB; color: #A04A4A; }
        .status-diproses   { background: #DBEAFE; color: #496B99; }
        .info-box { background: #F4ECE9; border-left: 4px solid #F7B750; border-radius: 6px; padding: 14px 18px; margin: 16px 0; }
        .info-box p { margin: 4px 0; font-size: 13px; color: #504440; }
        .info-box strong { color: #4B2E2B; }
        .footer { background: #F4ECE9; padding: 20px 32px; text-align: center; font-size: 12px; color: #9E8A85; }
        .footer a { color: #4B2E2B; text-decoration: none; }
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <h1>C.A.F.E. E-Recruitment</h1>
        <p>Notifikasi Status Lamaran</p>
    </div>
    <div class="body">
        <p class="greeting">Halo, {{ $namaLengkap }}!</p>
        <p>Ada kabar terbaru mengenai lamaran Anda untuk posisi <strong>{{ $posisi }}</strong> di <strong>{{ $namaPerusahaan }}</strong>.</p>

        <p>Status lamaran Anda saat ini:</p>
        @php
            $badgeClass = match($statusBaru) {
                'Wawancara' => 'status-wawancara',
                'Diterima'  => 'status-diterima',
                'Ditolak'   => 'status-ditolak',
                default     => 'status-diproses',
            };
        @endphp
        <span class="status-badge {{ $badgeClass }}">{{ $statusBaru }}</span>

        <div class="info-box">
            @if($statusBaru === 'Wawancara')
                <p>🎉 <strong>Selamat!</strong> Anda terpilih untuk mengikuti tahap wawancara. Tim kami akan segera menghubungi Anda untuk informasi jadwal lebih lanjut.</p>
            @elseif($statusBaru === 'Diterima')
                <p>🎉 <strong>Selamat!</strong> Anda resmi dinyatakan <strong>DITERIMA</strong> untuk bergabung di {{ $namaPerusahaan }}. Selamat datang di tim kami!</p>
            @elseif($statusBaru === 'Ditolak')
                <p>Terima kasih atas waktu dan usaha Anda. Mohon maaf, lamaran Anda belum dapat kami proses ke tahap selanjutnya pada kesempatan ini. Jangan menyerah dan tetap semangat!</p>
            @else
                <p>Lamaran Anda sedang dalam proses peninjauan oleh tim {{ $namaPerusahaan }}. Harap bersabar dan kami akan segera memberikan kabar selanjutnya.</p>
            @endif
        </div>

        <p>Anda dapat login ke akun C.A.F.E. Anda untuk melihat detail perkembangan lamaran secara lengkap.</p>
    </div>
    <div class="footer">
        <p>Email ini dikirim otomatis oleh sistem C.A.F.E. E-Recruitment. Harap tidak membalas email ini.</p>
        <p>&copy; {{ date('Y') }} C.A.F.E. E-Recruitment. All rights reserved.</p>
    </div>
</div>
</body>
</html>
