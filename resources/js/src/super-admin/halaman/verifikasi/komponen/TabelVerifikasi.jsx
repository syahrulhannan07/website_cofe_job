import React from 'react';
import ikonView from '../../../aset/verifikasi/view.svg';

/**
 * TabelVerifikasi — Komponen tabel yang menampilkan daftar kafe
 * dengan status "Menunggu Verifikasi".
 */
const TabelVerifikasi = ({ dataKafe = [], sedangMemuat, onLihatDetail }) => {

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

            {/* Baris Data */}
            <div className="area-baris-tabel flex flex-col divide-y divide-[#EAE4DC]">
                {dataKafe.map((kafe) => (
                    <div
                        key={kafe.id}
                        className="baris-kafe grid grid-cols-[1.5fr_1.2fr_1.2fr_1fr_0.8fr] gap-4 items-center px-12 py-5 hover:bg-[#F3EDE6]/30 transition-colors"
                    >
                        {/* Nama Perusahaan */}
                        <div className="flex items-center gap-5">
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
                        <div className="text-center">
                            <span className="font-poppins font-bold text-[15px] text-[#4B2E2B]">
                                {kafe.nama_pengguna || 'Admin-Fore'}
                            </span>
                        </div>

                        {/* Tanggal Registrasi */}
                        <div className="text-center">
                            <span className="font-poppins font-bold text-[15px] text-[#4B2E2B]">
                                {kafe.created_at
                                    ? new Date(kafe.created_at).toLocaleDateString('id-ID', {
                                          day: 'numeric', month: 'numeric', year: 'numeric',
                                      }).replace(/\//g, ' - ')
                                    : '21 - 4 - 2026'}
                            </span>
                        </div>

                        {/* Lokasi */}
                        <div className="text-center">
                            <span className="font-poppins font-bold text-[15px] text-[#4B2E2B]">
                                {kafe.kecamatan || 'Jatibarang'}
                            </span>
                        </div>

                        {/* Aksi */}
                        <div className="flex justify-center">
                            <button
                                onClick={() => onLihatDetail(kafe)}
                                className="w-[36px] h-[36px] flex items-center justify-center hover:bg-[#EAE4DC]/50 rounded-full transition-all focus:outline-none hover:scale-105"
                                title="Lihat Detail"
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
        </div>
    );
};

export default TabelVerifikasi;
