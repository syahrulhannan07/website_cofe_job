<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Undangan Wawancara</title>
    <style>
        /* Import Google Fonts - some email clients support this */
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        
        body { 
            font-family: 'Plus Jakarta Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            background-color: #F7F3EE; 
            margin: 0; 
            padding: 0; 
            -webkit-font-smoothing: antialiased;
        }
        
        .email-wrapper {
            width: 100%;
            background-color: #F7F3EE;
            padding: 40px 0;
        }

        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: #FFFFFF; 
            border-radius: 16px; 
            overflow: hidden; 
            box-shadow: 0 4px 24px rgba(67, 44, 35, 0.08); 
        }
        
        /* Header Area */
        .header { 
            background: #432C23; 
            padding: 40px 32px; 
            text-align: center;
            position: relative;
        }
        .header h1 { 
            color: #FFFFFF; 
            font-size: 26px; 
            font-weight: 700;
            margin: 0; 
            letter-spacing: -0.5px; 
        }
        .header p { 
            color: #FEAE2C; 
            font-size: 14px; 
            font-weight: 500;
            margin: 8px 0 0; 
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        /* Body Area */
        .body { 
            padding: 40px 32px; 
        }
        .greeting { 
            font-size: 18px; 
            color: #2B1810; 
            font-weight: 700; 
            margin-top: 0;
            margin-bottom: 16px; 
        }
        .message { 
            font-size: 15px; 
            color: #504440; 
            line-height: 1.6; 
            margin: 0 0 24px; 
        }
        .highlight {
            color: #2B1810;
            font-weight: 600;
        }

        /* Schedule Card */
        .schedule-card { 
            background: #FDF9F4; 
            border: 1px solid #E6E2DE; 
            border-radius: 12px; 
            padding: 24px; 
            margin: 24px 0; 
        }
        .schedule-title {
            font-size: 13px;
            color: #92400E;
            text-transform: uppercase;
            font-weight: 700;
            letter-spacing: 0.5px;
            margin-top: 0;
            margin-bottom: 16px;
            border-bottom: 1px solid #E6E2DE;
            padding-bottom: 12px;
        }
        
        .schedule-item {
            display: table;
            width: 100%;
            margin-bottom: 12px;
        }
        .schedule-item:last-child {
            margin-bottom: 0;
        }
        
        .item-icon {
            display: table-cell;
            width: 24px;
            vertical-align: top;
            font-size: 16px;
            padding-top: 2px;
        }
        .item-label {
            display: table-cell;
            width: 120px;
            font-size: 14px;
            color: #6B7280;
            vertical-align: top;
            padding-top: 2px;
        }
        .item-value {
            display: table-cell;
            font-size: 15px;
            color: #2B1810;
            font-weight: 600;
            vertical-align: top;
        }
        
        .catatan-box {
            background: #FFFBEB;
            border-left: 4px solid #F59E0B;
            padding: 12px 16px;
            margin-top: 20px;
            border-radius: 0 8px 8px 0;
        }
        .catatan-box p {
            margin: 0;
            font-size: 14px;
            color: #92400E;
            line-height: 1.5;
        }

        /* Call to Action Button */
        .btn-wrapper {
            text-align: center;
            margin: 32px 0 24px;
        }
        .btn {
            display: inline-block;
            background-color: #FEAE2C;
            color: #6B4500;
            font-weight: 600;
            font-size: 15px;
            text-decoration: none;
            padding: 14px 28px;
            border-radius: 50px;
        }

        /* Footer Area */
        .footer { 
            background: #EFE9E2; 
            padding: 24px 32px; 
            text-align: center; 
        }
        .footer p {
            font-size: 12px; 
            color: #8C7B76; 
            margin: 0 0 8px;
            line-height: 1.5;
        }
        .footer p:last-child {
            margin-bottom: 0;
        }
        .footer-logo {
            font-weight: 700;
            color: #432C23;
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="container">
            <!-- Header -->
            <div class="header">
                <h1>C.A.F.E. Job Portal</h1>
                <p>Undangan Wawancara Kerja</p>
            </div>
            
            <!-- Body -->
            <div class="body">
                <p class="greeting">Halo, {{ $namaLengkap }}!</p>
                <p class="message">
                    Selamat! Kami sangat antusias menyampaikan bahwa Anda terpilih untuk melanjutkan ke tahap wawancara kerja untuk posisi <span class="highlight">{{ $posisi }}</span> di <span class="highlight">{{ $namaPerusahaan }}</span>.
                </p>
                
                <p class="message">Berikut adalah rincian jadwal pertemuan Anda:</p>
                
                <!-- Schedule Card -->
                <div class="schedule-card">
                    <p class="schedule-title">Rincian Jadwal Wawancara</p>
                    
                    <div class="schedule-item">
                        <div class="item-icon">📅</div>
                        <div class="item-label">Hari, Tanggal</div>
                        <div class="item-value">{{ \Carbon\Carbon::parse($wawancara->tanggal_wawancara)->translatedFormat('l, d F Y') }}</div>
                    </div>
                    
                    <div class="schedule-item">
                        <div class="item-icon">⏰</div>
                        <div class="item-label">Waktu</div>
                        <div class="item-value">{{ \Carbon\Carbon::parse($wawancara->tanggal_wawancara)->format('H:i') }} WIB</div>
                    </div>
                    
                    <div class="schedule-item">
                        <div class="item-icon">📍</div>
                        <div class="item-label">Lokasi / Link</div>
                        <div class="item-value">{{ $wawancara->lokasi }}</div>
                    </div>

                    @if($wawancara->catatan)
                    <div class="catatan-box">
                        <p><strong>Catatan Tambahan:</strong><br/>{{ $wawancara->catatan }}</p>
                    </div>
                    @endif
                </div>

                <p class="message">
                    Harap persiapkan diri Anda dengan baik dan pastikan untuk hadir/bergabung tepat waktu. Apabila Anda memiliki pertanyaan, berhalangan hadir, atau membutuhkan penyesuaian jadwal, silakan hubungi perusahaan secepatnya.
                </p>

                <p class="message" style="margin-bottom: 0;">
                    Terima kasih dan semoga sukses!<br/>
                    <strong style="color: #432C23; display: inline-block; margin-top: 12px;">Tim Rekrutmen {{ $namaPerusahaan }}</strong>
                </p>
            </div>
            
            <!-- Footer -->
            <div class="footer">
                <p>Email ini dikirim secara otomatis oleh sistem <span class="footer-logo">C.A.F.E. Job Portal</span>. Harap tidak membalas email ini secara langsung ke alamat pengirim.</p>
                <p>&copy; {{ date('Y') }} Hak Cipta Dilindungi.</p>
            </div>
        </div>
    </div>
</body>
</html>
