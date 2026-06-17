import React, { useState, useRef, useEffect } from 'react';

const PenyaringStatus = ({ statusAktif, setStatusAktif, kataKunci, setKataKunci }) => {
    const daftarStatus = ['Semua', 'Diproses', 'Wawancara', 'Diterima', 'Ditolak'];
    const [tampilFilterMobile, setTampilFilterMobile] = useState(false);
    const wadahDropdownRef = useRef(null);

    useEffect(() => {
        const tanganiKlikLuar = (e) => {
            if (wadahDropdownRef.current && !wadahDropdownRef.current.contains(e.target)) {
                setTampilFilterMobile(false);
            }
        };
        document.addEventListener('mousedown', tanganiKlikLuar);
        return () => document.removeEventListener('mousedown', tanganiKlikLuar);
    }, []);

    return (
        <div className="wadah-penyaring-status-utama mb-6">
            {/* Mobile: Search + Hamburger */}
            <div className="lg:hidden flex items-center w-full bg-[#F3EDE6] border-2 border-[#4B2E2B] rounded-xl">
                <div className="flex items-center flex-grow px-4 py-2">
                    <div className="mr-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="#4B2E2B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M21 21L16.65 16.65" stroke="#4B2E2B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Cari posisi atau perusahaan..."
                        value={kataKunci}
                        onChange={(e) => setKataKunci(e.target.value)}
                        className="w-full bg-transparent border-none outline-none font-poppins font-bold text-sm text-[#4B2E2B] placeholder:text-[#4B2E2B]/30"
                    />
                </div>
                <div className="relative" ref={wadahDropdownRef}>
                    <button
                        onClick={() => setTampilFilterMobile((prev) => !prev)}
                        className="w-10 h-10 flex items-center justify-center hover:bg-[#4B2E2B]/10 transition-colors"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 6H21" stroke="#4B2E2B" strokeWidth="2.5" strokeLinecap="round"/>
                            <path d="M6 12H18" stroke="#4B2E2B" strokeWidth="2.5" strokeLinecap="round"/>
                            <path d="M10 18H14" stroke="#4B2E2B" strokeWidth="2.5" strokeLinecap="round"/>
                        </svg>
                    </button>
                    {tampilFilterMobile && (
                        <div className="absolute right-0 top-full mt-2 w-44 bg-[#F3EDE6] border-2 border-[#4B2E2B] rounded-xl overflow-hidden shadow-lg z-50">
                            {daftarStatus.map((status) => (
                                <button
                                    key={status}
                                    onClick={() => {
                                        setStatusAktif(status);
                                        setTampilFilterMobile(false);
                                    }}
                                    className={`w-full text-left px-4 py-2.5 font-poppins font-bold text-sm transition-colors flex items-center justify-between
                                        ${statusAktif === status ? 'text-[#4B2E2B] bg-[#4B2E2B]/10' : 'text-[#4B2E2B]/50 hover:text-[#4B2E2B] hover:bg-[#4B2E2B]/5'}
                                    `}
                                >
                                    {status}
                                    {statusAktif === status && (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M20 6L9 17L4 12" stroke="#4B2E2B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Desktop: Filter Segmented Style */}
            <div className="hidden lg:flex flex-wrap lg:flex-nowrap items-center w-full bg-[#F3EDE6] border-2 border-[#4B2E2B] rounded-xl overflow-hidden">
                <div className="flex flex-wrap lg:flex-nowrap flex-grow lg:flex-grow-0">
                    {daftarStatus.map((status, index) => (
                        <button
                            key={status}
                            onClick={() => setStatusAktif(status)}
                            className={`
                                px-4 py-2 font-poppins font-bold text-xs transition-all relative
                                ${statusAktif === status ? 'text-[#4B2E2B] bg-[#4B2E2B]/10' : 'text-[#4B2E2B]/50 hover:text-[#4B2E2B]'}
                                ${index !== daftarStatus.length - 1 ? 'border-r-2 border-[#4B2E2B]' : ''}
                                flex-grow lg:flex-grow-0 text-center
                            `}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                <div className="hidden lg:block w-[2px] h-8 bg-[#4B2E2B]"></div>

                <div className="flex items-center flex-grow px-4 py-2 min-w-[200px]">
                    <div className="mr-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="#4B2E2B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M21 21L16.65 16.65" stroke="#4B2E2B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Cari posisi atau perusahaan..."
                        value={kataKunci}
                        onChange={(e) => setKataKunci(e.target.value)}
                        className="w-full bg-transparent border-none outline-none font-poppins font-bold text-sm text-[#4B2E2B] placeholder:text-[#4B2E2B]/30"
                    />
                </div>
            </div>
        </div>
    );
};

export default PenyaringStatus;
