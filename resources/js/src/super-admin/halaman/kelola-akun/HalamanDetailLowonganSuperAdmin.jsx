import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ikonTglPub from '../../aset/akun admin/tglpub.svg';
import ikonTglTutup from '../../aset/akun admin/tgltutup.svg';
const HalamanDetailLowonganSuperAdmin = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [sedangProses, setSedangProses] = useState(false);
    const [notifikasi, setNotifikasi] = useState(null);

    // Mock data repository matching IDs in ModalDetailAdmin
    const DATA_LOWONGAN = {
        '1': {
            id: 1,
            posisi: 'Senior Barista',
            perusahaan: 'Kopi Kenangan',
            lokasi: 'Grand Indonesia, Jakarta',
            gaji: 'Rp 5.500.000 - Rp 7.200.000',
            status: 'Aktif',
            terdeteksi: true, // Flagged by the system as potential violation
            tanggal: '12 Agustus 2024',
            batas: '30 September 2024',
            deskripsi: [
                'Kami mencari Senior Barista yang berpengalaman dan memiliki passion tinggi di dunia kopi untuk memimpin shift di outlet flagship kami. Anda tidak hanya akan menyajikan kopi berkualitas tinggi, tetapi juga menjadi mentor bagi barista junior dan memastikan operasional bar berjalan dengan standar Kopi Kenangan yang ketat.',
                'Tanggung jawab utama mencakup manajemen stok harian, memastikan kebersihan area kerja (HACCP), serta memberikan pelayanan pelanggan yang luar biasa yang membuat setiap kunjungan terasa personal dan hangat.'
            ],
            kualifikasi: [
                'Minimal 2 tahun pengalaman sebagai Barista (pengalaman Senior/Lead lebih disukai).',
                'Memahami teknik manual brew, kalibrasi espresso, dan latte art tingkat lanjut. Kemampuan kepemimpinan yang baik dan mampu bekerja di bawah tekanan tinggi.',
                'Bersedia bekerja dalam sistem shift, termasuk akhir pekan dan hari libur nasional. Pendidikan minimal SMA/SMK (Perhotelan atau Pariwisata menjadi nilai tambah).'
            ],
            pertanyaan: [
                'Sebutkan 3 teknik kalibrasi espresso yang Anda kuasai?',
                'Berapa lama pengalaman Anda menggunakan mesin La Marzocco?'
            ]
        },
        '2': {
            id: 2,
            posisi: 'Cafe Supervisor',
            perusahaan: 'Janji Jiwa',
            lokasi: 'Hargeulis, Indramayu',
            gaji: 'Rp 6.000.000 - Rp 8.000.000',
            status: 'Aktif',
            terdeteksi: false,
            tanggal: '15 Agustus 2024',
            batas: '05 Oktober 2024',
            deskripsi: [
                'Dibutuhkan Supervisor Cafe yang enerjik untuk memimpin operasional harian outlet Janji Jiwa. Posisi ini bertanggung jawab atas kepuasan pelanggan, pencapaian target penjualan, dan kepatuhan standar SOP.',
                'Tugas harian meliputi manajemen staf bar, penyusunan jadwal kerja shift, pelaporan keuangan kasir harian, dan kontrol kualitas produk kopi.'
            ],
            kualifikasi: [
                'Minimal 1 tahun pengalaman sebagai supervisor atau team leader di industri F&B.',
                'Keterampilan komunikasi yang luar biasa and berjiwa kepemimpinan tinggi.',
                'Mahir dalam penggunaan POS system dan Microsoft Excel dasar.',
                'Sikap kerja positif, jujur, rajin, dan disiplin tinggi.'
            ],
            pertanyaan: [
                'Bagaimana cara Anda memotivasi tim di jam-jam sibuk outlet?',
                'Sebutkan pengalaman Anda dalam menyelesaikan komplain pelanggan?'
            ]
        },
        '3': {
            id: 3,
            posisi: 'Store Crew',
            perusahaan: 'Fore Coffee',
            lokasi: 'Jatibarang, Indramayu',
            gaji: 'Rp 4.500.000 - Rp 5.500.000',
            status: 'Draft',
            terdeteksi: false,
            tanggal: '18 Agustus 2024',
            batas: '10 Oktober 2024',
            deskripsi: [
                'Mencari Store Crew barista magang maupun penuh waktu untuk gerai Fore Coffee Jatibarang. Terbuka bagi lulusan baru yang bersemangat mempelajari keahlian penyeduhan kopi modern.',
                'Membantu dalam melayani pesanan kasir, menyajikan menu kopi standar Fore, serta menjaga kelancaran antrean pelanggan.'
            ],
            kualifikasi: [
                'Terbuka untuk lulusan baru (Fresh Graduate) SMA/SMK sederajat.',
                'Memiliki ketertarikan tinggi terhadap kopi dan pelayanan F&B.',
                'Berpenampilan rapi, bersih, ramah, dan komunikatif.',
                'Bersedia bekerja paruh waktu atau sistem shift.'
            ],
            pertanyaan: [
                'Mengapa Anda tertarik untuk berkarier di industri kopi Fore?',
                'Apakah Anda bersedia bekerja di hari libur atau akhir pekan?'
            ]
        }
    };

    // Fallback if ID is not matched
    const lowongan = DATA_LOWONGAN[id] || DATA_LOWONGAN['1'];
    const [statusHalaman, setStatusHalaman] = useState(lowongan.status);

    const tampilNotif = (tipe, pesan) => {
        setNotifikasi({ tipe, pesan });
        setTimeout(() => setNotifikasi(null), 4000);
    };

    const tanganiBlokir = async () => {
        setSedangProses(true);
        // Simulate API delay
        await new Promise(r => setTimeout(r, 600));
        setStatusHalaman('Nonaktif');
        setSedangProses(false);
        tampilNotif('sukses', 'Lowongan ini berhasil diblokir dari platform.');
    };

    const tanganiAbaikan = async () => {
        setSedangProses(true);
        // Simulate API delay
        await new Promise(r => setTimeout(r, 600));
        setStatusHalaman('Aktif');
        setSedangProses(false);
        tampilNotif('info', 'Laporan lowongan telah diabaikan. Status tetap aktif.');
    };

    return (
        <div className="halaman-detail-lowongan w-full min-h-screen bg-[#F4ECE9] p-8 md:p-10 flex flex-col gap-6" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {/* Toast Notification Banner */}
            {notifikasi && (
                <div className={`toast-notifikasi fixed top-6 right-6 z-50 px-6 py-4 rounded-[12px] shadow-xl text-[14.5px] font-bold transition-all border ${
                    notifikasi.tipe === 'sukses'
                        ? 'bg-[#FEF2F2] border-[#FCA5A5] text-[#991B1B]'
                        : 'bg-[#4B2E2B] border-[#EAE4DC]/20 text-[#F7B750]'
                }`} style={{ fontFamily: 'Poppins, sans-serif' }}>
                    <div className="toast-content flex items-center gap-3">
                        <span className="toast-indicator w-2.5 h-2.5 rounded-full bg-current animate-ping" />
                        {notifikasi.pesan}
                    </div>
                </div>
            )}

            {/* Back Button Navigation Row */}
            <div className="kembali-row flex items-center">
                <button
                    onClick={() => navigate('/super-admin/kelola-akun')}
                    className="btn-kembali flex items-center gap-2.5 px-4 py-2 bg-white hover:bg-[#EAE4DC]/50 border border-[#EAE4DC] text-[#4B2E2B] rounded-full text-[14px] font-bold transition-all duration-300 shadow-sm cursor-pointer hover:-translate-x-0.5"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                    Kembali ke Kelola Akun
                </button>
            </div>

            {/* ── HEADER CARD SECTION ── */}
            <div className="header-card  p-8  flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="header-info flex flex-col gap-2">
                    {/* Badge and ID */}
                    <div className="header-badge-row flex items-center gap-3">
                        <span className={`badge-status px-3 py-1 rounded-full text-[12px] font-bold tracking-wide flex items-center gap-1.5 ${
                            statusHalaman === 'Aktif'
                                ? 'bg-[#DCFCE7] text-[#15803D]'
                                : 'bg-[#FEE2E2] text-[#B91C1C]'
                        }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusHalaman === 'Aktif' ? 'bg-[#22C55E]' : 'bg-[#EF4444]'}`} />
                            {statusHalaman.toUpperCase()}
                        </span>

                        {lowongan.terdeteksi && (
                            <span className="badge-terdeteksi px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wider bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] flex items-center gap-1.5 shadow-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] animate-pulse" />
                                TERDETEKSI SISTEM
                            </span>
                        )}

                        <span className="header-id text-[12px] font-bold text-[#827470] tracking-[1.2px]">
                            ID: JOB-2024-{100 + lowongan.id}
                        </span>
                    </div>

                    {/* Job Position Title */}
                    <h1 className="header-judul font-bold text-[36px] tracking-tight leading-tight text-[#2B1810]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {lowongan.posisi}
                    </h1>

                    {/* Meta Rows (Location & Salary) */}
                    <div className="header-meta-row flex flex-wrap items-center gap-x-6 gap-y-2 mt-1 text-[#827470] font-semibold text-[14px]">
                        {/* Company & Location */}
                        <div className="header-meta-item flex items-center gap-2">
                            <svg className="w-[18px] h-[18px] text-[#F7B750]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                            </svg>
                            <span>{lowongan.perusahaan}, {lowongan.lokasi}</span>
                        </div>

                        {/* Salary */}
                        <div className="header-meta-item flex items-center gap-2">
                            <svg className="w-[18px] h-[18px] text-[#F7B750]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.22.11a3.118 3.118 0 004.56 0a3.118 3.118 0 000-4.364a3.118 3.118 0 00-4.56 0a3.118 3.118 0 000 4.364M12 6v12m-3-12h6M9 18h6" />
                            </svg>
                            <span>{lowongan.gaji}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── TWO-COLUMN CONTENT GRID ── */}
            <div className="grid-layout grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left 2 Columns: Vacancy details */}
                <div className="main-content-column lg:col-span-2 flex flex-col gap-6">
                    {/* Job Description Card */}
                    <div className="deskripsi-card bg-white rounded-[20px] border border-[#EAE4DC]/60 p-8 shadow-[0_8px_30px_-6px_rgba(67,44,35,0.02)]">
                        <div className="card-header-row flex items-center gap-3 mb-4">
                            <div className="card-header-accent w-[4px] h-[24px] rounded-full bg-[#F7B750]" />
                            <h3 className="card-header-title font-bold text-[20px] text-[#2B1810]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Deskripsi Pekerjaan
                            </h3>
                        </div>
                        <div className="deskripsi-isi flex flex-col gap-4 text-[15px] font-medium leading-[26px] text-[#4B2E2B] text-left">
                            {lowongan.deskripsi.map((para, i) => (
                                <p key={i}>{para}</p>
                            ))}
                        </div>
                    </div>

                    {/* Requirements & Qualifications Card */}
                    <div className="kualifikasi-card bg-white rounded-[20px] border border-[#EAE4DC]/60 p-8 shadow-[0_8px_30px_-6px_rgba(67,44,35,0.02)]">
                        <div className="card-header-row flex items-center gap-3 mb-5">
                            <div className="card-header-accent w-[4px] h-[24px] rounded-full bg-[#F7B750]" />
                            <h3 className="card-header-title font-bold text-[20px] text-[#2B1810]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Persyaratan & Kualifikasi
                            </h3>
                        </div>
                        <ul className="kualifikasi-daftar flex flex-col gap-4">
                            {lowongan.kualifikasi.map((req, i) => (
                                <li key={i} className="kualifikasi-item flex gap-3.5 text-[15px] text-[#4B2E2B] font-medium leading-[24px] text-left">
                                    <span className="kualifikasi-bullet text-[#F7B750] text-[20px] leading-[18px]">•</span>
                                    <span>{req}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Screening Questions Card */}
                    <div className="pertanyaan-card border border-[#EAE4DC] rounded-[20px] p-8 shadow-[inset_0_2px_8px_rgba(67,44,35,0.01)]">
                        <div className="card-header-row flex items-center gap-3 mb-5">
                            <div className="card-header-accent w-[4px] h-[24px] rounded-full bg-[#835500]" />
                            <h3 className="card-header-title font-bold text-[20px] text-[#2B1810]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Pertanyaan Perusahaan
                            </h3>
                        </div>
                        <div className="pertanyaan-daftar flex flex-col gap-4">
                            {lowongan.pertanyaan.map((q, idx) => (
                                <div key={idx} className="pertanyaan-item bg-white border border-[#EAE4DC] rounded-[16px] p-5 flex items-center gap-4 shadow-sm">
                                    <div className="pertanyaan-nomor w-9 h-9 rounded-full bg-[#FFEDD5] text-[#2B1800] flex items-center justify-center font-bold text-[15px] flex-shrink-0">
                                        {idx + 1}
                                    </div>
                                    <p className="pertanyaan-teks text-[15.5px] font-semibold text-[#2B1810] text-left">
                                        {q}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right 1 Column: Metadata & Moderation */}
                <div className="sidebar-column lg:col-span-1 flex flex-col gap-6">
                    {/* Vacancy Info Metadata Card */}
                    <div className="info-lowongan-card bg-white rounded-[20px] border border-[#EAE4DC]/60 p-6 shadow-[0_8px_30px_-6px_rgba(67,44,35,0.02)] flex flex-col gap-5">
                        <h4 className="sidebar-section-title font-bold text-[13px] tracking-wider text-[#827470] uppercase mb-1">
                            Informasi Lowongan
                        </h4>

                        {/* Published Date */}
                        <div className="info-item flex flex-col gap-2">
                            <span className="info-label text-[12px] font-semibold text-[#827470]">
                                Tanggal Publikasi
                            </span>
                            <div className="info-value flex items-center gap-3 text-[#2B1810] font-bold text-[15px]">
                                <img src={ikonTglPub} alt="Tanggal Publikasi" className="w-[18px] h-[20px] object-contain" />
                                <span>{lowongan.tanggal}</span>
                            </div>
                        </div>

                        <div className="info-separator h-[1px] bg-[#EAE4DC]/80 w-full" />

                        {/* Closing Date */}
                        <div className="info-item flex flex-col gap-2">
                            <span className="info-label text-[12px] font-semibold text-[#827470]">
                                Batas Penutupan
                            </span>
                            <div className="info-value flex items-center gap-3 text-[#B91C1C] font-bold text-[15px]">
                                <img src={ikonTglTutup} alt="Batas Penutupan" className="w-[18px] h-[20px] object-contain" />
                                <span>{lowongan.batas}</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default HalamanDetailLowonganSuperAdmin;
