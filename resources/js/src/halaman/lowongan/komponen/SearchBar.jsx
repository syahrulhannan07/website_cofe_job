import React, { useState } from 'react';
import iconLocation from '../../../aset/lowongan/Location.png';
import iconSearch from '../../../aset/lowongan/Search.png';

const SearchBar = ({ searchQuery, setSearchQuery, locationQuery, setLocationQuery, topLocations, onSearch }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    return (
        <div className="w-full max-w-3xl h-auto lg:h-14 bg-transparent border-2 border-[#4B2E2B] rounded-2xl px-4 py-3 flex flex-col lg:flex-row items-center justify-center gap-3 lg:gap-0">
            <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-3 lg:gap-0">
                <div className="flex flex-col lg:flex-row items-center gap-3 lg:gap-3 w-full lg:w-auto relative">
                    <div className="w-full lg:w-[260px] bg-[#F3EDE6] border border-[#818080] rounded-full flex items-center px-4 h-10">
                        <div className="w-8 h-8 flex items-center justify-center shrink-0">
                            <img src={iconSearch} alt="Search" className="w-4 h-4 object-contain" />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Cari Lowongan....." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full ml-2 outline-none font-poppins font-semibold text-sm text-[#C69C6D] placeholder:text-[#C69C6D] bg-transparent"
                        />
                    </div>

                    <div className="relative w-full lg:w-[200px]">
                        <div 
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="w-full bg-[#F3EDE6] border border-[#818080] rounded-full flex items-center px-4 h-10 justify-between cursor-pointer"
                        >
                            <div className="flex items-center gap-2 w-full overflow-hidden">
                                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                                    <img src={iconLocation} alt="Location" className="w-full h-full object-contain" />
                                </div>
                                <span className="w-full outline-none font-poppins font-semibold text-sm text-[#C69C6D] truncate text-left select-none">
                                    {locationQuery || "Lokasi"}
                                </span>
                            </div>
                            <div className="w-5 h-5 flex items-center justify-center shrink-0 ml-1">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`cursor-pointer text-[#4B2E2B] transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}>
                                    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                        </div>

                        {isDropdownOpen && (
                            <div className="absolute top-10 left-0 w-full bg-[#F3EDE6] border border-[#818080] rounded-xl overflow-hidden z-50 shadow-lg flex flex-col">
                                <div 
                                    onClick={() => { setLocationQuery(''); setIsDropdownOpen(false); }}
                                    className="px-4 py-2.5 font-poppins font-medium text-sm text-[#4B2E2B] hover:bg-[#e6dfd6] cursor-pointer text-left"
                                >
                                    Semua Lokasi
                                </div>
                                {topLocations.map(loc => (
                                    <div 
                                        key={loc}
                                        onClick={() => { setLocationQuery(loc); setIsDropdownOpen(false); }}
                                        className="px-4 py-2.5 font-poppins font-medium text-sm text-[#4B2E2B] hover:bg-[#e6dfd6] cursor-pointer border-t border-[#818080]/20 text-left"
                                    >
                                        {loc}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <button 
                    onClick={onSearch}
                    className="bg-[#4B2E2B] text-[#C69C6D] font-poppins font-bold text-sm h-10 w-full lg:w-[100px] rounded-full flex items-center justify-center hover:bg-[#3d2523] shrink-0 transition-colors"
                >
                    Cari
                </button>
            </div>
        </div>
    );
};

export default SearchBar;
