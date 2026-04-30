import React, { useState } from 'react';

const TabelPelamarTerbaru = ({ dataPelamar }) => {
    const [halaman, setHalaman] = useState(1);
    const itemPerHalaman = 5;
    const totalHalaman = Math.ceil(dataPelamar.length / itemPerHalaman);

    const indeksAwal = (halaman - 1) * itemPerHalaman;
    const dataTampil = dataPelamar.slice(indeksAwal, indeksAwal + itemPerHalaman);

    return (
        <div className="tabel-pelamar-terbaru-container w-full bg-[#F3EDE6] border border-[#4B2E2B] rounded-[5px] p-[16px] flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="header-tabel">
                            <th className="px-4 py-2 font-poppins font-bold text-[16px] text-black">Nama</th>
                            <th className="px-4 py-2 font-poppins font-bold text-[16px] text-black">Posisi Dialamar</th>
                            <th className="px-4 py-2 font-poppins font-bold text-[16px] text-black">Tanggal melamar</th>
                            <th className="px-4 py-2 font-poppins font-bold text-[16px] text-black text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody className="isi-tabel">
                        {dataTampil.map((p) => (
                            <tr key={p.id} className="baris-data-tabel bg-[#E5D4C1] border-b border-[#F3EDE6] border-opacity-50 last:border-b-0 h-[35px] hover:bg-[#D9C8B5] transition-colors">
                                <td className="px-4 py-1 font-poppins font-regular text-[12px] text-black">
                                    {p.nama}
                                </td>
                                <td className="px-4 py-1 font-poppins font-regular text-[12px] text-black">
                                    {p.posisi}
                                </td>
                                <td className="px-4 py-1 font-poppins font-regular text-[12px] text-black">
                                    {p.tanggal}
                                </td>
                                <td className="px-4 py-1 text-center">
                                    <div className="flex justify-center">
                                        <span className="pembungkus-status px-[15px] py-[3px] rounded-[15px] bg-[#F5B759] font-poppins font-bold text-[12px] text-black shadow-sm">
                                            {p.status}
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
