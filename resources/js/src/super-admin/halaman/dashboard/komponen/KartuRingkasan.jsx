import React from 'react';

const KartuRingkasan = ({ judul, nilai, ikon, tren, deskripsiTren }) => {
    return (
        <div className="wadah-kartu-ringkasan bg-white rounded-[20px] p-6 shadow-sm border border-[#EAE4DC] flex flex-col hover:shadow-md transition-shadow duration-300">
            <div className="bagian-atas-kartu flex justify-between items-start mb-4">
                <div className="pembungkus-ikon w-[48px] h-[48px] rounded-full bg-[#F5B759]/20 flex items-center justify-center text-[#4B2E2B]">
                    {ikon}
                </div>
                {tren && (
                    <div className="lencana-tren bg-[#E6F4EA] text-[#1E8E3E] text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                            <polyline points="17 6 23 6 23 12"></polyline>
                        </svg>
                        {tren}
                    </div>
                )}
            </div>
            
            <div className="bagian-tengah-kartu flex flex-col">
                <h3 className="judul-kartu font-poppins font-medium text-[14px] text-[#A08070] uppercase tracking-wide mb-1">
                    {judul}
                </h3>
                <span className="nilai-kartu font-jakarta font-extrabold text-[32px] text-[#4B2E2B]">
                    {nilai}
                </span>
            </div>
            
            {deskripsiTren && (
                <div className="bagian-bawah-kartu mt-3 pt-3 border-t border-[#F4ECE9]">
                    <span className="deskripsi-tren text-[12px] text-[#A08070] font-poppins">
                        {deskripsiTren}
                    </span>
                </div>
            )}
        </div>
    );
};

export default KartuRingkasan;
