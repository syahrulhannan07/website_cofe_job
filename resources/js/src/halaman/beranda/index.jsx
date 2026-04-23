import React from 'react';
import BagianHero from './BagianHero';
import BagianCariCafe from './BagianCariCafe';
import BagianAjakan from './BagianAjakan';
import BagianLowonganTerbaru from './BagianLowonganTerbaru';

const Beranda = () => {
    return (
        <div className="w-full min-h-screen bg-[#F3EDE6]">
            <BagianHero />
            <BagianCariCafe />
            <BagianAjakan />
            <BagianLowonganTerbaru />
        </div>
    );
};

export default Beranda;
