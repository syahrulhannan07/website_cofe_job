import React, { useState, useEffect } from 'react';
import api from '../../../../layanan/api';

const ModalDetailKafe = ({ kafeAktif, onTutup, onBerhasilVerifikasi }) => {
    const [alasanTolak, setAlasanTolak] = useState('');
    const [sedangProses, setSedangProses] = useState(false);
    const [pesanError, setPesanError] = useState('');
    const [skalaModal, setSkalaModal] = useState(1);

    useEffect(() => {
        setAlasanTolak('');
        setPesanError('');
        setSedangProses(false);
    }, [kafeAktif?.id]);

    // Dynamic auto-scaling to fit smaller screens perfectly without scrollbars
    useEffect(() => {
        if (!kafeAktif) return;

        const hitungSkala = () => {
            const tTinggi = window.innerHeight;
            const tLebar = window.innerWidth;

            // Hitung skala berdasarkan ruang layar yang tersisa (margin minimum 40px)
            const skalaH = (tTinggi - 40) / 666;
            const skalaW = (tLebar - 40) / 928;

            // Batasi skala minimum di 0.65 dan maksimum di 1.0 (ukuran orisinal)
            const skalaAkhir = Math.min(1.0, Math.max(0.65, Math.min(skalaH, skalaW)));
            setSkalaModal(skalaAkhir);
        };

        window.addEventListener('resize', hitungSkala);
        hitungSkala();

        return () => window.removeEventListener('resize', hitungSkala);
    }, [kafeAktif]);

    if (!kafeAktif) return null;

    const tanganiSetujui = async () => {
        setSedangProses(true);
        setPesanError('');
        try {
            await api.post(`/super-admin/verifikasi/${kafeAktif.id}/setujui`);
            onBerhasilVerifikasi(kafeAktif.id, 'Aktif');
            onTutup();
        } catch (err) {
            setPesanError(err.response?.data?.message || 'Gagal menyetujui. Coba lagi.');
        } finally {
            setSedangProses(false);
        }
    };

    const tanganiTolak = async () => {
        if (!alasanTolak.trim()) {
            setPesanError('Alasan penolakan wajib diisi jika menolak.');
            return;
        }
        setSedangProses(true);
        setPesanError('');
        try {
            await api.post(`/super-admin/verifikasi/${kafeAktif.id}/tolak`, {
                alasan: alasanTolak,
            });
            onBerhasilVerifikasi(kafeAktif.id, 'Ditolak');
            onTutup();
        } catch (err) {
            setPesanError(err.response?.data?.message || 'Gagal menolak. Coba lagi.');
        } finally {
            setSedangProses(false);
        }
    };

    const urlDokumen = kafeAktif.dokumen_izin
        ? `/storage/${kafeAktif.dokumen_izin}`
        : null;

    const ekstensiDokumen = urlDokumen ? urlDokumen.split('.').pop().toLowerCase() : '';
    const adalahGambar = ['jpg', 'jpeg', 'png', 'webp'].includes(ekstensiDokumen);

    return (
        /* Overlay with deeper background and stronger blur for a high-end feel */
        <div
            className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-6 transition-all duration-300"
            onClick={(e) => e.target === e.currentTarget && onTutup()}
            role="dialog"
            aria-modal="true"
        >
            {/* Panel Modal - Frame 286 W:928 H:666 styled to scale professionally on smaller viewports */}
            <div 
                className="bg-white rounded-[20px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col absolute transition-all duration-300 animate-in fade-in zoom-in-95 duration-200"
                style={{ 
                    width: '928px', 
                    height: '666px', 
                    maxWidth: '928px', 
                    maxHeight: '666px',
                    top: '50%',
                    left: '50%',
                    transform: `translate(-50%, -50%) scale(${skalaModal})`,
                    transformOrigin: 'center center'
                }}
            >
                {/* Close Button at top-right absolute */}
                <button
                    onClick={onTutup}
                    className="absolute right-6 top-8 w-[36px] h-[36px] rounded-full bg-white/10 hover:bg-white/20 text-[#EAE4DC] flex items-center justify-center text-[24px] transition-all focus:outline-none z-10"
                >
                    ×
                </button>
                
                {/* Header Banner - Frame 290 W:928 H:108 centered */}
                <div 
                    className="w-full flex items-center justify-center flex-shrink-0"
                    style={{ background: '#432C23', height: '108px' }}
                >
                    <h2 
                        className="font-bold text-[28px] tracking-wide text-center"
                        style={{ color: '#EAE4DC', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                    >
                        Tinjau Pendaftaran - {kafeAktif.nama_perusahaan}
                    </h2>
                </div>

                {/* Body Content - Grid grid-cols-[314px_1fr] matching design, overflow hidden to guarantee no scrollbars */}
                <div className="flex-1 grid grid-cols-[314px_1fr] gap-8 p-9 overflow-hidden">
                    
                    {/* Left Column: Tinjau Dokumen */}
                    <div className="flex flex-col h-full justify-between">
                        <div>
                            <h3 
                                className="font-bold text-[16px] mb-4"
                                style={{ color: '#2B1810', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                            >
                                Tinjau Dokuemen NIB & Izin Usaha
                            </h3>

                            {/* Document View Frame - Frame 289 W:314 H:370 fill:#eae4dc */}
                            <div 
                                className="w-[314px] h-[370px] rounded-[10px] flex flex-col justify-between p-2 overflow-hidden shadow-inner"
                                style={{ background: '#EAE4DC' }}
                            >
                                {urlDokumen ? (
                                    <div className="w-full h-full flex flex-col justify-between">
                                        <div className="w-full h-[320px] overflow-hidden rounded-[6px] border border-[#D5CFC8]">
                                            {adalahGambar ? (
                                                <img
                                                    src={urlDokumen}
                                                    alt="NIB & Izin Usaha"
                                                    className="w-full h-full object-contain bg-[#ffffff]"
                                                />
                                            ) : (
                                                <iframe
                                                    src={urlDokumen}
                                                    title="PDF Preview"
                                                    className="w-full h-full border-none"
                                                />
                                            )}
                                        </div>
                                        <a
                                            href={urlDokumen}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[11px] font-semibold text-[#4B2E2B] hover:text-[#FEAE2C] underline text-center block mt-1 transition-colors"
                                            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                                        >
                                            ↗ Buka Dokumen Penuh
                                        </a>
                                    </div>
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                                        <span className="text-[42px]">📄</span>
                                        <span className="text-[13px] font-semibold text-[#827470]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                                            Tidak ada dokumen diunggah
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Error Alert Box inside Left Column bottom to avoid layout shift */}
                        {pesanError && (
                            <div className="bg-red-50 border border-red-200 rounded-[8px] p-2 text-[12px] text-red-600 font-semibold flex items-center gap-1.5" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                                <span>⚠</span>
                                <span className="line-clamp-2">{pesanError}</span>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Informasi Perusahaan & Action buttons */}
                    <div className="flex flex-col justify-between h-full pl-2">
                        
                        {/* Company Details */}
                        <div>
                            <h3 
                                className="font-bold text-[16px] mb-4"
                                style={{ color: '#2B1810', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                            >
                                Informasi Perusahaan
                            </h3>

                            {/* Nama Cafe & Email Bisnis side-by-side in grid */}
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <span className="text-[11px] font-semibold text-[#827470] uppercase tracking-wider block mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                                        Nama Cafe
                                    </span>
                                    <span className="text-[14px] font-bold text-[#4B2E2B]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        {kafeAktif.nama_perusahaan}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-[11px] font-semibold text-[#827470] uppercase tracking-wider block mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                                        Email Bisnis
                                    </span>
                                    <span className="text-[14px] font-bold text-[#4B2E2B] break-all" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        {kafeAktif.email}
                                    </span>
                                </div>
                            </div>

                            {/* Alamat */}
                            <div className="mb-4">
                                <span className="text-[11px] font-semibold text-[#827470] uppercase tracking-wider block mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                                    Alamat
                                </span>
                                <span className="text-[14px] font-semibold text-[#4B2E2B] leading-relaxed block" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    {kafeAktif.alamat_perusahaan || '—'}
                                </span>
                            </div>

                            {/* Deskripsi Cafe */}
                            <div>
                                <span className="text-[11px] font-semibold text-[#827470] uppercase tracking-wider block mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                                    Deskripsi Cafe
                                </span>
                                <span className="text-[13px] text-[#4B2E2B] leading-relaxed block" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    {kafeAktif.deskripsi || '—'}
                                </span>
                            </div>
                        </div>

                        {/* Manual Verification & Footer Buttons */}
                        <div>
                            <h3 
                                className="font-bold text-[16px] mb-3 mt-4"
                                style={{ color: '#2B1810', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                            >
                                Verifikasi Manual
                            </h3>

                            {/* Rejection Reason Box - Frame 292 W:502 H:107 fill:#eae4dc */}
                            <div 
                                className="w-[502px] rounded-[10px] p-2 flex items-center justify-center mb-4"
                                style={{ background: '#EAE4DC', height: '107px' }}
                            >
                                {/* Inner white box - Frame 293 W:484 H:72 */}
                                <div className="w-[484px] h-[72px] rounded-[5px] bg-white p-2">
                                    <textarea
                                        value={alasanTolak}
                                        onChange={(e) => {
                                            setAlasanTolak(e.target.value);
                                            if (pesanError) setPesanError('');
                                        }}
                                        placeholder="Alasan Penolakan (Wajib Jika Ditolak)"
                                        className="w-full h-full border-none outline-none resize-none text-[12px] text-[#4B2E2B]"
                                        style={{
                                            fontFamily: 'Plus Jakarta Sans, sans-serif',
                                            lineHeight: '18px',
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Bottom Buttons Row: Setujui & Ditolak side-by-side aligned right */}
                            <div className="w-[502px] flex justify-end gap-4">
                                {/* Setujui Button - Frame 294 W:172 H:42 fill:#5C8D69 */}
                                <button
                                    onClick={tanganiSetujui}
                                    disabled={sedangProses}
                                    className="flex items-center justify-center gap-2 rounded-[5px] font-bold text-[16px] transition-all hover:opacity-90 disabled:opacity-50"
                                    style={{
                                        width: '172px',
                                        height: '42px',
                                        background: '#5C8D69',
                                        color: '#1A3821',
                                        fontFamily: 'Plus Jakarta Sans, sans-serif',
                                    }}
                                >
                                    {sedangProses ? (
                                        <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                        </svg>
                                    )}
                                    Setujui
                                </button>

                                {/* Ditolak Button - Frame 295 W:172 H:42 fill:#C98285 */}
                                <button
                                    onClick={tanganiTolak}
                                    disabled={sedangProses}
                                    className="flex items-center justify-center gap-2 rounded-[5px] font-bold text-[16px] transition-all hover:opacity-90 disabled:opacity-50"
                                    style={{
                                        width: '172px',
                                        height: '42px',
                                        background: '#C98285',
                                        color: '#521A1C',
                                        fontFamily: 'Plus Jakarta Sans, sans-serif',
                                    }}
                                >
                                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>
                                    </svg>
                                    Ditolak
                                </button>
                            </div>

                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default ModalDetailKafe;
