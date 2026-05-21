import React, { useState, useEffect } from 'react';
import ikonView from '../../../aset/verifikasi/view.svg';

const BARIS_PER_HALAMAN = 10;

// Format tanggal ISO → "21 - 4 - 2026"
const formatTanggal = (isoStr) => {
    if (!isoStr) return '—';
    const d = new Date(isoStr);
    return `${d.getDate()} - ${d.getMonth() + 1} - ${d.getFullYear()}`;
};

const TabelVerifikasi = ({ dataKafe = [], sedangMemuat, onLihatDetail }) => {
    const [halamanAktif, setHalamanAktif] = useState(1);

    // Reset ke halaman 1 setiap kali data (hasil filter) berubah
    useEffect(() => {
        setHalamanAktif(1);
    }, [dataKafe.length]);

    // --- Skeleton Loading ---
    if (sedangMemuat) {
        return (
            <div className="wadah-tabel-verifikasi bg-white rounded-[12px] shadow-sm overflow-hidden border border-[#4B2E2B]">
                <div className="area-header-tabel flex items-center justify-between px-6 py-4 bg-[#F3EDE6] border-b border-[#4B2E2B]">
                    <div className="skeleton-judul h-[20px] w-[220px] bg-[#4B2E2B]/10 rounded-full animate-pulse" />
                    <div className="skeleton-badge h-[28px] w-[80px] bg-[#4B2E2B]/10 rounded-full animate-pulse" />
                </div>
                <div className="area-isi-tabel p-6 flex flex-col gap-3">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="baris-skeleton flex items-center gap-4 p-4 bg-[#F3EDE6]/50 rounded-[10px] animate-pulse">
                            <div className="h-[40px] w-[40px] bg-[#4B2E2B]/10 rounded-full flex-shrink-0" />
                            <div className="flex-1 flex flex-col gap-2">
                                <div className="h-[14px] w-[160px] bg-[#4B2E2B]/10 rounded-full" />
                                <div className="h-[12px] w-[100px] bg-[#4B2E2B]/10 rounded-full" />
                            </div>
                            <div className="h-[32px] w-[80px] bg-[#4B2E2B]/10 rounded-full" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // --- Kosong ---
    if (dataKafe.length === 0) {
        return (
            <div className="wadah-tabel-verifikasi bg-white rounded-[12px] shadow-sm border border-[#4B2E2B] p-[48px] flex flex-col items-center justify-center gap-4">
                <div className="ikon-kosong text-[48px]">☕</div>
                <p className="teks-kosong font-poppins font-semibold text-[#4B2E2B] text-[16px]">
                    Tidak ada kafe yang menunggu verifikasi
                </p>
                <p className="teks-sub-kosong font-poppins text-[14px] text-[#A08070]">
                    Semua pengajuan sudah ditangani
                </p>
            </div>
        );
    }

    const totalHalaman  = Math.max(1, Math.ceil(dataKafe.length / BARIS_PER_HALAMAN));
    const indeksAwal    = (halamanAktif - 1) * BARIS_PER_HALAMAN;
    const dataHalaman   = dataKafe.slice(indeksAwal, indeksAwal + BARIS_PER_HALAMAN);

    const keHalamanSebelum = () => setHalamanAktif((p) => Math.max(1, p - 1));
    const keHalamanBerikut = () => setHalamanAktif((p) => Math.min(totalHalaman, p + 1));

    return (
        <div className="wadah-tabel-verifikasi rounded-[15px] overflow-hidden bg-white shadow-md border border-[#EAE4DC] mt-6">
            {/* Header Tabel */}
            <div className="area-header-tabel grid grid-cols-[1.5fr_1.2fr_1.2fr_1fr_0.8fr] gap-4 px-12 py-6 bg-[#EAE4DC]/70 border-b border-[#4B2E2B]/10">
                {['Nama Perusahaan', 'Nama Pengelola', 'Tanggal Registrasi', 'Lokasi', 'Aksi'].map((kolom) => (
                    <span key={kolom} className="font-poppins font-bold text-[15px] text-[#4B2E2B] text-center first:text-left last:text-center">
                        {kolom}
                    </span>
                ))}
            </div>

            {/* Baris Data — hanya tampil 10 baris sesuai halaman aktif */}
            <div className="area-baris-tabel flex flex-col divide-y divide-[#EAE4DC]">
                {dataHalaman.map((kafe) => (
                    <div
                        key={kafe.id}
                        className="baris-kafe grid grid-cols-[1.5fr_1.2fr_1.2fr_1fr_0.8fr] gap-4 items-center px-12 py-5 hover:bg-[#F3EDE6]/30 transition-colors"
                    >
                        {/* Nama Perusahaan */}
                        <div className="sel-nama-perusahaan flex items-center gap-5">
                            <div className="w-[40px] h-[40px] bg-[#C69C6D] rounded-[6px] flex items-center justify-center flex-shrink-0">
                                <span className="font-poppins font-bold text-[14px] text-white">
                                    {kafe.nama_perusahaan?.charAt(0).toUpperCase() || '?'}
                                </span>
                            </div>
                            <span className="font-poppins font-bold text-[15px] text-[#4B2E2B]">
                                {kafe.nama_perusahaan}
                            </span>
                        </div>

                        {/* Nama Pengelola */}
                        <div className="sel-nama-pengelola text-center">
                            <span className="font-poppins font-bold text-[15px] text-[#4B2E2B]">
                                {kafe.nama_pengguna || '—'}
                            </span>
                        </div>

                        {/* Tanggal Registrasi */}
                        <div className="sel-tanggal-registrasi text-center">
                            <span className="font-poppins font-bold text-[15px] text-[#4B2E2B]">
                                {formatTanggal(kafe.created_at)}
                            </span>
                        </div>

                        {/* Lokasi */}
                        <div className="sel-lokasi text-center">
                            <span className="font-poppins font-bold text-[15px] text-[#4B2E2B]">
                                {kafe.kecamatan || '—'}
                            </span>
                        </div>

                        {/* Aksi — event handler onClick siap dihubungkan ke modal */}
                        <div className="sel-aksi flex justify-center">
                            <button
                                onClick={() => onLihatDetail(kafe)}
                                className="tombol-lihat-detail w-[36px] h-[36px] flex items-center justify-center hover:bg-[#EAE4DC]/50 rounded-full transition-all focus:outline-none hover:scale-105"
                                title="Lihat Detail"
                                aria-label={`Lihat detail ${kafe.nama_perusahaan}`}
                            >
                                <img
                                    src={ikonView}
                                    alt="View"
                                    className="w-[24px] h-[24px]"
                                />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer Paginasi */}
            <div className="area-paginasi flex items-center justify-between px-12 py-4 border-t border-[#EAE4DC] bg-[#F9F6F3]">
                <span className="info-paginasi font-poppins text-[13px] text-[#4B2E2B]/60">
                    Menampilkan {indeksAwal + 1}–{Math.min(indeksAwal + BARIS_PER_HALAMAN, dataKafe.length)} dari {dataKafe.length} data
                </span>

                <div className="kontrol-paginasi flex items-center gap-2">
                    {/* Tombol Sebelumnya */}
                    <button
                        onClick={keHalamanSebelum}
                        disabled={halamanAktif <= 1}
                        className="tombol-halaman-sebelum w-[32px] h-[32px] flex items-center justify-center rounded-[6px] border border-[#4B2E2B]/20 bg-white font-poppins text-[13px] text-[#4B2E2B] hover:bg-[#EAE4DC] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label="Halaman sebelumnya"
                    >
                        ‹
                    </button>

                    {/* Nomor-nomor halaman */}
                    {Array.from({ length: totalHalaman }, (_, i) => i + 1).map((nomor) => (
                        <button
                            key={nomor}
                            onClick={() => setHalamanAktif(nomor)}
                            className={`tombol-nomor-halaman w-[32px] h-[32px] flex items-center justify-center rounded-[6px] font-poppins text-[13px] font-semibold transition-colors ${
                                halamanAktif === nomor
                                    ? 'bg-[#4B2E2B] text-white'
                                    : 'border border-[#4B2E2B]/20 bg-white text-[#4B2E2B] hover:bg-[#EAE4DC]'
                            }`}
                            aria-label={`Halaman ${nomor}`}
                            aria-current={halamanAktif === nomor ? 'page' : undefined}
                        >
                            {nomor}
                        </button>
                    ))}

                    {/* Tombol Berikutnya */}
                    <button
                        onClick={keHalamanBerikut}
                        disabled={halamanAktif >= totalHalaman}
                        className="tombol-halaman-berikut w-[32px] h-[32px] flex items-center justify-center rounded-[6px] border border-[#4B2E2B]/20 bg-white font-poppins text-[13px] text-[#4B2E2B] hover:bg-[#EAE4DC] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label="Halaman berikutnya"
                    >
                        ›
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TabelVerifikasi;
