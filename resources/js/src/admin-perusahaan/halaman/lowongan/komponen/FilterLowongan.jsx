import React, { useState } from 'react';

const FilterLowongan = () => {
    const [activeFilter, setActiveFilter] = useState('All');
    const filters = ['All', 'Active', 'Draft', 'Closed'];

    return (
        <div className="flex flex-col md:flex-row gap-4 items-center mb-8">
            {/* Search Bar */}
            <div className="flex items-center bg-[#EAE4DC] rounded-[50px] px-6 py-3 w-full md:w-[400px]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4B2E2B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input 
                    type="text" 
                    placeholder="Search" 
                    className="bg-transparent border-none outline-none text-[#4B2E2B] ml-3 w-full placeholder:text-[#4B2E2B]/60 font-poppins text-[15px]"
                />
            </div>

            {/* Status Filters */}
            <div className="flex items-center bg-[#EAE4DC] rounded-[50px] p-[6px]">
                {filters.map((filter) => (
                    <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`px-6 py-2 rounded-[50px] font-jakarta font-semibold text-[15px] transition-all ${
                            activeFilter === filter 
                                ? 'bg-[#F7B750] text-[#4B2E2B] shadow-sm' 
                                : 'text-[#4B2E2B] hover:bg-[#4B2E2B]/5'
                        }`}
                    >
                        {filter}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default FilterLowongan;
