import React from 'react';

const TabelPelamar = () => {
    const dataPelamar = [
        {
            id: 1,
            nama: 'Ramadhan Sanjaya',
            email: 'ramadhansanjaya18@gmail.com',
            tanggal: '17 Maret 2026',
            pendidikan: 'S1 Terapan Komputer',
            status: 'Diterima',
            statusBg: 'bg-[#edf7ee]',
            statusText: 'text-[#3d7a40]'
        },
        {
            id: 2,
            nama: 'Syahrul Hannan Ramdhani',
            email: 'syahrulhannan07@gmail.com',
            tanggal: '20 Maret 2026',
            pendidikan: 'S1 Terapan Komputer',
            status: 'Diproses',
            statusBg: 'bg-[#eef2f6]',
            statusText: 'text-[#496b99]'
        },
        {
            id: 3,
            nama: 'Junanti',
            email: 'antitwvinterb@gmail.com',
            tanggal: '19 Maret 2026',
            pendidikan: 'S1 Terapan Komputer',
            status: 'Diterima',
            statusBg: 'bg-[#edf7ee]',
            statusText: 'text-[#3d7a40]'
        }
    ];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left font-poppins">
                <thead className="bg-[#fcfafa] border-b border-gray-200 text-[#7a6153] text-sm font-medium">
                    <tr>
                        <th className="px-6 py-4">Nama Pelamar</th>
                        <th className="px-6 py-4">Tanggal Melamar</th>
                        <th className="px-6 py-4">Pendidikan</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-center">Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-[#4b2e2b] text-sm">
                    {dataPelamar.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                                <div className="font-semibold">{item.nama}</div>
                                <div className="text-gray-500 text-xs mt-1">{item.email}</div>
                            </td>
                            <td className="px-6 py-4">{item.tanggal}</td>
                            <td className="px-6 py-4">{item.pendidikan}</td>
                            <td className="px-6 py-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${item.statusBg} ${item.statusText}`}>
                                    {item.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <button className="text-[#4b2e2b] hover:text-[#c2a38b] transition-colors p-2 rounded-lg hover:bg-gray-100">
                                    <svg className="w-5 h-5 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                                    </svg>
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
