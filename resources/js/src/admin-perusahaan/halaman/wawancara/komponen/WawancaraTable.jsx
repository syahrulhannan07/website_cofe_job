import React from 'react';
import TrashIcon from '../../../aset/lowongan/TrashFill.svg';
import CheckCircleIcon from '../../../aset/pelamar/CheckAll.svg';
import PencilIcon from '../../../aset/lowongan/PencilSquare.svg';
import SchoolBriefcaseIcon from '../../../aset/pelamar/School Briefcase.png';

const WawancaraTable = ({ interviews, onEdit, onDelete, onSelesai }) => {
    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return { tanggal: '-', jam: '-' };
        const date = new Date(dateTimeString);
        
        // Manual month mapping for id-ID (Figma style)
        const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        const day = date.getDate();
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        
        return {
            tanggal: `${day} ${month} ${year}`,
            jam: date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }).replace('.', ':') + ' WIB'
        };
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Terjadwal': return { bg: 'bg-[#DBEEFF]', text: 'text-[#565195]' };
            case 'Selesai': return { bg: 'bg-[#DAF7E1]', text: 'text-[#2E7D32]' };
            case 'Dibatalkan': return { bg: 'bg-[#FFE5E5]', text: 'text-[#C76A6A]' };
            default: return { bg: 'bg-gray-100', text: 'text-gray-600' };
        }
    };

    return (
        <div className="bg-white rounded-[10px] overflow-x-auto shadow-sm border border-black/5">
            <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                    <tr className="bg-[#EBE4DC] h-[63px]">
                        <th className="px-6 font-semibold text-[13px] text-[#4B2E2B] font-poppins">Nama Pelamar</th>
                        <th className="px-6 font-semibold text-[13px] text-[#4B2E2B] font-poppins">Posisi</th>
                        <th className="px-6 font-semibold text-[13px] text-[#4B2E2B] font-poppins">Tanggal</th>
                        <th className="px-6 font-semibold text-[13px] text-[#4B2E2B] font-poppins">Jam</th>
                        <th className="px-6 font-semibold text-[13px] text-[#4B2E2B] font-poppins text-center">Status</th>
                        <th className="px-6 font-semibold text-[13px] text-[#4B2E2B] font-poppins text-center">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {interviews.length > 0 ? (
                        interviews.map((item) => {
                            const { tanggal, jam } = formatDateTime(item.tanggal_wawancara);
                            const statusStyle = getStatusStyle(item.status);
                            return (
                                <tr key={item.id_wawancara} className="h-[63px] border-b border-black/5 hover:bg-[#F9F7F4] transition-colors group">
                                    <td className="px-6">
                                        <span className="text-[13px] font-semibold text-[#4B2E2B] font-poppins">{item.kandidat?.nama_lengkap}</span>
                                    </td>
                                    <td className="px-6">
                                        <span className="text-[13px] font-semibold text-[#4B2E2B] font-poppins">{item.lowongan?.posisi}</span>
                                    </td>
                                    <td className="px-6">
                                        <span className="text-[13px] font-semibold text-[#4B2E2B] font-poppins">{tanggal}</span>
                                    </td>
                                    <td className="px-6">
                                        <span className="text-[13px] font-semibold text-[#4B2E2B] font-poppins uppercase">{jam}</span>
                                    </td>
                                    <td className="px-6 text-center">
                                        <span className={`inline-flex items-center justify-center min-w-[96px] h-[27px] rounded-full text-[13px] font-semibold ${statusStyle.bg} ${statusStyle.text} font-poppins`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-6">
                                        <div className="flex items-center justify-center gap-3">
                                            {item.status === 'Terjadwal' && (
                                                <>
                                                    <button 
                                                        onClick={() => onSelesai(item.id_wawancara)}
                                                        className="transition-all hover:scale-110"
                                                        title="Tandai Selesai"
                                                    >
                                                        <img src={CheckCircleIcon} alt="check" className="w-[18px] h-[18px] opacity-40 group-hover:opacity-100" />
                                                    </button>
                                                    <button 
                                                        onClick={() => onEdit(item)}
                                                        className="transition-all hover:scale-110"
                                                        title="Ubah Jadwal"
                                                    >
                                                        <img src={PencilIcon} alt="edit" className="w-[18px] h-[18px] opacity-40 group-hover:opacity-100" />
                                                    </button>
                                                </>
                                            )}
                                            <button 
                                                onClick={() => onDelete(item.id_wawancara)}
                                                className="transition-all hover:scale-110"
                                                title="Batalkan Jadwal"
                                            >
                                                <img 
                                                    src={TrashIcon} 
                                                    alt="delete" 
                                                    className="w-[18px] h-[18px] opacity-40 group-hover:opacity-100" 
                                                    style={{ filter: item.status === 'Terjadwal' ? '' : 'grayscale(1)' }}
                                                />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan="6" className="p-20 text-center">
                                <div className="flex flex-col items-center opacity-30">
                                    <img src={SchoolBriefcaseIcon} alt="empty" className="w-16 h-16 mb-4" />
                                    <p className="text-[14px] font-medium font-poppins">Belum ada jadwal wawancara.</p>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default WawancaraTable;
