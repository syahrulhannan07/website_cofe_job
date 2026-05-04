import React, { useState, useEffect, useCallback } from 'react';
import FolderIcon from '../../../aset/pelamar/FolderFill.svg';
import GroupIcon from '../../../aset/pelamar/Group.png';
import HourglassSplitIcon from '../../../aset/pelamar/HourglassSplit.svg';
import CheckAllIcon from '../../../aset/pelamar/CheckAll.svg';
import XIcon from '../../../aset/pelamar/X.svg';
import ChatLeftFillIcon from '../../../aset/pelamar/ChatLeftFill.svg';
import SearchIcon from '../../../aset/pelamar/Search.svg';
import DownloadIcon from '../../../aset/pelamar/Download.svg';
import api from '../../../../layanan/api';
import LoadingKopi from '../../../komponen/LoadingKopi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import LogoAplikasi from '../../../../aset/logo.png';

const DetailPelamar = ({ lowongan, onBack, onSelectPelamar }) => {
    const [applicants, setApplicants] = useState([]);
    const [stats, setStats] = useState({ total: 0, diproses: 0, diterima: 0, ditolak: 0, wawancara: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const imageToBase64 = (url) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL('image/png'));
            };
            img.onerror = reject;
            img.src = url;
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get(`/admin/lowongan/${lowongan.id}/pelamar`, {
                params: { search }
            });
            setApplicants(response.data.data);
            if (response.data.meta?.statistik) {
                setStats(response.data.meta.statistik);
            }
        } catch (error) {
            console.error("Gagal mengambil data pelamar:", error);
        } finally {
            setLoading(false);
        }
    }, [lowongan.id, search]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleExportPDF = async () => {
        const doc = new jsPDF();
        const comp = lowongan.perusahaan || {};
        
        // 1. KOP SURAT (TANPA LOGO - TERPUSAT)
        // Teks Kop (Tengah)
        doc.setTextColor(75, 46, 43); // #4B2E2B
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text(comp.nama || "CAFE JOB", 105, 18, { align: 'center' });
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80, 68, 64);
        
        const address = comp.alamat || "Alamat Perusahaan Tidak Tersedia";
        const splitAddress = doc.splitTextToSize(address, 150);
        doc.text(splitAddress, 105, 24, { align: 'center' });
        
        // Hitung posisi Y dinamis untuk email agar tidak ada gap jauh
        const addressLineCount = splitAddress.length;
        const emailY = 24 + (addressLineCount * 5) + 1; 
        doc.text(`Email: ${comp.email || "-"}`, 105, emailY, { align: 'center' });
        
        // Garis Pembatas Kop
        doc.setDrawColor(75, 46, 43);
        doc.setLineWidth(0.5);
        doc.line(14, 38, 196, 38);
        doc.setLineWidth(0.1);
        doc.line(14, 39, 196, 39);

        // 2. JUDUL LAPORAN
        doc.setFontSize(18);
        doc.setTextColor(75, 46, 43);
        doc.setFont('helvetica', 'bold');
        doc.text("LAPORAN DATA PELAMAR", 105, 52, { align: 'center' });
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80, 68, 64);
        doc.text(`Posisi: ${lowongan.posisi || lowongan.judul}`, 14, 62);
        doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, 14, 68);
        
        // Add Filter Info if searching
        if (search) {
            doc.setFontSize(10);
            doc.setTextColor(160, 74, 74);
            doc.text(`Filter Pencarian: "${search}"`, 14, 76);
        }

        const tableColumn = ["No", "Nama Pelamar", "Email", "Tanggal Melamar", "Pendidikan", "Status"];
        const tableRows = [];

        applicants.forEach((app, index) => {
            const applicantData = [
                index + 1,
                app.pelamar.nama_lengkap,
                app.pelamar.email,
                formatDate(app.tanggal_melamar),
                app.pendidikan_terakhir || '-',
                app.status
            ];
            tableRows.push(applicantData);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: search ? 82 : 77,
            theme: 'grid',
            headStyles: { 
                fillColor: [75, 46, 43],
                textColor: [243, 237, 230],
                fontSize: 11,
                halign: 'center'
            },
            columnStyles: {
                0: { halign: 'center', cellWidth: 10 },
                5: { halign: 'center' }
            },
            styles: { font: 'helvetica', fontSize: 10 },
            margin: { top: 40 }
        });

        const fileName = `Laporan_Pelamar_${(lowongan.posisi || lowongan.judul).replace(/\s+/g, '_')}.pdf`;
        doc.save(fileName);
    };

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
                <div className="flex flex-col gap-[4px] lg:gap-[8px]">
                    <h1 className="font-poppins font-bold text-[24px] lg:text-[32px] text-[#4B2E2B] leading-tight lg:leading-[48px]">
                        Manajemen Data Pelamar
                    </h1>
                    <p className="font-poppins text-[14px] lg:text-[16px] text-[#504440] leading-snug lg:leading-[24px]">
                        Kelola data pelamar yang telah mengajukan lamaran pekerjaan.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-[10px] lg:gap-[14px] w-full lg:w-auto">
                    <button 
                        onClick={handleExportPDF}
                        disabled={applicants.length === 0}
                        className="h-[40px] bg-[#4B2E2B] hover:bg-[#4B2E2B]/90 disabled:opacity-50 rounded-full px-[16px] flex items-center justify-center gap-[8px] transition-colors flex-1 lg:flex-none"
                    >
                        <img src={DownloadIcon} alt="Export" className="w-[18px] h-[18px] object-contain shrink-0" />
                        <span className="font-poppins text-[13px] text-[#F3EDE6] whitespace-nowrap">Export data</span>
                    </button>

                    <div className="h-[40px] bg-[#EAE4DC] border border-[#CCCCCC]/80 rounded-full px-[15px] flex items-center gap-[10px] flex-1 lg:flex-none lg:w-[205px] min-w-[150px]">
                        <img src={SearchIcon} alt="Search" className="w-[18px] h-[18px] object-contain shrink-0" />
                        <input 
                            type="text" 
                            placeholder="Cari nama pelamar" 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-transparent border-none outline-none font-poppins text-[13px] text-[#4B2E2B] placeholder-[#4B2E2B] w-full h-full"
                        />
                    </div>
                </div>
            </div>

            {/* Summary Statistics */}
            <div className="flex flex-nowrap gap-[10px] mb-[40px] w-full overflow-x-auto no-scrollbar pb-2">
                {[
                    { label: 'Total Pelamar', value: stats.total, bg: 'bg-[#EAE4DC]', text: 'text-[#4B2E2B]', icon: GroupIcon },
                    { label: 'Diproses', value: stats.diproses, bg: 'bg-[#DBEAFE]', text: 'text-[#496B99]', icon: HourglassSplitIcon },
                    { label: 'Diterima', value: stats.diterima, bg: 'bg-[#DBFEE6]', text: 'text-[#3FAC5E]', icon: CheckAllIcon },
                    { label: 'Ditolak', value: stats.ditolak, bg: 'bg-[#FEEBEB]', text: 'text-[#A04A4A]', icon: XIcon },
                    { label: 'Wawancara', value: stats.wawancara, bg: 'bg-[#FFE6BD]', text: 'text-[#B08949]', icon: ChatLeftFillIcon }
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
                    <div className="flex flex-col bg-transparent rounded-b-[10px] border border-t-0 border-[#CCCCCC]/80 overflow-hidden min-h-[200px]">
                        {loading ? (
                            <LoadingKopi fullScreen={false} />
                        ) : applicants.length > 0 ? (
                            applicants.map((app, index) => (
                                <div key={app.id_lamaran} className={`grid grid-cols-12 items-center px-[46px] h-[63px] ${index !== applicants.length - 1 ? 'border-b border-[#CCCCCC]/80' : ''} hover:bg-black/5 transition-colors`}>
                                    <div className="col-span-3 flex flex-col justify-center">
                                        <span className="font-poppins font-semibold text-[13px] text-[#4B2E2B] leading-[19.5px] truncate mr-2">{app.pelamar.nama_lengkap}</span>
                                        <span className="font-poppins font-normal text-[10px] text-[#4B2E2B] leading-[15px] truncate mr-2">{app.pelamar.email}</span>
                                    </div>
                                    <div className="col-span-3 font-poppins font-semibold text-[13px] text-[#4B2E2B] leading-[19.5px]">
                                        {formatDate(app.tanggal_melamar)}
                                    </div>
                                    <div className="col-span-3 font-poppins font-semibold text-[13px] text-[#4B2E2B] leading-[19.5px] truncate mr-2">
                                        {app.pendidikan_terakhir || '-'}
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
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20">
                                <p className="font-poppins text-[#4B2E2B]/50 italic">Tidak ada pelamar ditemukan</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailPelamar;
