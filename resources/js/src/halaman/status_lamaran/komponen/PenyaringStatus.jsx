import React from 'react';

const PenyaringStatus = ({ statusAktif, setStatusAktif, kataKunci, setKataKunci }) => {
    const daftarStatus = ['Semua', 'Diproses', 'Wawancara', 'Diterima', 'Ditolak'];

    return (
        <div className="wadah-penyaring-status-utama mb-10">
            {/* Bar Navigasi Filter Segmented Style */}
            <div className="bar-filter-segment flex flex-wrap lg:flex-nowrap items-center w-full bg-[#F3EDE6] border-2 border-[#4B2E2B] rounded-[20px] overflow-hidden">
                
                {/* Bagian Tombol Status */}
                <div className="grup-tombol-status flex flex-wrap lg:flex-nowrap flex-grow lg:flex-grow-0">
                    {daftarStatus.map((status, index) => (
                        <button
                            key={status}
                            onClick={() => setStatusAktif(status)}
                            className={`
                                elemen-filter-status px-6 py-3 font-poppins font-bold text-[14px] transition-all relative
                                ${statusAktif === status ? 'text-[#4B2E2B] bg-[#4B2E2B]/10' : 'text-[#4B2E2B]/50 hover:text-[#4B2E2B]'}
                                ${index !== daftarStatus.length - 1 ? 'border-r-2 border-[#4B2E2B]' : ''}
                                flex-grow lg:flex-grow-0 text-center
                            `}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                {/* Divider Vertikal */}
                <div className="divider-pencarian hidden lg:block w-[2px] h-8 bg-[#4B2E2B]"></div>

                {/* Bagian Input Pencarian */}
                <div className="area-input-pencarian flex items-center flex-grow px-6 py-2 min-w-[300px]">
                    <div className="ikon-cari-wadah mr-3">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="#4B2E2B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M21 21L16.65 16.65" stroke="#4B2E2B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    <input 
                        type="text" 
                        placeholder="Cari posisi atau perusahaan..."
                        value={kataKunci}
                        onChange={(e) => setKataKunci(e.target.value)}
                        className="input-teks-cari w-full bg-transparent border-none outline-none font-poppins font-bold text-[15px] text-[#4B2E2B] placeholder:text-[#4B2E2B]/30"
                    />
                </div>
            </div>
        </div>
    );
};

export default PenyaringStatus;
