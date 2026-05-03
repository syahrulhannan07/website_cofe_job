import React from 'react';

const HalamanLowongan = () => {
    return (
        <div className="flex-1 w-full flex flex-col p-8 lg:p-10 bg-[#F3EDE6] min-h-screen">
            <div className="mb-8">
                <h1 className="font-poppins font-bold text-[32px] text-[#4B2E2B]">Lowongan</h1>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center -mt-20">
                <div className="w-24 h-24 mb-6 opacity-20">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#4B2E2B" strokeWidth="1.5">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 17L12 22L22 17" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 12L12 17L22 12" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
                <h2 className="font-poppins font-bold text-[24px] text-[#4B2E2B]">Tahap Pengembangan</h2>
                <p className="font-poppins text-[16px] text-[#4B2E2B]/60 mt-2 text-center max-w-md">
                    Fitur manajemen lowongan sedang disiapkan untuk memberikan pengalaman rekrutmen yang lebih baik.
                </p>
            </div>
        </div>
    );
};

export default HalamanLowongan;
