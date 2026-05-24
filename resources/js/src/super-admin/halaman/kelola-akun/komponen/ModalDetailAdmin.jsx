import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Import Assets
import ikonEmail from '../../../aset/akun admin/email.svg';
import ikonChevronDown from '../../../aset/akun admin/ChevronDown.svg';
import ikonArrowRepeat from '../../../aset/akun admin/ArrowRepeat.svg';
import ikonLocation from '../../../aset/akun admin/location.svg';
import ikonGrup from '../../../aset/akun admin/grup.svg';
import ikonCafe from '../../../aset/akun admin/ikon cafe.svg';

const ModalDetailAdmin = ({ admin, onTutup, onUpdateStatus }) => {
    const navigate = useNavigate();
    const [statusTerpilih, setStatusTerpilih] = useState('');
    const [dropdownBuka, setDropdownBuka] = useState(false);
    const [sedangProses, setSedangProses] = useState(false);
    const [skalaModal, setSkalaModal] = useState(1);

    useEffect(() => {
        if (admin) {
            setStatusTerpilih(admin.status);
        }
    }, [admin]);

    // Proportional auto-scaling to prevent scrollbars and fit viewport
    useEffect(() => {
        if (!admin) return;

        const hitungSkala = () => {
            const tTinggi = window.innerHeight;
            const tLebar = window.innerWidth;

            // Height margin 40px, design base is 666px
            const skalaH = (tTinggi - 40) / 666;
            // Width margin 40px, design base is 973px
            const skalaW = (tLebar - 40) / 973;

            // Limit scaling between 0.65 and 1.0
            const skalaAkhir = Math.min(1.0, Math.max(0.65, Math.min(skalaH, skalaW)));
            setSkalaModal(skalaAkhir);
        };

        window.addEventListener('resize', hitungSkala);
        hitungSkala();

        return () => window.removeEventListener('resize', hitungSkala);
    }, [admin]);

    if (!admin) return null;

    const tanganiSimpanStatus = async () => {
        setSedangProses(true);
        try {
            await onUpdateStatus(admin, statusTerpilih);
            setDropdownBuka(false);
        } catch (err) {
            console.error(err);
        } finally {
            setSedangProses(false);
        }
    };

    const lowonganReal = (admin.lowongan || []).map((l, index) => ({
        ...l,
        highlight: index === 0,
    }));

    const deskripsiKafe = admin.deskripsi || 'Belum ada deskripsi kafe.';
    const alamatKafe = admin.alamat || 'Belum ada alamat kafe.';

    return (
        <div
            className="pembungkus-modal-detail fixed inset-0 bg-[#1c120e]/85 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-300"
            onClick={(e) => e.target === e.currentTarget && onTutup()}
            role="dialog"
            aria-modal="true"
        >
            {/* Modal Box: Width 973px, Height 666px, responsive absolute center scaling */}
            <div
                className="konten-modal bg-[#FAF8F6] rounded-[20px] shadow-[0_25px_60px_-15px_rgba(43,24,16,0.4)] overflow-hidden flex flex-col absolute transition-all duration-300 animate-in fade-in zoom-in-95 duration-200"
                style={{
                    width: '973px',
                    height: '666px',
                    maxWidth: '973px',
                    maxHeight: '666px',
                    top: '50%',
                    left: '50%',
                    transform: `translate(-50%, -50%) scale(${skalaModal})`,
                    transformOrigin: 'center center',
                }}
            >
                {/* Close Button at top-right */}
                <button
                    onClick={onTutup}
                    className="tombol-tutup absolute right-6 top-6 w-[36px] h-[36px] rounded-full bg-[#EAE4DC] hover:bg-[#FEAE2C]/20 text-[#4B2E2B] flex items-center justify-center text-[22px] transition-all cursor-pointer font-bold focus:outline-none z-30"
                    title="Tutup"
                >
                    ×
                </button>

                {/* ── PROFILE HEADER CARD (W:973 H:144) ── */}
                <div
                    className="header-modal w-full bg-white px-8 flex items-center justify-between border-b border-[#EAE4DC] relative flex-shrink-0"
                    style={{
                        height: '144px',
                        boxShadow: '0 4px 20px -4px rgba(67, 44, 35, 0.08)',
                    }}
                >
                    <div className="konten-kiri flex items-center gap-6">
                        {/* Cafe Avatar Frame: W:96 H:96 */}
                        <div className="bingkai-avatar w-[96px] h-[96px] rounded-[12px] bg-[#F4ECE9] flex items-center justify-center overflow-hidden border border-[#EAE4DC] flex-shrink-0">
                            <img
                                src={ikonCafe}
                                alt="Kafe Logo"
                                className="logo-kafe w-[52px] h-[52px] opacity-80"
                            />
                        </div>

                        {/* Title, Status, and Email */}
                        <div className="info-header flex flex-col gap-1.5">
                            <div className="baris-judul flex items-center gap-3">
                                <h2
                                    className="judul-modal font-bold text-[24px] tracking-tight leading-tight text-[#2B1810]"
                                    style={{ fontFamily: 'Poppins, sans-serif' }}
                                >
                                    {admin.nama_perusahaan}
                                </h2>
                                
                                {/* Status Badge */}
                                <div
                                    className={`lencana-status px-3 py-1 rounded-full flex items-center gap-2 text-[12px] font-bold ${
                                        admin.status === 'Aktif'
                                            ? 'bg-[#DCFCE7] text-[#15803D]'
                                            : 'bg-[#FEE2E2] text-[#B91C1C]'
                                    }`}
                                    style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                                >
                                    <span
                                        className={`titik-status w-2 h-2 rounded-full ${
                                            admin.status === 'Aktif' ? 'bg-[#22C55E]' : 'bg-[#EF4444]'
                                        }`}
                                    />
                                    {admin.status}
                                </div>
                             </div>

                            {/* Email Display Row */}
                            <div className="baris-email flex items-center gap-2 text-[#827470]">
                                <img src={ikonEmail} alt="email" className="w-[18px] h-[18px]" />
                                <span
                                    className="teks-email text-[14px] font-medium"
                                    style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                                >
                                    {admin.email}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Status Controller (Dropdown & Simpan Button) */}
                    <div className="pembungkus-kontrol flex items-center gap-3 pr-8">
                        {/* Dropdown Menu Container */}
                        <div className="pembungkus-dropdown relative">
                            <button
                                onClick={() => setDropdownBuka(!dropdownBuka)}
                                className="tombol-dropdown h-[40px] px-4 bg-[#EAE4DC] hover:bg-[#DED7CE] rounded-[8px] flex items-center gap-3 font-semibold text-[14px] text-[#4B2E2B] transition-all focus:outline-none"
                                style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                            >
                                <span>{statusTerpilih}</span>
                                <img
                                    src={ikonChevronDown}
                                    alt="pilih"
                                    className={`ikon-panah w-[12px] h-[12px] transition-transform duration-300 ${
                                        dropdownBuka ? 'rotate-180' : ''
                                    }`}
                                />
                            </button>

                            {/* Dropdown Items list */}
                            {dropdownBuka && (
                                <div className="list-dropdown absolute right-0 mt-2 w-[140px] bg-white border border-[#EAE4DC] rounded-[8px] shadow-lg overflow-hidden z-40">
                                    {['Aktif', 'Nonaktif', 'Diblokir'].map((opt) => (
                                        <button
                                            key={opt}
                                            onClick={() => {
                                                setStatusTerpilih(opt);
                                                setDropdownBuka(false);
                                            }}
                                            className={`item-dropdown w-full text-left px-4 py-2.5 text-[14px] font-semibold transition-colors focus:outline-none ${
                                                statusTerpilih === opt
                                                    ? 'bg-[#F7B750] text-[#4B2E2B]'
                                                    : 'text-[#4B2E2B] hover:bg-[#F4ECE9]'
                                            }`}
                                            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Save Changes Button */}
                        <button
                            onClick={tanganiSimpanStatus}
                            disabled={sedangProses || statusTerpilih === admin.status}
                            className="tombol-simpan h-[40px] px-5 bg-[#F7B750] hover:bg-[#FEAE2C] disabled:bg-[#EAE4DC] disabled:text-[#827470] rounded-[8px] flex items-center gap-2.5 font-bold text-[14px] text-[#4B2E2B] transition-all focus:outline-none disabled:cursor-not-allowed shadow-sm"
                            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                        >
                            {sedangProses ? (
                                <svg className="w-4 h-4 animate-spin text-[#4B2E2B]" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                </svg>
                            ) : (
                                <img src={ikonArrowRepeat} alt="simpan" className="w-[16px] h-[16px]" />
                            )}
                            Simpan Perubahan Status
                        </button>
                    </div>
                </div>

                {/* ── SPLITSCREEN BODY GRID (3 columns: Left 1.1, Right 1.9) ── */}
                <div className="badan-modal flex-1 grid grid-cols-3 gap-8 p-8 overflow-hidden">
                    {/* Left Column: TENTANG CAFE & Alamat (1 col span) — Figma 356:484 */}
                    <div className="kolom-kiri col-span-1 flex flex-col h-full pr-2">
                        {/* Premium White Card Container */}
                        <div className="kartu-tentang bg-white rounded-[20px] border border-[#EAE4DC]/60 p-8 flex flex-col justify-between h-full shadow-[0_8px_30px_-6px_rgba(67,44,35,0.03)]">
                            <div>
                                <h3
                                    className="judul-tentang font-bold text-[14px] tracking-wider text-[#2B1810] uppercase mb-4"
                                    style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                                >
                                    Tentang Cafe
                                </h3>
                                <p
                                    className="deskripsi-tentang text-[14px] font-medium leading-[24px] text-[#4B2E2B] break-words text-left"
                                    style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                                >
                                    {deskripsiKafe}
                                </p>
                            </div>

                            {/* Divider and Address at the bottom */}
                            <div className="pembungkus-alamat pt-6 border-t border-[#EAE4DC]/60 mt-6">
                                <span
                                    className="judul-alamat text-[12px] font-bold tracking-wider text-[#827470] uppercase block mb-1.5"
                                    style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                                >
                                    Alamat
                                </span>
                                <p
                                    className="isi-alamat text-[14px] font-semibold leading-[22px] text-[#2B1810]"
                                    style={{ fontFamily: 'Poppins, sans-serif' }}
                                >
                                    {alamatKafe}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Columns: Lowongan Bento Grid (2 col span) */}
                    <div className="kolom-kanan col-span-2 flex flex-col h-full pl-2 overflow-hidden">
                        <h3
                            className="judul-lowongan font-bold text-[18px] text-[#2B1810] mb-5 flex-shrink-0"
                            style={{ fontFamily: 'Poppins, sans-serif' }}
                        >
                            Lowongan Kafe
                        </h3>

                        {/* Bento Grid layout with 3 vacancy cards */}
                        <div className="grid-lowongan grid grid-cols-2 gap-4 flex-1 overflow-y-auto pr-1" style={{ gridAutoRows: '1fr' }}>
                            {lowonganReal.map((l) => {
                                const statusNorm = (l.status || '').toLowerCase();
                                const isAktif = statusNorm === 'aktif' || statusNorm === 'active';
                                const isClosed = statusNorm === 'closed' || statusNorm === 'ditutup';
                                const isDraft = statusNorm === 'draft';

                                // Tentukan kelas background dan batas kartu
                                let kelasBgKartu = 'bg-white border-[#EAE4DC] text-[#2B1810] hover:border-[#D5CFC8]';
                                if (isAktif) {
                                    kelasBgKartu = 'bg-[#2B1810] border-transparent text-white shadow-[#2B1810]/15';
                                } else if (isClosed) {
                                    kelasBgKartu = 'bg-[#2B1810]/70 border-transparent text-white/80 shadow-[#2B1810]/10';
                                }

                                // Kelas untuk tanggal lowongan
                                let kelasTeksTgl = 'text-[#827470]';
                                if (isAktif) {
                                    kelasTeksTgl = 'text-white/60';
                                } else if (isClosed) {
                                    kelasTeksTgl = 'text-white/40';
                                }

                                // Kelas untuk badge status lowongan
                                let kelasLencana = 'bg-[#EAE4DC] text-[#4B2E2B]/80';
                                if (isAktif) {
                                    kelasLencana = 'bg-white text-[#2B1810]';
                                } else if (isClosed) {
                                    kelasLencana = 'bg-white/20 text-white/90';
                                }

                                // Kelas untuk judul posisi
                                let kelasPosisi = 'text-[#2B1810]';
                                if (isAktif) {
                                    kelasPosisi = 'text-white';
                                } else if (isClosed) {
                                    kelasPosisi = 'text-white/90';
                                }

                                // Kelas ikon lokasi
                                let kelasIkonLokasi = 'opacity-60';
                                if (isAktif) {
                                    kelasIkonLokasi = 'brightness-200 opacity-60';
                                } else if (isClosed) {
                                    kelasIkonLokasi = 'brightness-200 opacity-40';
                                }

                                // Kelas teks lokasi
                                let kelasTeksLokasi = 'text-[#827470]';
                                if (isAktif) {
                                    kelasTeksLokasi = 'text-white/60';
                                } else if (isClosed) {
                                    kelasTeksLokasi = 'text-white/40';
                                }

                                // Batas pemisah bawah
                                let warnaGarisBawah = '#EAE4DC';
                                if (isAktif || isClosed) {
                                    warnaGarisBawah = 'rgba(255,255,255,0.1)';
                                }

                                // Kelas dan filter ikon pelamar
                                const statusGelap = isAktif || isClosed;
                                let kelasIkonPelamar = statusGelap ? 'brightness-200' : 'filter-none';
                                if (isClosed) kelasIkonPelamar += ' opacity-70';
                                const filterIkonPelamar = statusGelap ? 'none' : 'invert(27%) sepia(21%) saturate(1312%) hue-rotate(334deg) brightness(93%) contrast(92%)';

                                // Kelas angka pelamar
                                let kelasAngkaPelamar = 'text-[#2B1810]';
                                if (isAktif) {
                                    kelasAngkaPelamar = 'text-white';
                                } else if (isClosed) {
                                    kelasAngkaPelamar = 'text-white/90';
                                }

                                // Kelas label pelamar
                                let kelasLabelPelamar = 'text-[#827470]';
                                if (isAktif) {
                                    kelasLabelPelamar = 'text-white/60';
                                } else if (isClosed) {
                                    kelasLabelPelamar = 'text-white/40';
                                }

                                return (
                                    <div
                                        key={l.id}
                                        onClick={() => {
                                            navigate(`/super-admin/kelola-akun/lowongan/${l.id}`);
                                            onTutup();
                                        }}
                                        className={`kartu-lowongan rounded-[12px] p-5 flex flex-col justify-between border cursor-pointer transform hover:-translate-y-1 hover:shadow-lg transition-all duration-300 ${kelasBgKartu}`}
                                    >
                                        {/* Top Row: Date & Status Badge */}
                                        <div className="baris-atas-lowongan flex items-center justify-between">
                                            <span
                                                className={`tgl-lowongan text-[12px] font-semibold ${kelasTeksTgl}`}
                                                style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                                            >
                                                {l.tanggal}
                                            </span>

                                            <div
                                                className={`lencana-status-lowongan px-2.5 py-0.5 rounded-[10px] text-[12px] font-medium leading-[14px] ${kelasLencana}`}
                                                style={{ fontFamily: 'Poppins, sans-serif' }}
                                            >
                                                {l.status}
                                            </div>
                                        </div>

                                        {/* Middle: Job Position & Location */}
                                        <div className="bagian-tengah-lowongan my-3">
                                            <h4
                                                className={`posisi-lowongan text-[18px] font-bold leading-tight mb-2 ${kelasPosisi}`}
                                                style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                                            >
                                                {l.posisi}
                                            </h4>
                                            <div className="baris-lokasi flex items-center gap-1.5">
                                                <img
                                                    src={ikonLocation}
                                                    alt="lokasi"
                                                    className={`ikon-lokasi w-[12px] h-[14px] ${kelasIkonLokasi}`}
                                                />
                                                <span
                                                    className={`nama-lokasi text-[14px] font-medium ${kelasTeksLokasi}`}
                                                    style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                                                >
                                                    {l.lokasi}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Bottom Row: Applicant Count */}
                                        <div
                                            className="baris-bawah-lowongan flex items-center gap-2 pt-3 border-t flex-shrink-0"
                                            style={{ borderColor: warnaGarisBawah }}
                                        >
                                            <img
                                                src={ikonGrup}
                                                alt="pelamar"
                                                className={`ikon-pelamar w-[22px] h-[16px] ${kelasIkonPelamar}`}
                                                style={{ filter: filterIkonPelamar }}
                                            />
                                            <div
                                                className="teks-pelamar text-[14px] font-bold"
                                                style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                                            >
                                                <span className={`jumlah-pelamar ${kelasAngkaPelamar}`}>
                                                    {l.pelamar}
                                                </span>{' '}
                                                <span className={`label-pelamar font-normal ${kelasLabelPelamar}`}>Pelamar</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Blank placeholder card to create Bento layout feel */}
                            <div className="placeholder-lowongan bg-[#FAF8F6]/30 rounded-[12px] border border-dashed border-[#EAE4DC] p-5 flex flex-col justify-center items-center text-center opacity-60">
                                <span className="teks-emoji text-[28px] mb-2 opacity-55">☕</span>
                                <p className="teks-placeholder text-[13px] font-semibold text-[#827470]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                                    Slot Lowongan Tersedia
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModalDetailAdmin;

