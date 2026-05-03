import React from 'react';

const HalamanWawancara = () => (
    <div className="flex-1 w-full flex flex-col p-8 lg:p-10 bg-[#F3EDE6] min-h-screen">
        <div className="mb-8">
            <h1 className="font-poppins font-bold text-[32px] text-[#4B2E2B]">Wawancara</h1>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center -mt-20">
            <div className="w-24 h-24 mb-6 opacity-20">
                <svg viewBox="0 0 24 24" fill="none" stroke="#4B2E2B" strokeWidth="1.5">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
            </div>
            <h2 className="font-poppins font-bold text-[24px] text-[#4B2E2B]">Tahap Pengembangan</h2>
            <p className="font-poppins text-[16px] text-[#4B2E2B]/60 mt-2 text-center max-w-md">
                Fitur manajemen jadwal wawancara sedang disiapkan. Segera hadir untuk memudahkan interaksi Anda dengan pelamar.
            </p>
        </div>
    </div>
);

export default HalamanWawancara;
