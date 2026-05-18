import React, { useState, useEffect } from 'react';
import ikonTglPub from '../../../aset/akun admin/tglpub.svg';
import ikonTglTutup from '../../../aset/akun admin/tgltutup.svg';

const ModalDetailLowongan = ({ lowongan, onTutup, onBlokir, onAbaikan }) => {
    const [skalaModal, setSkalaModal] = useState(1);
    const [sedangProses, setSedangProses] = useState(false);

    // Proportional auto-scaling to prevent scrollbars and fit viewport beautifully
    useEffect(() => {
        const hitungSkala = () => {
            const tTinggi = window.innerHeight;
            const tLebar = window.innerWidth;

            // Height margin 40px, design base is 666px
            const skalaH = (tTinggi - 40) / 680;
            // Width margin 40px, design base is 973px
            const skalaW = (tLebar - 40) / 973;

            // Limit scaling between 0.65 and 1.0
            const skalaAkhir = Math.min(1.0, Math.max(0.65, Math.min(skalaH, skalaW)));
            setSkalaModal(skalaAkhir);
        };

        window.addEventListener('resize', hitungSkala);
        hitungSkala();

        return () => window.removeEventListener('resize', hitungSkala);
    }, []);

    if (!lowongan) return null;

    const tanganiBlokir = async () => {
        setSedangProses(true);
        try {
            if (onBlokir) await onBlokir(lowongan);
            onTutup();
        } catch (err) {
            console.error(err);
        } finally {
            setSedangProses(false);
        }
    };

    const tanganiAbaikan = async () => {
        setSedangProses(true);
        try {
            if (onAbaikan) await onAbaikan(lowongan);
            onTutup();
        } catch (err) {
            console.error(err);
        } finally {
            setSedangProses(false);
        }
    };

    return (
        <div
            className="modal-overlay fixed inset-0 bg-[#1c120e]/90 backdrop-blur-md z-[60] flex items-center justify-center p-4 transition-all duration-300 animate-in fade-in"
            onClick={(e) => e.target === e.currentTarget && onTutup()}
            role="dialog"
            aria-modal="true"
        >
            {/* Modal Box: Width 973px, Height 680px, responsive absolute center scaling */}
            <div
                className="modal-container bg-[#FAF8F6] rounded-[25px] shadow-[0_25px_60px_-15px_rgba(43,24,16,0.5)] overflow-hidden flex flex-col absolute transition-all duration-300 animate-in fade-in zoom-in-95 duration-200"
                style={{
                    width: '973px',
                    height: '680px',
                    maxWidth: '973px',
                    maxHeight: '680px',
                    top: '50%',
                    left: '50%',
                    transform: `translate(-50%, -50%) scale(${skalaModal})`,
                    transformOrigin: 'center center',
                }}
            >
                {/* Close Button at top-right */}
                <button
                    onClick={onTutup}
                    className="btn-tutup absolute right-6 top-6 w-[36px] h-[36px] rounded-full bg-[#EAE4DC] hover:bg-[#FEAE2C]/20 text-[#4B2E2B] flex items-center justify-center text-[22px] transition-all cursor-pointer font-bold focus:outline-none z-30"
                    title="Kembali"
                >
                    ×
                </button>

                {/* ── HEADER SECTION ── */}
                <div
                    className="modal-header w-full bg-white px-8 flex flex-col justify-center border-b border-[#EAE4DC] relative flex-shrink-0"
                    style={{
                        height: '155px',
                        boxShadow: '0 4px 20px -4px rgba(67, 44, 35, 0.06)',
                    }}
                >
                    {/* Badge and ID Row */}
                    <div className="modal-badge-row flex items-center gap-3 mb-2">
                        {/* Status Badge */}
                        <div
                            className="badge-status px-3 py-1 bg-[#F7B750] text-[#4B2E2B] rounded-full text-[12px] font-bold tracking-wide flex items-center gap-1.5"
                            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                        >
                            <span className="badge-indicator w-1.5 h-1.5 rounded-full bg-[#4B2E2B]" />
                            {lowongan.status.toUpperCase()}
                        </div>

                        {/* Vacancy ID */}
                        <span
                            className="modal-id text-[12px] font-semibold text-[#827470] tracking-[1.2px]"
                            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                        >
                            ID: JOB-2024-089
                        </span>
                    </div>

                    {/* Job Title */}
                    <h2
                        className="modal-judul font-bold text-[32px] tracking-tight leading-tight text-[#2B1810] mb-2.5"
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                        {lowongan.posisi}
                    </h2>

                    {/* Meta Rows (Location & Salary) */}
                    <div className="modal-meta-row flex items-center gap-6 text-[#827470]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                        {/* Location */}
                        <div className="modal-meta-item flex items-center gap-1.5 text-[14px] font-semibold">
                            <svg className="w-4 h-4 text-[#835500]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                            </svg>
                            <span>Kopi Kenangan, Grand Indonesia</span>
                        </div>

                        {/* Salary */}
                        <div className="modal-meta-item flex items-center gap-1.5 text-[14px] font-semibold">
                            <svg className="w-4 h-4 text-[#835500]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.22.11a3.118 3.118 0 004.56 0a3.118 3.118 0 000-4.364a3.118 3.118 0 00-4.56 0a3.118 3.118 0 000 4.364M12 6v12m-3-12h6M9 18h6" />
                            </svg>
                            <span>Rp 5.500.000 - Rp 7.200.000</span>
                        </div>
                    </div>
                </div>

                {/* ── SPLITSCREEN BODY GRID (3 columns: Left 2, Right 1) ── */}
                <div className="modal-body flex-1 grid grid-cols-3 gap-6 p-6 overflow-hidden">
                    {/* Left Column: Job Contents (col-span-2) - Scrollable if content overflows inside */}
                    <div className="main-content-column col-span-2 flex flex-col gap-5 overflow-y-auto pr-2 custom-scrollbar">
                        {/* Job Description Card */}
                        <div className="deskripsi-card bg-white rounded-[16px] border border-[#EAE4DC]/60 p-6 shadow-[0_4px_20px_rgba(67,44,35,0.02)]">
                            <div className="card-header-row flex items-center gap-3 mb-3.5">
                                {/* Accent Vertical Gold Bar */}
                                <div className="card-header-accent w-[4px] h-[24px] rounded-full bg-[#F7B750]" />
                                <h3
                                    className="card-header-title font-bold text-[18px] text-[#2B1810]"
                                    style={{ fontFamily: 'Poppins, sans-serif' }}
                                >
                                    Deskripsi Pekerjaan
                                </h3>
                            </div>
                            <p
                                className="deskripsi-teks text-[14.5px] font-medium leading-[24px] text-[#4B2E2B] mb-3 text-left"
                                style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                            >
                                Kami mencari Senior Barista yang berpengalaman untuk memimpin tim operasional bar di gerai Grand Indonesia kami. Peran ini menuntut standar kualitas rasa, presisi penyajian, serta keterampilan komunikasi yang prima dengan pelanggan.
                            </p>
                            <p
                                className="deskripsi-teks text-[14.5px] font-medium leading-[24px] text-[#4B2E2B] text-left"
                                style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                            >
                                Tanggung jawab utama mencakup kalibrasi espresso harian secara konsisten, manajemen inventaris kopi, pengawasan kebersihan stasiun kerja, serta pelatihan dasar bagi junior barista.
                            </p>
                        </div>

                        {/* Requirements & Qualifications Card */}
                        <div className="kualifikasi-card bg-white rounded-[16px] border border-[#EAE4DC]/60 p-6 shadow-[0_4px_20px_rgba(67,44,35,0.02)]">
                            <div className="card-header-row flex items-center gap-3 mb-4">
                                <div className="card-header-accent w-[4px] h-[24px] rounded-full bg-[#F7B750]" />
                                <h3
                                    className="card-header-title font-bold text-[18px] text-[#2B1810]"
                                    style={{ fontFamily: 'Poppins, sans-serif' }}
                                >
                                    Persyaratan & Kualifikasi
                                </h3>
                            </div>
                            <ul className="kualifikasi-daftar flex flex-col gap-3">
                                {[
                                    'Minimal 2 tahun pengalaman kerja sebagai barista (diutamakan spesialis manual brew).',
                                    'Memahami teknik kalibrasi espresso dan perawatan dasar mesin kopi profesional.',
                                    'Kemampuan kepemimpinan dan komunikasi interpersonal yang baik.',
                                    'Bersedia bekerja dalam sistem shift, akhir pekan, dan hari libur nasional.',
                                    'Pendidikan minimal SMA/SMK (Perhotelan atau Pariwisata menjadi nilai tambah).'
                                ].map((req, i) => (
                                    <li key={i} className="kualifikasi-item flex gap-3 text-[14px] text-[#4B2E2B] font-medium leading-[22px] text-left">
                                        <span className="kualifikasi-bullet text-[#F7B750] text-[18px] leading-[18px]">•</span>
                                        <span>{req}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Company Screening Questions Card */}
                        <div className="pertanyaan-card bg-[#FAF8F6] border border-[#EAE4DC] rounded-[16px] p-6 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]">
                            <div className="card-header-row flex items-center gap-3 mb-4">
                                <div className="card-header-accent w-[4px] h-[24px] rounded-full bg-[#835500]" />
                                <h3
                                    className="card-header-title font-bold text-[18px] text-[#2B1810]"
                                    style={{ fontFamily: 'Poppins, sans-serif' }}
                                >
                                    Pertanyaan Perusahaan
                                </h3>
                            </div>
                            <div className="pertanyaan-daftar flex flex-col gap-3">
                                {[
                                    'Sebutkan 3 teknik kalibrasi espresso yang Anda kuasai?',
                                    'Berapa lama pengalaman Anda menggunakan mesin La Marzocco?'
                                ].map((q, idx) => (
                                    <div
                                        key={idx}
                                        className="pertanyaan-item bg-white border border-[#EAE4DC] rounded-[12px] p-4 flex items-center gap-4 shadow-sm"
                                    >
                                        <div className="pertanyaan-nomor w-8 h-8 rounded-full bg-[#FFEDD5] text-[#2B1800] flex items-center justify-center font-bold text-[14px] flex-shrink-0">
                                            {idx + 1}
                                        </div>
                                        <p
                                            className="pertanyaan-teks text-[14.5px] font-semibold text-[#2B1810] text-left"
                                            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                                        >
                                            {q}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Meta Info, Warning & Moderation Buttons (col-span-1) */}
                    <div className="sidebar-column col-span-1 flex flex-col justify-between h-full gap-5">
                        {/* Meta Info Box */}
                        <div className="info-lowongan-card bg-white rounded-[16px] border border-[#EAE4DC]/60 p-5 shadow-[0_4px_20px_rgba(67,44,35,0.02)] flex flex-col gap-4">
                            <h4
                                className="sidebar-section-title font-bold text-[12px] tracking-wider text-[#827470] uppercase mb-1"
                                style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                            >
                                Informasi Lowongan
                            </h4>

                            {/* Tanggal Publikasi */}
                            <div className="info-item flex flex-col gap-1.5">
                                <span className="info-label text-[12px] font-semibold text-[#827470]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                                    Tanggal Publikasi
                                </span>
                                <div className="info-value flex items-center gap-2.5 text-[#2B1810] font-bold text-[14px]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                                    <img src={ikonTglPub} alt="Tanggal Publikasi" className="w-[18px] h-[20px] object-contain" />
                                    <span>12 Agustus 2024</span>
                                </div>
                            </div>

                            <div className="info-separator h-[1px] bg-[#EAE4DC]/80 w-full" />

                            {/* Batas Penutupan */}
                            <div className="info-item flex flex-col gap-1.5">
                                <span className="info-label text-[12px] font-semibold text-[#827470]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                                    Batas Penutupan
                                </span>
                                <div className="info-value flex items-center gap-2.5 text-[#B91C1C] font-bold text-[14px]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                                    <img src={ikonTglTutup} alt="Batas Penutupan" className="w-[18px] h-[20px] object-contain" />
                                    <span>30 September 2024</span>
                                </div>
                            </div>
                        </div>

                        {/* WARNING ALERT CARD ("Barangkali melanggar aturan") */}
                        <div className="warning-box bg-[#FEF2F2] border border-[#FCA5A5]/80 rounded-[16px] p-5 flex flex-col gap-3 shadow-[0_4px_20px_rgba(239,68,68,0.02)]">
                            <div className="warning-header flex items-center gap-2 text-[#991B1B]">
                                <svg className="w-5 h-5 text-[#EF4444]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <span className="warning-title font-bold text-[14px]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    Potensi Pelanggaran Aturan
                                </span>
                            </div>
                            <p
                                className="warning-teks text-[13px] leading-[20px] text-[#7F1D1D] font-medium text-left"
                                style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                            >
                                Lowongan ini ditandai oleh sistem karena menggunakan bahasa atau kualifikasi yang berpotensi melanggar ketentuan layanan platform kami. Silakan tinjau dan ambil tindakan moderasi.
                            </p>
                        </div>

                        {/* MODERATION ACTION BUTTONS */}
                        <div className="moderasi-card flex flex-col gap-2.5 mt-auto">
                            {/* Abaikan Laporan Button */}
                            <button
                                onClick={tanganiAbaikan}
                                disabled={sedangProses}
                                className="btn-moderasi-abaikan w-full h-[46px] rounded-[10px] border border-[#EAE4DC] bg-white hover:bg-[#F4ECE9] text-[#4B2E2B] font-bold text-[14.5px] tracking-wide transition-all focus:outline-none flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                            >
                                <svg className="w-4 h-4 text-[#835500]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Abaikan Laporan
                            </button>

                            {/* Blokir Lowongan Button */}
                            <button
                                onClick={tanganiBlokir}
                                disabled={sedangProses}
                                className="btn-moderasi-blokir w-full h-[46px] rounded-[10px] bg-[#EF4444] hover:bg-[#DC2626] text-white font-bold text-[14.5px] tracking-wide transition-all focus:outline-none flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-red-500/10 disabled:opacity-50"
                                style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                            >
                                {sedangProses ? (
                                    <svg className="w-4 h-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                    </svg>
                                )}
                                Blokir Lowongan
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModalDetailLowongan;
