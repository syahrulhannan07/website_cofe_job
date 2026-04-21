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

// Ikon Lokasi
const IkonLokasi = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
    </svg>
);

// Ikon Gaji
const IkonGaji = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"></line>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
    </svg>
);

const Lowongan = () => {
    return (
        <div className="w-full min-h-screen bg-[#F3EDE6] flex flex-col font-poppins relative">
            {/* Header Section (Frame 69) */}
            <div className="w-full max-w-[1383px] mx-auto pt-24 pb-20 px-4 flex flex-col items-center text-center">
                <h1 className="font-poppins font-bold text-[36px] leading-[54px] text-[#4B2E2B] mb-4">
                    Temukan Karir Impian Anda
                </h1>
                <p className="font-poppins font-normal text-[16px] leading-[24px] text-[#4B2E2B] mb-12 max-w-[780px]">
                    Jelajahi berbagai lowongan pekerjaan yang tersedia dan temukan yang paling cocok untuk Anda.
                </p>

                {/* Search Bar Container (Frame 80) - Height 110px, Border 3px #4B2E2B */}
                <div className="w-full max-w-[1286px] h-auto lg:h-[110px] bg-transparent border-[3px] border-[#4B2E2B] rounded-[50px] p-[20px] flex flex-col lg:flex-row items-center gap-[20px]">
                    
                    {/* Input Pekerjaan - Height 70px */}
                    <div className="flex-[1.5] w-full bg-[#F3EDE6] border border-[#818080] rounded-[100px] flex items-center px-[20px] h-[70px]">
                        <div className="w-[50px] h-[50px] flex items-center justify-center shrink-0">
                             <img src={iconSearch} alt="Search" className="w-[50px] h-[50px] object-contain" />
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
                            <img src={iconLocation} alt="Location" className="w-[50px] h-[50px] object-contain" />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Lokasi" 
                            className="w-full ml-3 outline-none font-poppins font-semibold text-[24px] text-[#C69C6D] placeholder:text-[#C69C6D] bg-transparent"
                        />
                        <div className="w-[40px] h-[40px] flex items-center justify-center shrink-0">
                            <img src={iconExpand} alt="Expand" className="w-[40px] h-[40px] object-contain" />
                        </div>
                    </div>

                    {/* Tombol Cari - Height 70px */}
                    <button className="bg-[#4B2E2B] text-[#C69C6D] font-poppins font-bold text-[24px] h-[70px] px-[40px] lg:w-[150px] w-full rounded-[100px] flex items-center justify-center hover:bg-[#341f1d] shrink-0 transition-colors">
                        Cari
                    </button>
                    
                </div>
            </div>

            {/* Explore Section (Frame 81) - Dark Background */}
            <div className="w-full bg-[#4B2E2B] flex-1">
                <div className="max-w-[1232px] mx-auto px-4 py-20 pb-32">
                    
                    <h2 className="font-poppins font-bold text-[36px] leading-[54px] text-[#F3EDE6] mb-10 text-center md:text-left">
                        Eksplorasi Karir
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]">
                        {daftarLowongan.map((lowongan) => (
                            <div 
                                key={lowongan.id}
                                className="bg-[#F3EDE6] rounded-[16px] border border-black p-[24px] w-full max-w-[394.67px] h-[300px] flex flex-col justify-between mx-auto"
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
                                    <div className="flex gap-[8px]">
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
                                               transition-all duration-300 hover:bg-[#C69C6D]/10">
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
