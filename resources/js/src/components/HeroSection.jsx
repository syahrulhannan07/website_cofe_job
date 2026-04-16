import React from 'react';
import vectorHero from '../assets/beranda/Vector-hero.png';
import imgHero from '../assets/beranda/img-hero.png';

// Hero Section Pixel Perfect berdasarkan Node ID 2-413
// Container: W=1300, H=684, bg=#4b2e2b, Radius=80px
// Relative positions calculated from X/Y offsets

const HeroSection = () => {
  return (
    <div className="flex justify-center w-full mt-[40px] mb-[40px]">
      <section className="relative w-[1300px] h-[684px] bg-[#4b2e2b] rounded-[80px] overflow-hidden">
        
        {/* Vector 6: Amoeba Blob */}
        {/* Posisi relative: left=580px, top=-132px, W=734, H=864 */}
        <div className="absolute w-[734px] h-[864px] left-[567px] top-[-91px]">
            <img 
               src={vectorHero} 
               alt="Amoeba Blob" 
               className="w-full h-full object-contain"
            />
        </div>

        {/* Image 2: Barista Girl */}
        {/* Posisi relative: left=444px, top=194px, W=856, H=490 (bottom attached) */}
        <div className="absolute w-[856px] h-[490px] left-[444px] top-[194px]">
           <img src={imgHero} alt="Barista Cofe Job" className="w-full h-full object-contain" />
        </div>

        {/* Text Block: Temukan Karir Kopimu... */}
        {/* Posisi relative: left=90px, top=98px, W=660, H=192 */}
        <h1 className="absolute w-[660px] left-[90px] top-[98px] font-poppins font-[700] text-[64px] leading-[96px] text-[#f3ede6]">
            Temukan Karir <br />
            Kopimu di Cofe Job!
        </h1>

      </section>
    </div>
  );
};

export default HeroSection;
