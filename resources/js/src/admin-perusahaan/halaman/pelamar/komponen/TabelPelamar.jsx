import React from 'react';

const TabelPelamar = () => {
    const data = [
        { id: 1, nama: 'Syahrul Ramadhan', posisi: 'Senior Barista', tanggal: '30 April 2026', status: 'Wawancara' },
        { id: 2, nama: 'Budi Santoso', posisi: 'Head Roaster', tanggal: '28 April 2026', status: 'Diproses' },
        { id: 3, nama: 'Siti Aminah', posisi: 'Service Atten', tanggal: '25 April 2026', status: 'Diterima' },
        { id: 4, nama: 'Andi Wijaya', posisi: 'Senior Barista', tanggal: '24 April 2026', status: 'Ditolak' },
        { id: 5, nama: 'Rina Kartika', posisi: 'Head Roaster', tanggal: '22 April 2026', status: 'Diproses' },
    ];

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Wawancara': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'Diproses': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'Diterima': return 'bg-green-100 text-green-700 border-green-200';
            case 'Ditolak': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="bg-[#EAE4DC] border border-[#4B2E2B]/10 rounded-[12px] overflow-hidden">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-[#4B2E2B]/5">
                        <th className="px-6 py-4 text-left font-poppins font-bold text-[14px] text-[#4B2E2B]">Nama Pelamar</th>
                        <th className="px-6 py-4 text-left font-poppins font-bold text-[14px] text-[#4B2E2B]">Posisi Dilamar</th>
                        <th className="px-6 py-4 text-left font-poppins font-bold text-[14px] text-[#4B2E2B]">Tanggal Lamar</th>
                        <th className="px-6 py-4 text-left font-poppins font-bold text-[14px] text-[#4B2E2B]">Status</th>
                        <th className="px-6 py-4 text-center font-poppins font-bold text-[14px] text-[#4B2E2B]">Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#4B2E2B]/10">
                    {data.map((item) => (
                        <tr key={item.id} className="hover:bg-[#4B2E2B]/5 transition-colors">
                            <td className="px-6 py-4 font-poppins text-[14px] text-[#4B2E2B] font-medium">{item.nama}</td>
                            <td className="px-6 py-4 font-poppins text-[14px] text-[#7A6153]">{item.posisi}</td>
                            <td className="px-6 py-4 font-poppins text-[14px] text-[#7A6153]">{item.tanggal}</td>
                            <td className="px-6 py-4">
                                <span className={`px-3 py-1 rounded-full border text-[12px] font-semibold ${getStatusStyle(item.status)}`}>
                                    {item.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <button className="px-4 py-1.5 bg-white border border-[#4B2E2B]/20 text-[#4B2E2B] rounded-[6px] font-poppins text-[12px] font-bold hover:bg-[#4B2E2B] hover:text-white transition-all">
                                    Detail
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TabelPelamar;
