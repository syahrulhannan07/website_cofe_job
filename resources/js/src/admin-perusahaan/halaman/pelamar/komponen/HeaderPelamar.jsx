import React from 'react';

const HeaderPelamar = () => {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
                <h1 className="font-poppins font-bold text-[28px] text-[#4B2E2B]">Manajemen Pelamar</h1>
                <p className="font-poppins text-[14px] text-[#7A6153]">Kelola dan pantau semua data pelamar yang masuk ke cafe Anda.</p>
            </div>
            <div className="flex items-center gap-3">
                <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A6153]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input 
                        type="text" 
                        placeholder="Cari pelamar..." 
                        className="pl-10 pr-4 py-2 bg-[#EAE4DC] border border-[#4B2E2B]/20 rounded-[8px] font-poppins text-[14px] focus:outline-none focus:border-[#4B2E2B]"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-[#4B2E2B] text-white rounded-[8px] font-poppins text-[14px] hover:bg-[#3d2523] transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    <span>Export Data</span>
                </button>
            </div>
        </div>
    );
};

export default HeaderPelamar;
