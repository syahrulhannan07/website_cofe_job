import React from 'react';

const WawancaraStats = ({ stats }) => {
    return (
        <div className="flex flex-row items-center gap-6 mb-10">
            <div className="w-[246px] h-[83px] bg-[#EBE4DC] border border-black/5 px-6 rounded-[10px] flex flex-col justify-center">
                <span className="text-[15px] font-medium text-[#4B2E2B]">Total Pelamar</span>
                <span className="text-[24px] font-bold text-[#4B2E2B]">{stats.total_pelamar}</span>
            </div>
            <div className="w-[246px] h-[83px] bg-[#DBFFED] border border-[#519565]/30 px-6 rounded-[10px] flex flex-col justify-center">
                <span className="text-[15px] font-medium text-[#519565]">Pelamar Diterima (Lolos)</span>
                <span className="text-[24px] font-bold text-[#519565]">{stats.lamaran_diterima}</span>
            </div>
        </div>
    );
};

export default WawancaraStats;
