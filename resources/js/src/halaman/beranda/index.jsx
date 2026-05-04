import React from 'react';
import BagianHero from './komponen/BagianHero';
import BagianCariCafe from './komponen/BagianCariCafe';
import BagianAjakan from './komponen/BagianAjakan';
import BagianLowonganTerbaru from './komponen/BagianLowonganTerbaru';

const Beranda = () => {
    return (
        <div className="wadah-halaman-beranda w-full min-h-screen bg-[#F3EDE6]">
            <BagianHero />
            <BagianCariCafe />
            <BagianAjakan />
            <BagianLowonganTerbaru />
        </div>
    );
};

export default Beranda;
