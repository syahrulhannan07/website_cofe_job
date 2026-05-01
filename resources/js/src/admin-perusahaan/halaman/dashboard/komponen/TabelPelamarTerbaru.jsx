import React, { useState } from 'react';

const TabelPelamarTerbaru = ({ dataPelamar }) => {
    const [halaman, setHalaman] = useState(1);
    const itemPerHalaman = 5;
    const totalHalaman = Math.ceil(dataPelamar.length / itemPerHalaman);

    const indeksAwal = (halaman - 1) * itemPerHalaman;
    const dataTampil = dataPelamar.slice(indeksAwal, indeksAwal + itemPerHalaman);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Diproses':
            case 'Pending':
                return 'bg-[#F7B750]';
            case 'Ditolak':
                return 'bg-[#F54E4E]';
            case 'Diterima':
                return 'bg-[#23BA1B]';
            case 'Wawancara':
                return 'bg-[#47E6F2]';
            default:
                return 'bg-[#F5B759]';
        }
    };

    return (
        <div className="tabel-pelamar-terbaru-container w-full bg-[#F3EDE6] border border-[#4B2E2B] rounded-[5px] p-[16px] flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-x-auto min-h-[180px]">
                <table className="w-full text-left border-collapse table-fixed">
                    <colgroup>
                        <col className="w-[25%]" />
                        <col className="w-[25%]" />
                        <col className="w-[30%]" />
                        <col className="w-[20%]" />
                    </colgroup>
                    <thead>
                        <tr className="header-tabel">
                            <th className="px-4 py-2 font-poppins font-bold text-[16px] text-black whitespace-nowrap">Nama</th>
                            <th className="px-4 py-2 font-poppins font-bold text-[16px] text-black whitespace-nowrap">Posisi Dilamar</th>
                            <th className="px-4 py-2 font-poppins font-bold text-[16px] text-black whitespace-nowrap">Tanggal Melamar</th>
                            <th className="px-4 py-2 font-poppins font-bold text-[16px] text-black text-center whitespace-nowrap">Status</th>
                        </tr>
                    </thead>
                    <tbody className="isi-tabel">
                        {dataTampil.map((p) => (
                            <tr key={p.id} className="baris-data-tabel bg-[#E5D4C1] border-b border-[#F3EDE6] border-opacity-50 last:border-b-0 h-[38px] hover:bg-[#D9C8B5] transition-colors">
                                <td className="px-4 py-1 font-poppins font-regular text-[12px] text-black truncate" title={p.nama}>
                                    {p.nama}
                                </td>
                                <td className="px-4 py-1 font-poppins font-regular text-[12px] text-black truncate" title={p.posisi}>
                                    {p.posisi}
                                </td>
                                <td className="px-4 py-1 font-poppins font-regular text-[12px] text-black">
                                    {p.tanggal}
                                </td>
                                <td className="px-4 py-1 text-center">
                                    <div className="flex justify-center">
                                        <span className={`pembungkus-status w-[100px] py-[3px] rounded-[15px] ${getStatusStyle(p.status)} font-poppins font-bold text-[12px] text-black shadow-sm text-center inline-block`}>
                                            {p.status === 'Diproses' ? 'Pending' : p.status}
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="paginasi-tabel self-end mt-2 flex items-center gap-2">
                <span className="info-halaman font-poppins text-[12px] text-black font-medium">
                    Page {halaman} of {totalHalaman}
                </span>
                <div className="tombol-paginasi flex gap-1">
                    <button 
                        onClick={() => setHalaman(h => Math.max(1, h - 1))} 
                        disabled={halaman === 1} 
                        className="w-[24px] h-[24px] flex items-center justify-center bg-white border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-30 transition-colors"
                    >
                        <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.5 15L7.5 10L12.5 5"/></svg>
                    </button>
                    <button 
                        onClick={() => setHalaman(h => Math.min(totalHalaman, h + 1))} 
                        disabled={halaman === totalHalaman} 
                        className="w-[24px] h-[24px] flex items-center justify-center bg-white border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-30 transition-colors"
                    >
                        <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.5 15L12.5 10L7.5 5"/></svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TabelPelamarTerbaru;
