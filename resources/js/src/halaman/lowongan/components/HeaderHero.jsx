import React from 'react';
import SearchBar from './SearchBar';

const HeaderHero = ({ searchQuery, setSearchQuery, locationQuery, setLocationQuery, topLocations, onSearch }) => (
    <div className="w-full max-w-[1383px] mx-auto pt-[15px] pb-[51px] px-4 flex flex-col items-center text-center">
        <h1 className="font-poppins font-bold text-[36px] leading-[54px] text-[#4B2E2B] mb-[10px]">
            Temukan Karir Impian Anda
        </h1>
        <p className="font-poppins font-normal text-[16px] leading-[24px] text-[#4B2E2B] mb-[20px] whitespace-nowrap">
            Jelajahi berbagai lowongan pekerjaan yang tersedia dan temukan yang paling cocok untuk Anda.
        </p>
        <SearchBar 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            locationQuery={locationQuery}
            setLocationQuery={setLocationQuery}
            topLocations={topLocations}
            onSearch={onSearch}
        />
    </div>
);

export default HeaderHero;
