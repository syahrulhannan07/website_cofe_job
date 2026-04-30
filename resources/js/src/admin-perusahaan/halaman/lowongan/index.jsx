import React from 'react';
import StatistikLowongan from './komponen/StatistikLowongan';
import FilterLowongan from './komponen/FilterLowongan';
import DaftarLowongan from './komponen/DaftarLowongan';

const HalamanLowongan = () => {
    return (
        <div className="flex-1 w-full flex flex-col p-8 lg:p-10 bg-[#F3EDE6] min-h-screen">
            {/* Header / Title */}
            <div className="mb-8">
                <h1 className="font-poppins font-bold text-[32px] text-[#4B2E2B]">Lowongan</h1>
            </div>

            {/* Top Stats */}
            <StatistikLowongan />

            {/* Filter & Search */}
            <FilterLowongan />

            {/* Job Listings */}
            <DaftarLowongan />
        </div>
    );
};

export default HalamanLowongan;
