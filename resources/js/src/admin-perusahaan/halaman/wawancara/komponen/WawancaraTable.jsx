import React from 'react';
import TrashIcon from '../../../aset/lowongan/TrashFill.svg';
import CheckCircleIcon from '../../../aset/pelamar/CheckAll.svg';
import PencilIcon from '../../../aset/lowongan/PencilSquare.svg';
import SchoolBriefcaseIcon from '../../../aset/pelamar/School Briefcase.png';

const WawancaraTable = ({ interviews, onEdit, onDelete, onSelesai }) => {
    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return { tanggal: '-', jam: '-' };
        const date = new Date(dateTimeString);
        return {
            tanggal: date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
            jam: date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':')
        };
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Terjadwal': return { bg: 'bg-[#DBEEFF]', text: 'text-[#565195]' };
            case 'Selesai': return { bg: 'bg-[#DAF7E1]', text: 'text-[#2E7D32]' };
            case 'Dibatalkan': return { bg: 'bg-[#FFE5E5]', text: 'text-[#C62828]' };
            default: return { bg: 'bg-gray-100', text: 'text-gray-600' };
        }
    };

    return (
        <div className="bg-white rounded-[10px] overflow-hidden shadow-sm border border-black/5">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-[#EBE4DC]">
                        <th className="p-4 font-semibold text-[13px] text-[#4B2E2B]">Nama Pelamar</th>
                        <th className="p-4 font-semibold text-[13px] text-[#4B2E2B]">Posisi</th>
                        <th className="p-4 font-semibold text-[13px] text-[#4B2E2B]">Tanggal</th>
                        <th className="p-4 font-semibold text-[13px] text-[#4B2E2B]">Jam</th>
                        <th className="p-4 font-semibold text-[13px] text-[#4B2E2B] text-center">Status</th>
                        <th className="p-4 font-semibold text-[13px] text-[#4B2E2B] text-center">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {interviews.length > 0 ? (
                        interviews.map((item) => {
                            const { tanggal, jam } = formatDateTime(item.tanggal_wawancara);
                            const statusStyle = getStatusStyle(item.status);
                            return (
                                <tr key={item.id_wawancara} className="border-b border-black/5 hover:bg-[#F9F7F4] transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-[#EBE4DC] overflow-hidden flex items-center justify-center">
                                                {item.kandidat?.foto_profil ? (
                                                    <img src={item.kandidat.foto_profil} alt={item.kandidat.nama_lengkap} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-[12px] font-bold text-[#4B2E2B]">{item.kandidat?.nama_lengkap?.charAt(0)}</span>
                                                )}
                                            </div>
                                            <span className="text-[14px] font-medium text-[#4B2E2B]">{item.kandidat?.nama_lengkap}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-[14px] text-[#4B2E2B]">{item.lowongan?.posisi}</td>
                                    <td className="p-4 text-[14px] text-[#4B2E2B]">{tanggal}</td>
                                    <td className="p-4 text-[14px] text-[#4B2E2B] font-mono">{jam}</td>
                                    <td className="p-4 text-center">
                                        <span className={`px-4 py-1 rounded-full text-[12px] font-semibold ${statusStyle.bg} ${statusStyle.text}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-center gap-2">
                                            {item.status === 'Terjadwal' && (
                                                <>
                                                    <button 
                                                        onClick={() => onSelesai(item.id_wawancara)}
                                                        className="p-2 hover:bg-[#DAF7E1] rounded-full transition-all group"
                                                        title="Tandai Selesai"
                                                    >
                                                        <img src={CheckCircleIcon} alt="check" className="w-5 h-5 opacity-40 group-hover:opacity-100" />
                                                    </button>
                                                    <button 
                                                        onClick={() => onEdit(item)}
                                                        className="p-2 hover:bg-blue-50 rounded-full transition-all group"
                                                        title="Ubah Jadwal"
                                                    >
                                                        <img src={PencilIcon} alt="edit" className="w-4 h-4 opacity-40 group-hover:opacity-100" />
                                                    </button>
                                                </>
                                            )}
                                            <button 
                                                onClick={() => onDelete(item.id_wawancara)}
                                                className="p-2 hover:bg-red-50 rounded-full transition-all group"
                                                title="Batalkan Jadwal"
                                            >
                                                <img src={TrashIcon} alt="delete" className="w-4 h-4 opacity-40 group-hover:opacity-100 group-hover:filter group-hover:sepia group-hover:hue-rotate-[320deg] group-hover:saturate-[10]" />
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
                                    <p className="text-[14px] font-medium">Belum ada jadwal wawancara.</p>
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
