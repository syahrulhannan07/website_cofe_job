import React from 'react';
import HeaderPelamar from './komponen/HeaderPelamar';
import StatistikPelamar from './komponen/StatistikPelamar';
import TabelPelamar from './komponen/TabelPelamar';

const HalamanPelamar = () => (
    <div className="p-8 bg-[#fcfafa] min-h-screen">
        <HeaderPelamar />
        <StatistikPelamar />
        <TabelPelamar />
    </div>
);

export default HalamanPelamar;
