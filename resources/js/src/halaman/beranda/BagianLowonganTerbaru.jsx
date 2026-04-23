import React from 'react';

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

const BagianLowonganTerbaru = () => {
    return (
        <div className="flex w-full justify-center px-4 pb-[150px]">
            {/* Wadah Seksi Utama - Radius 50, BG #C69C6D */}
            <section className="relative w-full max-w-[1300px] bg-[#C69C6D] rounded-[50px] overflow-hidden pt-20 pb-32">
                <div className="max-w-[1232px] mx-auto px-4 md:px-8">
                    {/* Header */}
                    <div className="flex flex-col mb-12">
                        <h2 className="font-poppins font-bold text-[36px] leading-[44px] text-[#4B2E2B] mb-4">
                            Lowongan Terbaru
                        </h2>
                        <p className="font-poppins font-normal text-[16px] leading-[24px] text-[#4B2E2B] max-w-[500px]">
                            Jelajahi berbagai lowongan pekerjaan yang tersedia dan temukan yang paling cocok untuk Anda.
                        </p>
                    </div>

                    {/* Grid Lowongan */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]">
                        {daftarLowongan.map((lowongan) => (
                            <div 
                                key={lowongan.id}
                                className="bg-[#F3EDE6] rounded-[16px] border border-black p-[24px] w-full max-w-[394.67px] h-[300px] flex flex-col justify-between mx-auto shadow-sm"
                            >
                                <div className="flex flex-col gap-[20px]">
                                    {/* Logo Placeholder */}
                                    <div className="w-[56px] h-[56px] bg-[#F4ECE9] rounded-[12px] flex items-center justify-center shrink-0">
                                        <span className="font-inter font-bold text-[#82746D] text-lg">
                                            {lowongan.logoText}
                                        </span>
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
            </section>
        </div>
    );
};

export default BagianLowonganTerbaru;
