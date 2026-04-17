import React from 'react';
import BagianHero from './BagianHero';
import BagianCariCafe from './BagianCariCafe';
import BagianAjakan from './BagianAjakan';
import BagianLowonganTerbaru from './BagianLowonganTerbaru';

const Beranda = () => {
    return (
        <>
            <BagianHero />
            <BagianCariCafe />
            <BagianAjakan />
            <BagianLowonganTerbaru />
        </>
    );
};

export default Beranda;
