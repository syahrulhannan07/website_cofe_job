import React, { useState } from 'react';

const BARIS_PER_HALAMAN = 5;

const getStatusStyle = (status) => {
    switch (status) {
        case 'Pending':
            return 'bg-[#FEAE2C] text-black';
        case 'Diterima':
            return 'bg-[#DBFEE5] text-[#519564]';
        case 'Ditolak':
            return 'bg-[#FEE5E5] text-[#C76A6A]';
        case 'Aktif':
            return 'bg-[#DBFEE5] text-[#519564]';
        case 'Wawancara':
            return 'bg-[#F9E1B8] text-[#B1894A]';
        default:
            return 'bg-gray-100 text-gray-600';
    }
};

// Format tanggal "2026-05-21 10:00:00" → "21 Mei 2026"
const formatTanggal = (tglStr) => {
    if (!tglStr) return '-';
    const bulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const d = new Date(tglStr);
    return `${d.getDate()} ${bulan[d.getMonth()]} ${d.getFullYear()}`;
};

const TabelPendaftarTerbaru = ({ dataPendaftar, sedangMemuat }) => {
    const [halamanAktif, setHalamanAktif] = useState(1);

    const daftarData = dataPendaftar || [];
    const totalHalaman = Math.max(1, Math.ceil(daftarData.length / BARIS_PER_HALAMAN));

    // Hitung data yang tampil sesuai halaman aktif
    const indeksAwal = (halamanAktif - 1) * BARIS_PER_HALAMAN;
    const dataHalaman = daftarData.slice(indeksAwal, indeksAwal + BARIS_PER_HALAMAN);

    const keHalamanSebelum = () => {
        setHalamanAktif((prev) => Math.max(1, prev - 1));
    };

    const keHalamanBerikut = () => {
        setHalamanAktif((prev) => Math.min(totalHalaman, prev + 1));
    };

    return (
        <div className="wadah-pendaftar-terbaru w-full">
            <div className="rounded-[5px] border border-[#4B2E2B] overflow-hidden flex flex-col h-full">
                <table className="tabel-pendaftar w-full text-left font-poppins border-collapse table-fixed">
                    <thead className="bg-[#F3EDE6] border-b border-[#4B2E2B]">
                        <tr className="text-[16px] font-bold text-black">
                            <th className="py-3 px-6 w-[25%]">Nama</th>
                            <th className="py-3 px-6 w-[20%]">Role</th>
                            <th className="py-3 px-6 w-[35%]">Tanggal daftar</th>
                            <th className="py-3 px-6 w-[20%] text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="isi-tabel-pendaftar text-[14px] text-black bg-[#E5D4C1]">
                        {sedangMemuat ? (
                            <tr>
                                <td colSpan={4} className="py-6 px-6 text-center text-[#4B2E2B]/50">
                                    Memuat data...
                                </td>
                            </tr>
                        ) : dataHalaman.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="py-6 px-6 text-center text-[#4B2E2B]/50">
                                    Belum ada data pendaftar
                                </td>
                            </tr>
                        ) : (
                            dataHalaman.map((row, idx) => (
                                <tr key={idx} className="baris-pendaftar border-b border-white/20 last:border-b-0 hover:bg-[#DBC6B1] transition-colors">
                                    <td className="py-1.5 px-6 font-medium truncate">{row.nama}</td>
                                    <td className="py-1.5 px-6 truncate">{row.role}</td>
                                    <td className="py-1.5 px-6 truncate">{formatTanggal(row.tanggal_daftar)}</td>
                                    <td className="py-1.5 px-6">
                                        <div className="flex justify-end items-center">
                                            <span className={`lencana-status px-4 py-0.5 rounded-[15px] font-bold text-[12px] min-w-[85px] text-center ${getStatusStyle(row.status)}`}>
                                                {row.status}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                {/* Navigasi paginasi */}
                <div className="navigasi-paginasi flex justify-end items-center px-4 py-2 bg-[#F3EDE6]">
                    <span className="text-[9px] text-black mr-2">Page {halamanAktif} of {totalHalaman}</span>
                    <div className="flex gap-1">
                        <button
                            onClick={keHalamanSebelum}
                            disabled={halamanAktif <= 1}
                            className="tombol-halaman-sebelum w-[15px] h-[15px] flex items-center justify-center bg-white rounded-[2px] text-[10px] disabled:opacity-30"
                        >
                            &lt;
                        </button>
                        <button
                            onClick={keHalamanBerikut}
                            disabled={halamanAktif >= totalHalaman}
                            className="tombol-halaman-berikut w-[15px] h-[15px] flex items-center justify-center bg-white rounded-[2px] text-[10px] rotate-180 disabled:opacity-30"
                        >
                            &lt;
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TabelPendaftarTerbaru;
