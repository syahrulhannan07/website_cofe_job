import React, { useState, useEffect } from 'react';
import api from '../../../../layanan/api';
import layananScreeningNib from '../../../../layanan/layananScreeningNib';

const ModalDetailKafe = ({ kafeAktif, onTutup, onBerhasilVerifikasi }) => {
    const [alasanTolak, setAlasanTolak] = useState('');
    const [sedangProses, setSedangProses] = useState(false);
    const [pesanError, setPesanError] = useState('');
    const [skalaModal, setSkalaModal] = useState(1);

    // Screening NIB state
    const [dataScreening, setDataScreening] = useState(null);
    const [sedangMemuatScreening, setSedangMemuatScreening] = useState(false);
    const [pesanErrorScreening, setPesanErrorScreening] = useState('');
    const [menungguHasilScreening, setMenungguHasilScreening] = useState(false);

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

            // Hitung skala berdasarkan ruang layar yang tersedia (margin minimum 40px)
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
            // [UPDATE LOGIC] - Ubah ke PUT request /super-admin/verifikasi/{id}/setuju
            await api.put(`/super-admin/verifikasi/${kafeAktif.id}/setuju`);
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
            // [UPDATE LOGIC] - Ubah ke PUT request /super-admin/verifikasi/{id}/tolak
            await api.put(`/super-admin/verifikasi/${kafeAktif.id}/tolak`, {
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

    /* ---------- Screening NIB Functions ---------- */

    const tanganiMulaiScreening = async () => {
        setSedangMemuatScreening(true);
        setPesanErrorScreening('');
        try {
            const nibId = kafeAktif.nib?.id_nib;
            if (!nibId) {
                setPesanErrorScreening('NIB tidak tersedia untuk perusahaan ini.');
                return;
            }
            await layananScreeningNib.mulaiScreening(nibId);
            setMenungguHasilScreening(true);
            setDataScreening(null);
        } catch (err) {
            setPesanErrorScreening(err.response?.data?.message || 'Gagal memulai screening. Coba lagi.');
        } finally {
            setSedangMemuatScreening(false);
        }
    };

    const tanganiPerbaruiHasil = async () => {
        setSedangMemuatScreening(true);
        setPesanErrorScreening('');
        try {
            const nibId = kafeAktif.nib?.id_nib;
            if (!nibId) {
                setPesanErrorScreening('NIB tidak tersedia untuk perusahaan ini.');
                return;
            }
            try {
                const respons = await layananScreeningNib.ambilHasilScreening(nibId);
                setDataScreening(respons.data?.data || null);
                setMenungguHasilScreening(false);
            } catch (err) {
                if (err.response?.status === 404) {
                    // Hasil belum tersedia, pertahankan status menunggu
                    setDataScreening(null);
                    setMenungguHasilScreening(true);
                    setPesanErrorScreening('');
                } else {
                    setPesanErrorScreening(err.response?.data?.message || 'Gagal memuat hasil screening. Coba lagi.');
                }
            }
        } finally {
            setSedangMemuatScreening(false);
        }
    };

    const tanganiUlangScreening = async () => {
        setSedangMemuatScreening(true);
        setPesanErrorScreening('');
        try {
            const nibId = kafeAktif.nib?.id_nib;
            if (!nibId) {
                setPesanErrorScreening('NIB tidak tersedia untuk perusahaan ini.');
                return;
            }
            await layananScreeningNib.ulangScreening(nibId);
            setMenungguHasilScreening(true);
        } catch (err) {
            setPesanErrorScreening(err.response?.data?.message || 'Gagal meminta screening ulang. Coba lagi.');
        } finally {
            setSedangMemuatScreening(false);
        }
    };

    // Muat hasil screening saat modal dibuka jika NIB tersedia dan belum menunggu
    useEffect(() => {
        if (kafeAktif?.nib?.id_nib && dataScreening === null && !menungguHasilScreening) {
            tanganiPerbaruiHasil();
        }
    }, [kafeAktif?.nib?.id_nib, dataScreening, menungguHasilScreening]);

    const dataNib = kafeAktif.nib || null;
    const statusScreening = dataNib?.status_screening || null;
    const sudahDiperiksa = Boolean(statusScreening) && statusScreening !== 'Belum_Diperiksa';

    const nomorNib = dataNib?.nomor_nib || 'Belum tersedia';
    const labelStatusScreening = dataNib
        ? (statusScreening || 'Belum_Diperiksa')
        : 'Belum ada data NIB';

    const formatWaktu = (nilai) => {
        if (!nilai) return null;
        const tanggal = new Date(nilai);
        if (Number.isNaN(tanggal.getTime())) return null;
        return tanggal.toLocaleString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const labelDiperiksaPada = sudahDiperiksa
        ? (formatWaktu(dataNib?.diperiksa_pada) || '—')
        : 'Belum diperiksa';

    // [UPDATE LOGIC] - Sinkronkan dokumen NIB, lalu fallback dokumen lama
    const dokumenNib = kafeAktif.nib?.dokumen_nib || null;
    const dokumenLama = kafeAktif.dokumen_izin || kafeAktif.dokumen_legalitas || null;
    const nibId = kafeAktif.nib?.id_nib || null;

    const urlDokumen = dokumenNib
        ? `/api/v1/super-admin/nib/${nibId}/dokumen`
        : (dokumenLama ? `/storage/${dokumenLama}` : null);
    const labelSumberDokumen = urlDokumen
        ? (dokumenNib ? 'Dokumen NIB' : 'Dokumen lama — belum terhubung ke data NIB')
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

                {/* Body Content - Grid grid-cols-[314px_1fr] matching design, overflow-y-auto for screening section */}
                <div className="flex-1 grid grid-cols-[314px_1fr] gap-8 p-9 overflow-y-auto">

                    {/* Left Column: Tinjau Dokumen */}
                    <div className="flex flex-col h-full justify-between">
                        <div>
                            <h3
                                className="font-bold text-[16px] mb-4"
                                style={{ color: '#2B1810', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                            >
                                Tinjau Dokumen NIB & Izin Usaha
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

                            {labelSumberDokumen && (
                                <p
                                    className="mt-2 text-[10px] font-semibold text-[#827470] text-center"
                                    style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                                >
                                    {labelSumberDokumen}
                                </p>
                            )}
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

                            <div className="mt-3 pt-2 border-t border-[#EAE4DC] grid grid-cols-3 gap-3">
                                <div>
                                    <span className="text-[10px] font-semibold text-[#827470] uppercase tracking-wider block mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                                        Nomor NIB
                                    </span>
                                    <span className="text-[12px] font-semibold text-[#4B2E2B] break-all block" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        {nomorNib}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-[10px] font-semibold text-[#827470] uppercase tracking-wider block mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                                        Status Screening
                                    </span>
                                    <span className="text-[12px] font-semibold text-[#4B2E2B] block" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        {labelStatusScreening}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-[10px] font-semibold text-[#827470] uppercase tracking-wider block mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                                        Diperiksa Pada
                                    </span>
                                    <span className="text-[12px] font-semibold text-[#4B2E2B] block" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        {labelDiperiksaPada}
                                    </span>
                                </div>
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

                    {/* Screening NIB Section - Full width below two-column grid */}
                    <div className="col-span-2 flex flex-col gap-4">
                        {/* Header Screening */}
                        <div className="flex items-center justify-between border-b border-[#EAE4DC] pb-2">
                            <h3
                                className="font-bold text-[16px] mb-0"
                                style={{ color: '#2B1810', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                            >
                                Hasil Screening NIB
                            </h3>
                            {dataScreening && dataScreening.perlu_review_manual && (
                                <span className="flex items-center gap-1.5 px-2 py-1 rounded-[4px] bg-[#FCE6C9] text-[#8A5A00] text-[10px] font-bold uppercase tracking-wider" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                                    ⚠ Perlu Review Manual
                                </span>
                            )}
                        </div>

                        {/* Kondisi belum ada hasil */}
                        {!dataScreening && !menungguHasilScreening && (
                            <div className="flex flex-col items-center justify-center py-8 bg-[#F4ECE9] rounded-[10px] border border-dashed border-[#D5CFC8]">
                                <span className="text-[40px] mb-3">📋</span>
                                <span className="text-[13px] font-semibold text-[#827470]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                                    Belum ada hasil screening NIB
                                </span>
                                <button
                                    onClick={tanganiMulaiScreening}
                                    disabled={sedangMemuatScreening}
                                    className="mt-4 flex items-center justify-center gap-2 rounded-[5px] font-bold text-[14px] transition-all hover:opacity-90 disabled:opacity-50"
                                    style={{
                                        width: '160px',
                                        height: '36px',
                                        background: '#5C8D69',
                                        color: '#1A3821',
                                        fontFamily: 'Plus Jakarta Sans, sans-serif',
                                    }}
                                >
                                    {sedangMemuatScreening ? (
                                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                        </svg>
                                    )}
                                    Mulai Screening
                                </button>
                                {pesanErrorScreening && (
                                    <p className="mt-2 text-[11px] text-red-600 font-semibold" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                                        {pesanErrorScreening}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Kondisi menunggu hasil queue */}
                        {!dataScreening && menungguHasilScreening && (
                            <div className="flex flex-col items-center justify-center py-8 bg-[#F4ECE9] rounded-[10px] border border-dashed border-[#D5CFC8]">
                                <span className="text-[40px] mb-3">⏳</span>
                                <span className="text-[13px] font-semibold text-[#827470]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                                    Permintaan screening telah diterima. Menunggu proses antrian queue.
                                </span>
                                <button
                                    onClick={tanganiPerbaruiHasil}
                                    disabled={sedangMemuatScreening}
                                    className="mt-4 flex items-center justify-center gap-2 rounded-[5px] font-bold text-[14px] transition-all hover:opacity-90 disabled:opacity-50"
                                    style={{
                                        width: '160px',
                                        height: '36px',
                                        background: '#4B2E23',
                                        color: '#EAE4DC',
                                        fontFamily: 'Plus Jakarta Sans, sans-serif',
                                    }}
                                >
                                    {sedangMemuatScreening ? (
                                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                            <path d="M4 4v5h12V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5z"/>
                                        </svg>
                                    )}
                                    Perbarui Hasil
                                </button>
                                <p className="mt-2 text-[11px] text-[#827470]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                                    Klik "Perbarui Hasil" untuk memeriksa apakah hasil screening sudah tersedia.
                                </p>
                            </div>
                        )}

                        {/* Kondisi hasil tersedia */}
                        {dataScreening && (
                            <div className="flex flex-col gap-4">
                                {/* Metadata bar */}
                                <div className="grid grid-cols-3 gap-3 bg-[#F4ECE9] rounded-[8px] p-3">
                                    <div>
                                        <span className="text-[10px] font-semibold text-[#827470] uppercase block mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                                            Status Proses
                                        </span>
                                        <span className={`text-[12px] font-bold ${dataScreening.status_proses === 'BERHASIL' ? 'text-[#5C8D69]' : dataScreening.status_proses === 'BERHASIL_DENGAN_PERINGATAN' ? 'text-[#8A5A00]' : 'text-[#C98285]'}`} style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            {dataScreening.status_proses}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-semibold text-[#827470] uppercase block mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                                            Review Manual
                                        </span>
                                        <span className={`text-[12px] font-bold ${dataScreening.perlu_review_manual ? 'text-[#C98285]' : 'text-[#5C8D69]'}`} style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            {dataScreening.perlu_review_manual ? 'Ya' : 'Tidak'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-semibold text-[#827470] uppercase block mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                                            Diperiksa Pada
                                        </span>
                                        <span className="text-[12px] font-semibold text-[#4B2E2B] block" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            {dataScreening.dihasilkan_pada ? new Date(dataScreening.dihasilkan_pada).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                                        </span>
                                    </div>
                                </div>

                                {/* Alasan review manual */}
                                {dataScreening.perlu_review_manual && dataScreening.alasan_review && (
                                    <div className="bg-red-50 border border-red-200 rounded-[8px] p-3">
                                        <div className="flex items-start gap-2 mb-2">
                                            <span className="text-[12px]">⚠</span>
                                            <span className="text-[13px] font-semibold text-red-600" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                                                Alasan Review Manual
                                            </span>
                                        </div>
                                        <p className="text-[13px] text-[#4B2E2B] leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            {dataScreening.alasan_review}
                                        </p>
                                    </div>
                                )}

                                {/* Data Ekstraksi */}
                                <div className="border border-[#EAE4DC] rounded-[8px] p-3">
                                    <h4 className="font-bold text-[13px] mb-3" style={{ color: '#2B1810', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                                        Data Hasil Ekstraksi
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { label: 'Nomor NIB', kunci: 'nomor_nib' },
                                            { label: 'Nama Perusahaan', kunci: 'nama_perusahaan' },
                                            { label: 'Alamat Perusahaan', kunci: 'alamat_perusahaan' },
                                            { label: 'Tanggal Berdiri', kunci: 'tanggal_berdiri' },
                                        ].map((item) => {
                                            const field = dataScreening.data_terekstraksi.fields?.find(f => f.nama_field === item.kunci);
                                            return (
                                                <div key={item.kunci} className="flex flex-col gap-1">
                                                    <span className="text-[10px] font-semibold text-[#827470] uppercase block" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                                                        {item.label}
                                                    </span>
                                                    <span className={`text-[12px] font-semibold ${field?.validasi.status === 'VALID' ? 'text-[#5C8D69]' : field?.validasi.status === 'INVALID' ? 'text-[#C98285]' : 'text-[#4B2E2B]'}`} style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                        {field?.normalized_value || field?.raw_value || '—'}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Informasi QR */}
                                <div className="border border-[#EAE4DC] rounded-[8px] p-3">
                                    <h4 className="font-bold text-[13px] mb-3" style={{ color: '#2B1810', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                                        Informasi QR Code
                                    </h4>
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-semibold text-[#827470] uppercase block" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                                                Status QR
                                            </span>
                                            <span className={`text-[12px] font-bold ${dataScreening.qr.ditemukan ? 'text-[#5C8D69]' : 'text-[#827470]'}`} style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                {dataScreening.qr.ditemukan ? 'Ditemukan' : 'Tidak Ditemukan'}
                                            </span>
                                        </div>
                                        {dataScreening.qr.ditemukan && (
                                            <>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-semibold text-[#827470] uppercase block" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                                                        Jenis Konten
                                                    </span>
                                                    <span className="text-[12px] font-semibold text-[#4B2E2B] block" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                        {dataScreening.qr.jenis}
                                                    </span>
                                                </div>
                                                {dataScreening.qr.jenis === 'url' && (
                                                    <>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[10px] font-semibold text-[#827470] uppercase block" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                                                                Validasi URL
                                                            </span>
                                                            <span className={`text-[12px] font-bold ${dataScreening.qr.url_validasi?.is_oss_domain ? 'text-[#5C8D69]' : 'text-[#C98285]'}`} style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                                {dataScreening.qr.url_validasi?.is_oss_domain ? 'Domain OSS Diizinkan' : 'Domain Tidak Diizinkan'}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[10px] font-semibold text-[#827470] uppercase block" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                                                                Host
                                                            </span>
                                                            <span className="text-[12px] font-semibold text-[#4B2E2B] break-all block" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                                {dataScreening.qr.url_validasi?.host || '—'}
                                                            </span>
                                                        </div>
                                                    </>
                                                )}
                                            </>)}
                                        )}
                                    </div>
                                </div>

                                {/* Keterangan validasi QR */}
                                {dataScreening.qr.ditemukan && dataScreening.qr.jenis === 'url' && (
                                    <div className="bg-[#F4ECE9] border border-[#D5CFC8] rounded-[6px] p-2 mt-2">
                                        <p className="text-[10px] text-[#827470] leading-relaxed" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                                            <span className="font-bold text-[#4B2E2B]">Keterangan:</span> Validasi URL hanya memastikan hostname URL sesuai daftar host OSS yang diizinkan. Ini bukan verifikasi keaslian dokumen atau validasi nomor NIB melalui OSS.
                                        </p>
                                    </div>
                                )}

                                {/* Analisis Struktur */}
                                <div className="border border-[#EAE4DC] rounded-[8px] p-3">
                                    <h4 className="font-bold text-[13px] mb-3" style={{ color: '#2B1810', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                                        Analisis Struktur Dokumen
                                    </h4>
                                    <div className="flex flex-col gap-3">
                                        {dataScreening.analisis_struktur.indikator_struktur?.map((indikator, idx) => (
                                            <div key={idx} className="flex items-center gap-2 p-2 bg-[#F4ECE9] rounded-[6px]">
                                                <span className="w-2 h-2 rounded-full" style={{ background: indikator.includes('LENGKAP') ? '#5C8D69' : indikator.includes('KETIDAKSESUAIAN') || indikator.includes('TIDAK_LENGKAP') ? '#C98285' : '#8A5A00' }}></span>
                                                <span className="text-[12px] text-[#4B2E2B]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                    {indikator.replace(/_/g, ' ')}
                                                </span>
                                            </div>
                                        ))}
                                        {dataScreening.analisis_struktur.indikator_struktur.length === 0 && (
                                            <span className="text-[12px] text-[#827470]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                Tidak ada indikator struktur.
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Temuan Pemeriksaan */}
                                <div className="border border-[#EAE4DC] rounded-[8px] p-3">
                                    <h4 className="font-bold text-[13px] mb-3" style={{ color: '#2B1810', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                                        Temuan Pemeriksaan
                                    </h4>
                                    <div className="flex flex-col gap-3">
                                        {dataScreening.analisis_struktur.temuan?.map((temuan, idx) => (
                                            <div key={idx} className={`p-3 rounded-[6px] border ${temuan.tingkat_perhatian === 'CRITICAL' ? 'border-red-200 bg-red-50' : temuan.tingkat_perhatian === 'WARNING' ? 'border-[#FCE6C9] bg-[#FCE6C9]' : 'border-[#D1FAE5] bg-[#D1FAE5]'}`}>
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: temuan.tingkat_perhatian === 'CRITICAL' ? '#C98285' : temuan.tingkat_perhatian === 'WARNING' ? '#8A5A00' : '#5C8D69', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                                                        {temuan.jenis_temuan.replace(/_/g, ' ')}
                                                    </span>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-[4px] ${temuan.tingkat_perhatian === 'CRITICAL' ? 'bg-red-100 text-red-700' : temuan.tingkat_perhatian === 'WARNING' ? 'bg-[#FCE6C9]/50 text-[#8A5A00]' : 'bg-[#D1FAE5]/50 text-[#5C8D69]'}`}>
                                                        {temuan.tingkat_perhatian}
                                                    </span>
                                                </div>
                                                <p className="text-[12px] text-[#4B2E2B] leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                    {temuan.deskripsi}
                                                </p>
                                                {temuan.field_terkait && (
                                                    <p className="text-[11px] font-semibold text-[#827470] mt-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                                                        Field: {temuan.field_terkait}
                                                    </p>
                                                )}
                                                {temuan.halaman && (
                                                    <p className="text-[11px] font-semibold text-[#827470] mt-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                                                        Halaman: {temuan.halaman}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                        {dataScreening.analisis_struktur.temuan.length === 0 && (
                                            <span className="text-[12px] text-[#827470]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                Tidak ada temuan pemeriksaan.
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Ketidaksesuaian */}
                                {dataScreening.ketidaksesuaian && dataScreening.ketidaksesuaian.length > 0 && (
                                    <div className="border border-[#EAE4DC] rounded-[8px] p-3">
                                        <h4 className="font-bold text-[13px] mb-3" style={{ color: '#2B1810', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                                            Ketidaksesuaian Data
                                        </h4>
                                        <div className="flex flex-col gap-3">
                                            {dataScreening.ketidaksesuaian.map((mis, idx) => (
                                                <div key={idx} className="p-3 bg-[#FCE6C9]/50 rounded-[6px] border border-[#F5B750]/30">
                                                    <div className="flex justify-between mb-1">
                                                        <span className="text-[11px] font-bold text-[#8A5A00]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                                                            {mis.nama_field.replace(/_/g, ' ')}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-[11px] font-semibold text-[#827470]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                                                            Nilai Dokumen
                                                        </span>
                                                        <span className="text-[12px] text-[#4B2E2B] break-all" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                            {mis.nilai_dokumen ?? '—'}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col gap-1 mt-1">
                                                        <span className="text-[11px] font-semibold text-[#827470]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                                                            Nilai Database
                                                        </span>
                                                        <span className="text-[12px] text-[#4B2E2B] break-all" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                            {mis.nilai_database ?? '—'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Bukti Pemeriksaan */}
                                <div className="border border-[#EAE4DC] rounded-[8px] p-3">
                                    <h4 className="font-bold text-[13px] mb-3" style={{ color: '#2B1810', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                                        Bukti Pemeriksaan
                                    </h4>
                                    <div className="flex flex-col gap-3">
                                        {dataScreening.bukti_pemeriksaan?.map((bukti, idx) => (
                                            <div key={idx} className="p-3 bg-[#F4ECE9] rounded-[6px]">
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-[10px] font-semibold text-[#827470] uppercase" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                                                        {bukti.sumber}
                                                    </span>
                                                    {bukti.halaman && (
                                                        <span className="text-[10px] font-semibold text-[#5C8D69]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                                                            Halaman: {bukti.halaman}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[12px] text-[#4B2E2B] leading-relaxed break-all" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                    {bukti.bukti_teks || bukti.raw_value || '—'}
                                                </p>
                                            </div>
                                        ))}
                                        {dataScreening.bukti_pemeriksaan.length === 0 && (
                                            <span className="text-[12px] text-[#827470]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                Tidak ada bukti pemeriksaan.
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Tombol Screening Ulang */}
                                {!menungguHasilScreening && (
                                    <div className="flex justify-end">
                                        <button
                                            onClick={tanganiUlangScreening}
                                            disabled={sedangMemuatScreening}
                                            className="flex items-center justify-center gap-2 rounded-[5px] font-bold text-[14px] transition-all hover:opacity-90 disabled:opacity-50"
                                            style={{
                                                width: '150px',
                                                height: '36px',
                                                background: '#4B2E23',
                                                color: '#EAE4DC',
                                                fontFamily: 'Plus Jakarta Sans, sans-serif',
                                            }}
                                        >
                                            {sedangMemuatScreening ? (
                                                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                                </svg>
                                            ) : (
                                                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                                    <path d="M4 4v5h12V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5z"/>
                                                </svg>
                                            )}
                                            Screening Ulang
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    {/* End Screening NIB Section */}
                </div>

            </div>
        </div>
    );
};

export default ModalDetailKafe;
