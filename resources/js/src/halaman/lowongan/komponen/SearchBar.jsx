import React, { useState } from 'react';
import iconLocation from '../../../aset/lowongan/Location.png';
import iconSearch from '../../../aset/lowongan/Search.png';

const SearchBar = ({ searchQuery, setSearchQuery, locationQuery, setLocationQuery, topLocations, onSearch }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    return (
        <div className="w-full max-w-[1286px] h-auto lg:h-[110px] bg-transparent border-[3px] border-[#4B2E2B] rounded-[50px] px-[30px] py-[20px] flex flex-col lg:flex-row items-center justify-center gap-[20px] lg:gap-0">
            {/* Container equivalent to Group 1 */}
            <div className="w-full max-w-[1226px] flex flex-col lg:flex-row items-center justify-between gap-[20px] lg:gap-0">
                <div className="flex flex-col lg:flex-row items-center gap-[20px] lg:gap-[50px] w-full lg:w-auto relative">
                    {/* Input Pekerjaan */}
                    <div className="w-full lg:w-[444px] bg-[#F3EDE6] border border-[#818080] rounded-[100px] flex items-center px-[20px] h-[70px]">
                        <div className="w-[50px] h-[50px] flex items-center justify-center shrink-0">
                            <img src={iconSearch} alt="Search" className="w-[30px] h-[30px] object-contain" />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Cari Lowongan....." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full ml-3 outline-none font-poppins font-semibold text-[20px] text-[#C69C6D] placeholder:text-[#C69C6D] bg-transparent"
                        />
                    </div>

                    {/* Input Lokasi */}
                    <div className="relative w-full lg:w-[300px]">
                        <div 
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="w-full bg-[#F3EDE6] border border-[#818080] rounded-[100px] flex items-center px-[24px] h-[70px] justify-between cursor-pointer"
                        >
                            <div className="flex items-center gap-[12px] w-full overflow-hidden">
                                <div className="w-[30px] h-[30px] flex items-center justify-center shrink-0">
                                    <img src={iconLocation} alt="Location" className="w-full h-full object-contain" />
                                </div>
                                <span className="w-full outline-none font-poppins font-semibold text-[24px] text-[#C69C6D] truncate text-left select-none">
                                    {locationQuery || "Lokasi"}
                                </span>
                            </div>
                            <div className="w-[30px] h-[30px] flex items-center justify-center shrink-0 ml-[10px]">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`cursor-pointer text-[#4B2E2B] transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}>
                                    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                        </div>

                        {/* Dropdown Menu */}
                        {isDropdownOpen && (
                            <div className="absolute top-[80px] left-0 w-full bg-[#F3EDE6] border border-[#818080] rounded-[24px] overflow-hidden z-50 shadow-lg flex flex-col">
                                <div 
                                    onClick={() => { setLocationQuery(''); setIsDropdownOpen(false); }}
                                    className="px-[24px] py-[15px] font-poppins font-medium text-[18px] text-[#4B2E2B] hover:bg-[#e6dfd6] cursor-pointer text-left"
                                >
                                    Semua Lokasi
                                </div>
                                {topLocations.map(loc => (
                                    <div 
                                        key={loc}
                                        onClick={() => { setLocationQuery(loc); setIsDropdownOpen(false); }}
                                        className="px-[24px] py-[15px] font-poppins font-medium text-[18px] text-[#4B2E2B] hover:bg-[#e6dfd6] cursor-pointer border-t border-[#818080]/20 text-left"
                                    >
                                        {loc}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Tombol Cari */}
                <button 
                    onClick={onSearch}
                    className="bg-[#4B2E2B] text-[#C69C6D] font-poppins font-bold text-[24px] h-[70px] w-full lg:w-[150px] rounded-[100px] flex items-center justify-center hover:bg-[#3d2523] shrink-0 transition-colors"
                >
                    Cari
                </button>
            </div>
        </div>
    );
};

export default SearchBar;
