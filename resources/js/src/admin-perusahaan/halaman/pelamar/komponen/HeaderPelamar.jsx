import React from 'react';

const HeaderPelamar = () => {
    return (
        <div className="flex justify-between items-end mb-6">
            <div>
                <h1 className="font-poppins font-bold text-3xl text-[#4b2e2b] mb-2">Manajemen Data Pelamar</h1>
                <p className="font-poppins text-[#7a6153] text-sm">Kelola data pelamar yang telah mengajukan lamaran pekerjaan.</p>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input 
                        type="text" 
                        placeholder="Cari nama pelamar" 
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c2a38b] focus:border-transparent font-poppins text-sm w-64"
                    />
                </div>
                
                <button className="flex items-center gap-2 bg-[#4b2e2b] hover:bg-[#3a2321] text-white px-4 py-2 rounded-lg font-poppins text-sm transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export data
                </button>
            </div>
        </div>
    );
};

export default HeaderPelamar;
