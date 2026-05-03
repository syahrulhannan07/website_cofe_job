import React from 'react';
import FolderIcon from '../../../aset/pelamar/FolderFill.svg';
import GroupIcon from '../../../aset/pelamar/Group.png';
import HourglassSplitIcon from '../../../aset/pelamar/HourglassSplit.svg';
import CheckAllIcon from '../../../aset/pelamar/CheckAll.svg';
import XIcon from '../../../aset/pelamar/X.svg';
import ChatLeftFillIcon from '../../../aset/pelamar/ChatLeftFill.svg';
import SearchIcon from '../../../aset/pelamar/Search.svg';
import DownloadIcon from '../../../aset/pelamar/Download.svg';

const DetailPelamar = ({ lowongan, onBack, onSelectPelamar }) => {
    // Dummy data based on Figma
    const applicants = [
        {
            id: 1,
            nama: 'Syahrul Hannan Ramdhani',
            email: 'syahrulhannan07@gmail.com',
            tanggal: '20 Maret 2026',
            pendidikan: 'S1 Terapan Komputer',
            status: 'Diterima'
        },
        {
            id: 2,
            nama: 'Ahmad Faisal',
            email: 'faisal.ahmad@example.com',
            tanggal: '18 Maret 2026',
            pendidikan: 'SMK Tata Boga',
            status: 'Diproses'
        },
        {
            id: 3,
            nama: 'Siti Aminah',
            email: 'siti.aminah@example.com',
            tanggal: '17 Maret 2026',
            pendidikan: 'D3 Perhotelan',
            status: 'Diterima'
        }
    ];

    const getStatusStyles = (status) => {
        switch (status) {
            case 'Diterima':
                return 'bg-[#DBFEE6] text-[#509564]';
            case 'Ditolak':
                return 'bg-[#FEEBEB] text-[#A04A4A]';
            case 'Diproses':
                return 'bg-[#DBEAFE] text-[#496B99]';
            case 'Wawancara':
                return 'bg-[#FFE6BD] text-[#B08949]';
            default:
                return 'bg-[#EAE4DC] text-[#4B2E2B]';
        }
    };

    return (
        <div className="flex flex-col w-full max-w-[1055px] animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Header Area */}
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-[30px] w-full">
                {/* Header Title & Subtitle */}
                <div className="flex flex-col gap-[4px] lg:gap-[8px]">
                    <h1 className="font-poppins font-bold text-[24px] lg:text-[32px] text-[#4B2E2B] leading-tight lg:leading-[48px]">
                        Manajemen Data Pelamar
                    </h1>
                    <p className="font-poppins text-[14px] lg:text-[16px] text-[#504440] leading-snug lg:leading-[24px]">
                        Kelola data pelamar yang telah mengajukan lamaran pekerjaan.
                    </p>
                </div>

                {/* Actions: Export & Search */}
                <div className="flex flex-wrap items-center gap-[10px] lg:gap-[14px] w-full lg:w-auto">
                    {/* Export Button */}
                    <button className="h-[40px] bg-[#4B2E2B] hover:bg-[#4B2E2B]/90 rounded-full px-[16px] flex items-center justify-center gap-[8px] transition-colors flex-1 lg:flex-none">
                        <img src={DownloadIcon} alt="Export" className="w-[18px] h-[18px] object-contain shrink-0" />
                        <span className="font-poppins text-[13px] text-[#F3EDE6] whitespace-nowrap">Export data</span>
                    </button>

                    {/* Search Bar */}
                    <div className="h-[40px] bg-[#EAE4DC] border border-[#CCCCCC]/80 rounded-full px-[15px] flex items-center gap-[10px] flex-1 lg:flex-none lg:w-[205px] min-w-[150px]">
                        <img src={SearchIcon} alt="Search" className="w-[18px] h-[18px] object-contain shrink-0" />
                        <input 
                            type="text" 
                            placeholder="Cari nama pelamar" 
                            className="bg-transparent border-none outline-none font-poppins text-[13px] text-[#4B2E2B] placeholder-[#4B2E2B] w-full h-full"
                        />
                    </div>
                </div>
            </div>

            {/* Summary Statistics */}
            <div className="flex flex-nowrap gap-[10px] mb-[40px] w-full overflow-x-auto no-scrollbar pb-2">
                {[
                    { label: 'Total Pelamar', value: lowongan.jumlahPelamar, bg: 'bg-[#EAE4DC]', text: 'text-[#4B2E2B]', icon: GroupIcon },
                    { label: 'Diproses', value: 1, bg: 'bg-[#DBEAFE]', text: 'text-[#496B99]', icon: HourglassSplitIcon },
                    { label: 'Diterima', value: 2, bg: 'bg-[#DBFEE6]', text: 'text-[#3FAC5E]', icon: CheckAllIcon },
                    { label: 'Ditolak', value: 0, bg: 'bg-[#FEEBEB]', text: 'text-[#A04A4A]', icon: XIcon },
                    { label: 'Wawancara', value: 4, bg: 'bg-[#FFE6BD]', text: 'text-[#B08949]', icon: ChatLeftFillIcon }
                ].map((stat, idx) => (
                    <div key={idx} className={`flex-1 min-w-max h-[54px] ${stat.bg} rounded-[10px] border border-[#CCCCCC]/80 flex items-center justify-between px-3 lg:px-4 xl:px-5 shrink-0 gap-3`}>
                        <div className="flex items-center gap-[6px] lg:gap-2 shrink-0">
                            <img src={stat.icon} alt={stat.label} className="w-[18px] h-[18px] lg:w-[22px] lg:h-[22px] xl:w-[28px] xl:h-[28px] object-contain shrink-0" />
                            <span className={`font-poppins text-[12px] lg:text-[14px] xl:text-[15px] ${stat.text} whitespace-nowrap`}>{stat.label}</span>
                        </div>
                        <span className={`font-poppins font-semibold text-[18px] lg:text-[20px] xl:text-[24px] ${stat.text} leading-none shrink-0`}>{stat.value}</span>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="w-full bg-transparent overflow-x-auto no-scrollbar">
                <div className="min-w-[900px] w-full">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 px-[46px] h-[63px] items-center bg-[#EAE4DC] rounded-t-[10px]">
                        <div className="col-span-3 font-poppins font-semibold text-[13px] text-[#4B2E2B]">Nama Pelamar</div>
                        <div className="col-span-3 font-poppins font-semibold text-[13px] text-[#4B2E2B]">Tanggal Melamar</div>
                        <div className="col-span-3 font-poppins font-semibold text-[13px] text-[#4B2E2B]">Pendidikan</div>
                        <div className="col-span-2 font-poppins font-semibold text-[13px] text-[#4B2E2B]">Status</div>
                        <div className="col-span-1 font-poppins font-semibold text-[13px] text-[#4B2E2B]">Aksi</div>
                    </div>

                    {/* Table Rows */}
                    <div className="flex flex-col bg-transparent rounded-b-[10px] border border-t-0 border-[#CCCCCC]/80 overflow-hidden">
                        {applicants.map((app, index) => (
                            <div key={app.id} className={`grid grid-cols-12 items-center px-[46px] h-[63px] ${index !== applicants.length - 1 ? 'border-b border-[#CCCCCC]/80' : ''} hover:bg-black/5 transition-colors`}>
                                <div className="col-span-3 flex flex-col justify-center">
                                    <span className="font-poppins font-semibold text-[13px] text-[#4B2E2B] leading-[19.5px]">{app.nama}</span>
                                    <span className="font-poppins font-normal text-[10px] text-[#4B2E2B] leading-[15px]">{app.email}</span>
                                </div>
                                <div className="col-span-3 font-poppins font-semibold text-[13px] text-[#4B2E2B] leading-[19.5px]">
                                    {app.tanggal}
                                </div>
                                <div className="col-span-3 font-poppins font-semibold text-[13px] text-[#4B2E2B] leading-[19.5px]">
                                    {app.pendidikan}
                                </div>
                                <div className="col-span-2 flex items-center">
                                    <div className={`h-[27px] px-3 flex items-center justify-center rounded-[50px] text-[13px] font-poppins font-semibold leading-[19.5px] ${getStatusStyles(app.status)}`}>
                                        {app.status}
                                    </div>
                                </div>
                                <div className="col-span-1 flex items-center">
                                    <button 
                                        onClick={() => onSelectPelamar ? onSelectPelamar(app) : null}
                                        className="hover:bg-[#4B2E2B]/10 rounded-md p-1 transition-colors group cursor-pointer"
                                    >
                                        <img src={FolderIcon} alt="Detail" className="w-[25px] h-[25px] object-contain group-hover:scale-110 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailPelamar;
