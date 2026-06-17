import React from 'react';
import SearchBar from './SearchBar';

const HeaderHero = ({ searchQuery, setSearchQuery, locationQuery, setLocationQuery, topLocations, onSearch }) => (
    <div className="w-full max-w-5xl mx-auto pt-4 pb-6 px-4 flex flex-col items-center text-center">
        <h1 className="font-poppins font-bold text-2xl md:text-3xl leading-snug text-[#4B2E2B] mb-2">
            Temukan Karir Impian Anda
        </h1>
        <p className="font-poppins font-normal text-sm leading-snug text-[#4B2E2B] mb-4">
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
