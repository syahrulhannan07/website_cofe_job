import React from 'react';
import SearchIcon from '../../../aset/pelamar/Search.svg';

const WawancaraToolbar = ({ onAdd, search, setSearch }) => {
    return (
        <div className="flex flex-row justify-between items-center mb-10 gap-4">
            <div className="min-w-0 flex-1">
                <h1 className="font-bold text-[24px] md:text-[28px] leading-tight text-[#4B2E2B] whitespace-nowrap">
                    Manajemen Jadwal Wawancara
                </h1>
                <p className="text-[13px] md:text-[14px] leading-relaxed text-[#4B2E2B]/60 mt-0.5">
                    Kelola jadwal wawancara untuk pelamar yang lolos seleksi.
                </p>
            </div>
            
            <div className="flex flex-row items-center gap-3 md:gap-4 shrink-0">
                <button 
                    onClick={onAdd}
                    className="w-[180px] md:w-[208px] h-[36px] md:h-[40px] flex items-center justify-center gap-2 bg-[#4B2E2B] text-[#EBE4DC] rounded-full hover:bg-[#3D2523] transition-all text-[11px] md:text-[13px] font-medium shrink-0"
                >
                    <span className="text-[16px] md:text-[18px] mb-0.5">+</span>
                    Jadwalkan Wawancara
                </button>

                <div className="relative w-[150px] md:w-[180px]">
                    <input
                        type="text"
                        placeholder="Cari pelamar"
                        className="w-full h-[40px] pl-10 pr-4 rounded-full bg-[#EBE4DC] border border-black/5 focus:outline-none focus:border-[#4B2E2B]/30 text-[13px] text-[#4B2E2B] placeholder:text-[#4B2E2B]/50"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <img src={SearchIcon} alt="search" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-70" />
                </div>
            </div>
        </div>
    );
};

export default WawancaraToolbar;
