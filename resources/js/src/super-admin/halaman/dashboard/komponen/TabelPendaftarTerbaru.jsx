import React from 'react';

const dataPendaftar = [
    { nama: 'Syahrul', role: 'Perusahaan', tanggal: '30 April 2026', status: 'Pending' },
    { nama: 'Ramadhan', role: 'Pelamar', tanggal: '12 April 2026', status: 'Diterima' },
    { nama: 'Junanti', role: 'Pelamar', tanggal: '03 April 2026', status: 'Ditolak' },
    { nama: 'Syjura', role: 'Perusahaan', tanggal: '21 April 2026', status: 'Diterima' },
    { nama: 'Syjura', role: 'Pelamar', tanggal: '21 April 2026', status: 'Wawancara' },
];

const getStatusStyle = (status) => {
    switch (status) {
        case 'Pending':
            return 'bg-[#FEAE2C] text-black';
        case 'Diterima':
            return 'bg-[#DBFEE5] text-[#519564]';
        case 'Ditolak':
            return 'bg-[#FEE5E5] text-[#C76A6A]';
        case 'Wawancara':
            return 'bg-[#F9E1B8] text-[#B1894A]'; // Adjusted color for Wawancara badge
        default:
            return 'bg-gray-100 text-gray-600';
    }
};

const TabelPendaftarTerbaru = () => {
    return (
        <div className="wadah-pendaftar-terbaru w-full">
            <div className="rounded-[5px] border border-[#4B2E2B] overflow-hidden flex flex-col h-full">
                <table className="w-full text-left font-poppins border-collapse table-fixed">
                    <thead className="bg-[#F3EDE6] border-b border-[#4B2E2B]">
                        <tr className="text-[16px] font-bold text-black">
                            <th className="py-3 px-6 w-[25%]">Nama</th>
                            <th className="py-3 px-6 w-[20%]">Role</th>
                            <th className="py-3 px-6 w-[35%]">Tanggal daftar</th>
                            <th className="py-3 px-6 w-[20%] text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="text-[14px] text-black bg-[#E5D4C1]">
                        {dataPendaftar.map((row, idx) => (
                            <tr key={idx} className="border-b border-white/20 last:border-b-0 hover:bg-[#DBC6B1] transition-colors">
                                <td className="py-1.5 px-6 font-medium truncate">{row.nama}</td>
                                <td className="py-1.5 px-6 truncate">{row.role}</td>
                                <td className="py-1.5 px-6 truncate">{row.tanggal}</td>
                                <td className="py-1.5 px-6">
                                    <div className="flex justify-end items-center">
                                        <span className={`px-4 py-0.5 rounded-[15px] font-bold text-[12px] min-w-[85px] text-center ${getStatusStyle(row.status)}`}>
                                            {row.status}
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="flex justify-end items-center px-4 py-2 bg-[#F3EDE6]">
                    <span className="text-[9px] text-black mr-2">Page 1 of 3</span>
                    <div className="flex gap-1">
                        <button className="w-[15px] h-[15px] flex items-center justify-center bg-white rounded-[2px] text-[10px]">&lt;</button>
                        <button className="w-[15px] h-[15px] flex items-center justify-center bg-white rounded-[2px] text-[10px] rotate-180">&lt;</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TabelPendaftarTerbaru;
