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
            setStatusTerpilih(admin.status === 'Aktif' ? 'Aktif' : 'Nonaktif');
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

    // Construct highly engaging mock bento grid vacancies to make cafe page look alive
    const [daftarLowongan] = useState([
        {
            id: 1,
            tanggal: '15 Maret 2026',
            posisi: 'Senior Barista',
            lokasi: 'Indramayu',
            status: 'Aktif',
            pelamar: 42,
            highlight: true, // Dark premium highlighted bento card
        },
        {
            id: 2,
            tanggal: '12 Maret 2026',
            posisi: 'Cafe Supervisor',
            lokasi: 'Hargeulis',
            status: 'Aktif',
            pelamar: 28,
            highlight: false,
        },
        {
            id: 3,
            tanggal: '10 Maret 2026',
            posisi: 'Store Crew',
            lokasi: 'Jatibarang',
            status: 'Draft',
            pelamar: 128,
            highlight: false,
        }
    ]);

    // High fidelity texts depending on selected cafe to feel tailored
    const deskripsiKafe = admin.nama_perusahaan.includes('Kenangan')
        ? 'Kopi Kenangan adalah salah satu jaringan kedai kopi dengan pertumbuhan tercepat di Asia Tenggara yang menyediakan kopi berkualitas tinggi dengan harga terjangkau.'
        : admin.nama_perusahaan.includes('Jiwa')
        ? 'Menghadirkan produk kopi lokal berkualitas tinggi dengan konsep "Kopi dari Hati". Kami berupaya membangun komunitas pecinta kopi sejati dengan pelayanan ramah dan cita rasa kopi robusta pilihan yang konsisten.'
        : 'Kami menyajikan perpaduan biji kopi premium pilihan dengan teknik penyeduhan modern. Menjadi ruang kreatif bagi anak muda dan profesional untuk berkumpul, berdiskusi, serta menikmati secangkir kehangatan kopi otentik.';

    const alamatKafe = admin.nama_perusahaan.includes('Kenangan')
        ? 'Jl. Sudirman No. 45, Jakarta Selatan, DKI Jakarta 12190'
        : admin.nama_perusahaan.includes('Jiwa')
        ? 'Jl. Jend. Sudirman Kav. 21, Klandasan Ulu, Balikpapan, Kalimantan Timur'
        : 'Jl. H. Juanda No. 88, Dago, Bandung, Jawa Barat';

    return (
        <div
            className="fixed inset-0 bg-[#1c120e]/85 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-300"
            onClick={(e) => e.target === e.currentTarget && onTutup()}
            role="dialog"
            aria-modal="true"
        >
            {/* Modal Box: Width 973px, Height 666px, responsive absolute center scaling */}
            <div
                className="bg-[#FAF8F6] rounded-[20px] shadow-[0_25px_60px_-15px_rgba(43,24,16,0.4)] overflow-hidden flex flex-col absolute transition-all duration-300 animate-in fade-in zoom-in-95 duration-200"
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
                    className="absolute right-6 top-6 w-[36px] h-[36px] rounded-full bg-[#EAE4DC] hover:bg-[#FEAE2C]/20 text-[#4B2E2B] flex items-center justify-center text-[22px] transition-all cursor-pointer font-bold focus:outline-none z-30"
                    title="Tutup"
                >
                    ×
                </button>

                {/* ── PROFILE HEADER CARD (W:973 H:144) ── */}
                <div
                    className="w-full bg-white px-8 flex items-center justify-between border-b border-[#EAE4DC] relative flex-shrink-0"
                    style={{
                        height: '144px',
                        boxShadow: '0 4px 20px -4px rgba(67, 44, 35, 0.08)',
                    }}
                >
                    <div className="flex items-center gap-6">
                        {/* Cafe Avatar Frame: W:96 H:96 */}
                        <div className="w-[96px] h-[96px] rounded-[12px] bg-[#F4ECE9] flex items-center justify-center overflow-hidden border border-[#EAE4DC] flex-shrink-0">
                            <img
                                src={ikonCafe}
                                alt="Kafe Logo"
                                className="w-[52px] h-[52px] opacity-80"
                            />
                        </div>

                        {/* Title, Status, and Email */}
                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-3">
                                <h2
                                    className="font-bold text-[24px] tracking-tight leading-tight text-[#2B1810]"
                                    style={{ fontFamily: 'Poppins, sans-serif' }}
                                >
                                    {admin.nama_perusahaan}
                                </h2>
                                
                                {/* Status Badge */}
                                <div
                                    className={`px-3 py-1 rounded-full flex items-center gap-2 text-[12px] font-bold ${
                                        admin.status === 'Aktif'
                                            ? 'bg-[#DCFCE7] text-[#15803D]'
                                            : 'bg-[#FEE2E2] text-[#B91C1C]'
                                    }`}
                                    style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                                >
                                    <span
                                        className={`w-2 h-2 rounded-full ${
                                            admin.status === 'Aktif' ? 'bg-[#22C55E]' : 'bg-[#EF4444]'
                                        }`}
                                    />
                                    {admin.status}
                                </div>
                            </div>

                            {/* Email Display Row */}
                            <div className="flex items-center gap-2 text-[#827470]">
                                <img src={ikonEmail} alt="email" className="w-[18px] h-[18px]" />
                                <span
                                    className="text-[14px] font-medium"
                                    style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                                >
                                    {admin.email}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Status Controller (Dropdown & Simpan Button) */}
                    <div className="flex items-center gap-3 pr-8">
                        {/* Dropdown Menu Container */}
                        <div className="relative">
                            <button
                                onClick={() => setDropdownBuka(!dropdownBuka)}
                                className="h-[40px] px-4 bg-[#EAE4DC] hover:bg-[#DED7CE] rounded-[8px] flex items-center gap-3 font-semibold text-[14px] text-[#4B2E2B] transition-all focus:outline-none"
                                style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                            >
                                <span>{statusTerpilih}</span>
                                <img
                                    src={ikonChevronDown}
                                    alt="pilih"
                                    className={`w-[12px] h-[12px] transition-transform duration-300 ${
                                        dropdownBuka ? 'rotate-180' : ''
                                    }`}
                                />
                            </button>

                            {/* Dropdown Items list */}
                            {dropdownBuka && (
                                <div className="absolute right-0 mt-2 w-[140px] bg-white border border-[#EAE4DC] rounded-[8px] shadow-lg overflow-hidden z-40">
                                    {['Aktif', 'Nonaktif'].map((opt) => (
                                        <button
                                            key={opt}
                                            onClick={() => {
                                                setStatusTerpilih(opt);
                                                setDropdownBuka(false);
                                            }}
                                            className={`w-full text-left px-4 py-2.5 text-[14px] font-semibold transition-colors focus:outline-none ${
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
                            className="h-[40px] px-5 bg-[#F7B750] hover:bg-[#FEAE2C] disabled:bg-[#EAE4DC] disabled:text-[#827470] rounded-[8px] flex items-center gap-2.5 font-bold text-[14px] text-[#4B2E2B] transition-all focus:outline-none disabled:cursor-not-allowed shadow-sm"
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
                <div className="flex-1 grid grid-cols-3 gap-8 p-8 overflow-hidden">
                    {/* Left Column: TENTANG CAFE & Alamat (1 col span) — Figma 356:484 */}
                    <div className="col-span-1 flex flex-col h-full pr-2">
                        {/* Premium White Card Container */}
                        <div className="bg-white rounded-[20px] border border-[#EAE4DC]/60 p-8 flex flex-col justify-between h-full shadow-[0_8px_30px_-6px_rgba(67,44,35,0.03)]">
                            <div>
                                <h3
                                    className="font-bold text-[14px] tracking-wider text-[#2B1810] uppercase mb-4"
                                    style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                                >
                                    Tentang Cafe
                                </h3>
                                <p
                                    className="text-[14px] font-medium leading-[24px] text-[#4B2E2B] break-words text-left"
                                    style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                                >
                                    {deskripsiKafe}
                                </p>
                            </div>

                            {/* Divider and Address at the bottom */}
                            <div className="pt-6 border-t border-[#EAE4DC]/60 mt-6">
                                <span
                                    className="text-[12px] font-bold tracking-wider text-[#827470] uppercase block mb-1.5"
                                    style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                                >
                                    Alamat
                                </span>
                                <p
                                    className="text-[14px] font-semibold leading-[22px] text-[#2B1810]"
                                    style={{ fontFamily: 'Poppins, sans-serif' }}
                                >
                                    {alamatKafe}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Columns: Lowongan Bento Grid (2 col span) */}
                    <div className="col-span-2 flex flex-col h-full pl-2 overflow-hidden">
                        <h3
                            className="font-bold text-[18px] text-[#2B1810] mb-5 flex-shrink-0"
                            style={{ fontFamily: 'Poppins, sans-serif' }}
                        >
                            Lowongan Kafe
                        </h3>

                        {/* Bento Grid layout with 3 vacancy cards */}
                        <div className="grid grid-cols-2 gap-4 flex-1 overflow-hidden" style={{ gridAutoRows: '1fr' }}>
                            {daftarLowongan.map((l) => (
                                <div
                                    key={l.id}
                                    onClick={() => {
                                        navigate(`/super-admin/kelola-akun/lowongan/${l.id}`);
                                        onTutup();
                                    }}
                                    className={`rounded-[12px] p-5 flex flex-col justify-between border cursor-pointer transform hover:-translate-y-1 hover:shadow-lg transition-all duration-300 ${
                                        l.highlight
                                            ? 'bg-[#2B1810] border-transparent text-white shadow-[#2B1810]/15'
                                            : 'bg-white border-[#EAE4DC] text-[#2B1810] hover:border-[#D5CFC8]'
                                    }`}
                                >
                                    {/* Top Row: Date & Status Badge */}
                                    <div className="flex items-center justify-between">
                                        <span
                                            className={`text-[12px] font-semibold ${
                                                l.highlight ? 'text-[#827470]' : 'text-[#827470]'
                                            }`}
                                            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                                        >
                                            {l.tanggal}
                                        </span>

                                        <div
                                            className={`px-2.5 py-0.5 rounded-[10px] text-[12px] font-medium leading-[14px] ${
                                                l.status === 'Aktif'
                                                    ? 'bg-[#DCFCE7] text-[#15803D]'
                                                    : 'bg-[#EAE4DC] text-[#4B2E2B]/80'
                                            }`}
                                            style={{ fontFamily: 'Poppins, sans-serif' }}
                                        >
                                            {l.status}
                                        </div>
                                    </div>

                                    {/* Middle: Job Position & Location */}
                                    <div className="my-3">
                                        <h4
                                            className={`text-[18px] font-bold leading-tight mb-2 ${
                                                l.highlight ? 'text-white' : 'text-[#2B1810]'
                                            }`}
                                            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                                        >
                                            {l.posisi}
                                        </h4>
                                        <div className="flex items-center gap-1.5">
                                            <img
                                                src={ikonLocation}
                                                alt="lokasi"
                                                className={`w-[12px] h-[14px] ${
                                                    l.highlight ? 'brightness-200 opacity-60' : 'opacity-60'
                                                }`}
                                            />
                                            <span
                                                className={`text-[14px] font-medium ${
                                                    l.highlight ? 'text-[#827470]' : 'text-[#827470]'
                                                }`}
                                                style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                                            >
                                                {l.lokasi}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Bottom Row: Applicant Count */}
                                    <div
                                        className="flex items-center gap-2 pt-3 border-t border-[#EAE4DC]/15 flex-shrink-0"
                                        style={{ borderColor: l.highlight ? 'rgba(234,228,220,0.1)' : '#EAE4DC' }}
                                    >
                                        <img
                                            src={ikonGrup}
                                            alt="pelamar"
                                            className={`w-[22px] h-[16px] ${
                                                l.highlight ? 'brightness-200' : 'filter-none'
                                            }`}
                                            style={{ filter: l.highlight ? 'none' : 'invert(27%) sepia(21%) saturate(1312%) hue-rotate(334deg) brightness(93%) contrast(92%)' }}
                                        />
                                        <div
                                            className="text-[14px] font-bold"
                                            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                                        >
                                            <span className={`${l.highlight ? 'text-white' : 'text-[#2B1810]'}`}>
                                                {l.pelamar}
                                            </span>{' '}
                                            <span className="text-[#827470] font-normal">Pelamar</span>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Blank placeholder card to create Bento layout feel */}
                            <div className="bg-[#FAF8F6]/30 rounded-[12px] border border-dashed border-[#EAE4DC] p-5 flex flex-col justify-center items-center text-center opacity-60">
                                <span className="text-[28px] mb-2 opacity-55">☕</span>
                                <p className="text-[13px] font-semibold text-[#827470]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
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
