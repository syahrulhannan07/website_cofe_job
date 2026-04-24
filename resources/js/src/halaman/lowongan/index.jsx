import React from 'react';
import starbucksLogo from '../../aset/beranda/starbucks.png';
import iconLocation from '../../aset/lowongan/Location.png';
import iconSearch from '../../aset/lowongan/Search.png';
import iconExpand from '../../aset/lowongan/Expand Arrow.png';

const daftarLowongan = [
    {
        id: 1,
        judul: 'Senior Barista',
        perusahaan: 'Indra Coffee Roasters',
        lokasi: 'Karangampel',
        gaji: 'IDR 3.5M - 4.5M',
        logoText: 'ICR',
    },
    {
        id: 2,
        judul: 'Head Roaster',
        perusahaan: 'Mangga Dua Coffee Hub',
        lokasi: 'Jatibarang',
        gaji: 'IDR 5.0M - 7.0M',
        logoText: 'MDC',
    },
    {
        id: 3,
        judul: 'Service Attendant',
        perusahaan: 'Cimanuk Brew House',
        lokasi: 'Indramayu Kota',
        gaji: 'IDR 1.8M - 2.2M',
        logoText: 'CBH',
    },
    {
        id: 4,
        judul: 'Junior Barista',
        perusahaan: 'Ujung Kulon Cafe',
        lokasi: 'Sindang',
        gaji: 'IDR 2.5M - 3.0M',
        logoText: 'UKC',
    },
    {
        id: 5,
        judul: 'Outlet Manager',
        perusahaan: 'Dermayu Beans & Co.',
        lokasi: 'Lohbener',
        gaji: 'IDR 4.5M - 6.0M',
        logoText: 'DBC',
    },
    {
        id: 6,
        judul: 'Pastry Chef',
        perusahaan: 'Sweet Bean Cafe',
        lokasi: 'Karangampel',
        gaji: 'IDR 3.0M - 4.5M',
        logoText: 'SBC',
    }
];

// Ikon Lokasi (Standardized from Figma)
const IkonLokasi = () => (
    <svg width="12" height="14" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 0C2.685 0 0 2.685 0 6C0 10.5 6 14 6 14C6 14 12 10.5 12 6C12 2.685 9.315 0 6 0ZM6 8.125C4.82625 8.125 3.875 7.17375 3.875 6C3.875 4.82625 4.82625 3.875 6 3.875C7.17375 3.875 8.125 4.82625 8.125 6C8.125 7.17375 7.17375 8.125 6 8.125Z" fill="#82746D"/>
    </svg>
);

// Ikon Gaji (Standardized from Figma)
const IkonGaji = () => (
    <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.25 0H1.75C0.7875 0 0 0.7875 0 1.75V8.25C0 9.2125 0.7875 10 1.75 10H12.25C13.2125 10 14 9.2125 14 8.25V1.75C14 0.7875 13.2125 0 12.25 0ZM7 7.5C5.6175 7.5 4.5 6.3825 4.5 5C4.5 3.6175 5.6175 2.5 7 2.5C8.3825 2.5 9.5 3.6175 9.5 5C9.5 6.3825 8.3825 7.5 7 7.5ZM12.25 3C11.835 3 11.5 2.665 11.5 2.25C11.5 1.835 11.835 1.5 12.25 1.5C12.665 1.5 13 1.835 13 2.25C13 2.665 12.665 3 12.25 3ZM1.75 3C1.335 3 1 2.665 1 2.25C1 1.835 1.335 1.5 1.75 1.5C2.165 1.5 2.5 1.835 2.5 2.25C2.5 2.665 2.165 3 1.75 3ZM12.25 8.5C11.835 8.5 11.5 8.165 11.5 7.75C11.5 7.335 11.835 7 12.25 7C12.665 7 13 7.335 13 7.75C13 8.165 12.665 8.5 12.25 8.5ZM1.75 8.5C1.335 8.5 1 8.165 1 7.75C1 7.335 1.335 7 1.75 7C2.165 7 2.5 7.335 2.5 7.75C2.5 8.165 2.165 8.5 1.75 8.5Z" fill="#82746D"/>
    </svg>
);

const Lowongan = () => {
    return (
        <div className="w-full min-h-screen bg-[#F3EDE6] flex flex-col font-poppins relative overflow-x-hidden">
            {/* Header Section (Frame 69) */}
            <div className="w-full max-w-[1383px] mx-auto pt-[96px] pb-[80px] px-4 flex flex-col items-center text-center">
                <h1 className="font-poppins font-bold text-[36px] leading-[54px] text-[#4B2E2B] mb-4">
                    Temukan Karir Impian Anda
                </h1>
                <p className="font-poppins font-normal text-[16px] leading-[24px] text-[#4B2E2B] mb-[48px] max-w-[780px]">
                    Jelajahi berbagai lowongan pekerjaan yang tersedia dan temukan yang paling cocok untuk Anda.
                </p>

                {/* Search Bar Container (Frame 80) - Height 110px, Border 3px #4B2E2B */}
                <div className="w-full max-w-[1286px] h-auto lg:h-[110px] bg-transparent border-[3px] border-[#4B2E2B] rounded-[50px] p-[20px] flex flex-col lg:flex-row items-center gap-[20px]">
                    
                    {/* Input Pekerjaan - Height 70px */}
                    <div className="flex-[1.5] w-full bg-[#F3EDE6] border border-[#818080] rounded-[100px] flex items-center px-[20px] h-[70px]">
                        <div className="w-[50px] h-[50px] flex items-center justify-center shrink-0">
                             <img src={iconSearch} alt="Search" className="w-full h-full object-contain" />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Cari Lowongan....." 
                            className="w-full ml-3 outline-none font-poppins font-semibold text-[20px] text-[#C69C6D] placeholder:text-[#C69C6D] bg-transparent"
                        />
                    </div>

                    {/* Input Lokasi - Height 70px */}
                    <div className="flex-1 w-full bg-[#F3EDE6] border border-[#818080] rounded-[100px] flex items-center px-[20px] h-[70px]">
                        <div className="w-[50px] h-[50px] flex items-center justify-center shrink-0">
                            <img src={iconLocation} alt="Location" className="w-full h-full object-contain" />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Lokasi" 
                            className="w-full ml-3 outline-none font-poppins font-semibold text-[24px] text-[#C69C6D] placeholder:text-[#C69C6D] bg-transparent"
                        />
                        <div className="w-[40px] h-[40px] flex items-center justify-center shrink-0">
                            <img src={iconExpand} alt="Expand" className="w-full h-full object-contain cursor-pointer" />
                        </div>
                    </div>

                    {/* Tombol Cari - Height 70px */}
                    <button className="bg-[#4B2E2B] text-[#C69C6D] font-poppins font-bold text-[24px] h-[70px] px-[40px] lg:w-[150px] w-full rounded-[100px] flex items-center justify-center hover:bg-[#3d2523] shrink-0 transition-colors">
                        Cari
                    </button>
                    
                </div>
            </div>

            {/* Explore Section (Frame 82) - Dark Background */}
            <div className="w-full bg-[#4B2E2B] py-[80px] pb-[128px]">
                <div className="max-w-[1232px] mx-auto px-4">
                    
                    <h2 className="font-poppins font-bold text-[36px] leading-[54px] text-[#F3EDE6] mb-[40px] text-left">
                        Eksplorasi Karir
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]">
                        {daftarLowongan.map((lowongan) => (
                            <div 
                                key={lowongan.id}
                                className="bg-[#F3EDE6] rounded-[16px] p-[24px] w-full flex flex-col justify-between shadow-sm transition-transform hover:scale-[1.02] duration-300"
                            >
                                <div className="flex flex-col gap-[20px]">
                                    {/* Logo Placeholder */}
                                    <div className="w-[56px] h-[56px] bg-[#F4ECE9] rounded-[12px] flex items-center justify-center shrink-0 overflow-hidden">
                                        <img src={starbucksLogo} alt="Logo" className="w-[40px] h-[40px] object-contain" />
                                    </div>
    
                                    {/* Titles */}
                                    <div className="flex flex-col gap-1">
                                        <h3 className="font-manrope font-normal text-[20px] leading-[28px] text-[#1E1B19]">
                                            {lowongan.judul}
                                        </h3>
                                        <p className="font-inter font-normal text-[14px] leading-[20px] text-[#50453E]">
                                            {lowongan.perusahaan}
                                        </p>
                                    </div>
    
                                    {/* Metadata Pills */}
                                    <div className="flex flex-wrap gap-[8px] py-[4px] mb-[16px]">
                                        <div className="bg-[#F4ECE9] rounded-[6px] h-[24px] px-[8px] flex items-center gap-[4px]">
                                            <IkonLokasi />
                                            <span className="font-inter font-medium text-[12px] leading-[16px] text-[#82746D]">
                                                {lowongan.lokasi}
                                            </span>
                                        </div>
                                        <div className="bg-[#F4ECE9] rounded-[6px] h-[24px] px-[8px] flex items-center gap-[4px]">
                                            <IkonGaji />
                                            <span className="font-inter font-medium text-[12px] leading-[16px] text-[#82746D]">
                                                {lowongan.gaji}
                                            </span>
                                        </div>
                                    </div>
                                </div>
    
                                {/* Button */}
                                <button className="w-full h-[54px] border-[3px] border-[#C69C6D] rounded-[12px] 
                                               font-inter font-normal text-[16px] leading-[24px] text-[#82746D]
                                               transition-all duration-300 hover:bg-[#C69C6D] hover:text-[#4B2E2B] active:scale-95">
                                    Lihat Detail Lowongan
                                </button>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
            
        </div>
    );
};

export default Lowongan;

