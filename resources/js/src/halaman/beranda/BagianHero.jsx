import React from 'react';
import vektorHero from '../../aset/beranda/Vector-hero.png';
import gambarHero from '../../aset/beranda/img-hero.png';

const BagianHero = () => {
  return (
    <div className="flex w-full justify-center mt-6 md:mt-[40px] mb-10 px-4">
      <section className="relative w-full max-w-[1300px] min-h-[400px] lg:h-[684px] bg-[#4b2e2b] rounded-[40px] md:rounded-[80px] overflow-hidden flex flex-col lg:flex-row items-center px-8 py-10 lg:p-0">

        {/* Teks Utama */}
        <div className="lg:absolute z-20 lg:w-[660px] lg:left-[90px] lg:top-[98px] text-center lg:text-left mt-4 lg:mt-0">
            <h1 className="font-poppins font-[700] text-4xl md:text-[50px] lg:text-[64px] leading-tight md:leading-[1.2] lg:leading-[96px] text-[#f3ede6]">
                Temukan Karir <br className="hidden md:block" />
                Kopimu di Cofe Job!
            </h1>
        </div>

        {/* Vektor Blob Dekoratif */}
        <div className="absolute opacity-50 md:opacity-100 right-[-100px] top-[-50px] lg:left-[567px] lg:top-[-91px] w-[500px] lg:w-[734px] lg:h-[864px] pointer-events-none z-0">
            <img
               src={vektorHero}
               alt=""
               aria-hidden="true"
               className="w-full h-full object-contain"
            />
        </div>

        {/* Gambar Barista */}
        <div className="relative lg:absolute z-10 w-[90%] max-w-[500px] lg:max-w-none lg:w-[856px] h-auto lg:h-[490px] lg:left-[444px] lg:top-[194px] mt-8 lg:mt-0 self-center lg:self-end">
           <img src={gambarHero} alt="Barista Cofe Job" className="w-full h-full object-contain object-bottom" />
        </div>

      </section>
    </div>
  );
};

export default BagianHero;
