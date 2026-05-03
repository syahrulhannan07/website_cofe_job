import React from 'react';
import BriefcaseIcon from '../../../aset/pelamar/School Briefcase.png';
import GroupIcon from '../../../aset/pelamar/Group.png';
import SearchIcon from '../../../aset/pelamar/Search.svg';

const HeaderPelamar = ({ stats, activeFilter, setActiveFilter }) => {
    const filters = ['All', 'Active', 'Draft', 'Closed'];

    return (
        <div className="flex flex-wrap items-center gap-[19px] mb-[30px] w-full max-w-[1055px]">
            {/* Card Lowongan */}
            <div className="flex-1 min-w-[200px] lg:max-w-[256px] h-[54px] bg-[#EAE4DC] border border-[#CCCCCC]/80 rounded-[10px] px-4 flex items-center shrink-0">
                <img src={BriefcaseIcon} alt="Lowongan" className="w-[30px] h-[30px] object-contain mr-3" />
                <span className="font-poppins text-[15px] text-[#4B2E2B] mr-auto">Lowongan</span>
                <span className="font-poppins font-semibold text-[24px] text-[#4B2E2B] leading-none">{stats.totalLowongan}</span>
            </div>

            {/* Card Total Pelamar */}
            <div className="flex-1 min-w-[200px] lg:max-w-[256px] h-[54px] bg-[#EAE4DC] border border-[#CCCCCC]/80 rounded-[10px] px-4 flex items-center shrink-0">
                <img src={GroupIcon} alt="Total Pelamar" className="w-[30px] h-[30px] object-contain mr-3" />
                <span className="font-poppins text-[15px] text-[#4B2E2B] mr-auto whitespace-nowrap">Total Pelamar</span>
                <span className="font-poppins font-semibold text-[24px] text-[#4B2E2B] leading-none">{stats.totalPelamar}</span>
            </div>

            {/* Search Bar */}
            <div className="flex-1 min-w-[166px] lg:max-w-[166px] h-[54px] bg-[#EAE4DC] border border-[#CCCCCC]/80 rounded-full px-5 flex items-center gap-2 shrink-0">
                <img src={SearchIcon} alt="Search" className="w-[20px] h-[20px] object-contain" />
                <input 
                    type="text" 
                    placeholder="Search" 
                    className="bg-transparent border-none outline-none font-poppins text-[15px] text-[#4B2E2B] placeholder-[#4B2E2B] w-full"
                />
            </div>

            {/* Filter Tabs */}
            <div className="flex-[2] min-w-[300px] lg:max-w-[320px] h-[54px] bg-[#EAE4DC] border border-[#CCCCCC]/80 rounded-[10px] p-[5px] flex items-center shrink-0">
                {filters.map((filter) => (
                    <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`flex-1 h-full rounded-[5px] font-poppins font-semibold text-[15px] transition-all duration-200 ${
                            activeFilter === filter 
                                ? 'bg-[#F7B750] text-[#4B2E2B]' 
                                : 'text-[#4B2E2B] hover:bg-[#F7B750]/20'
                        }`}
                    >
                        {filter}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default HeaderPelamar;
