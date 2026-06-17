import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import vektorHero from '../../../aset/beranda/Vector-hero.png';
import gambarHero from '../../../aset/beranda/img-hero.png';

const BagianHero = () => {
  const [charsShown, setCharsShown] = useState(0);
  const titleLine1 = "Temukan Karir ";
  const titleLine2 = "Kopimu di Cofe Job!";
  const totalChars = titleLine1.length + titleLine2.length;

  useEffect(() => {
      const interval = setInterval(() => {
          setCharsShown(prev => {
              if (prev >= totalChars) {
                  clearInterval(interval);
                  return prev;
              }
              return prev + 1;
          });
      }, 50);
      return () => clearInterval(interval);
  }, [totalChars]);

  const getVisibleText = () => {
      if (charsShown <= titleLine1.length) {
          return { l1: titleLine1.slice(0, charsShown), l2: "" };
      }
      return { 
          l1: titleLine1, 
          l2: titleLine2.slice(0, charsShown - titleLine1.length) 
      };
  };

  const visibleText = getVisibleText();

  return (
    <div className="wadah-hero flex w-full justify-center mt-6 md:mt-8 mb-10 px-4">
      <section className="konten-hero relative w-full max-w-6xl bg-[#4b2e2b] rounded-3xl overflow-hidden">
        <div className="flex flex-col lg:flex-row items-stretch min-h-[360px] lg:min-h-[420px]">
          <div className="relative z-20 w-full lg:w-1/2 flex items-center px-6 lg:px-12 py-8 lg:py-0">
            <div className="relative w-full">
              <h1 className="font-poppins font-bold text-3xl md:text-4xl lg:text-5xl leading-tight text-transparent select-none">
                Temukan Karir <br className="hidden md:block" />
                Kopimu di Cofe Job!
              </h1>
              <h1 className="absolute inset-0 font-poppins font-bold text-3xl md:text-4xl lg:text-5xl leading-tight text-[#f3ede6]">
                {visibleText.l1}
                <br className="hidden md:block" />
                {visibleText.l2}
              </h1>
            </div>
          </div>

          <div className="relative w-full lg:w-1/2 h-[250px] lg:h-[420px] overflow-hidden">
            <motion.div
              initial={{ x: 200, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.5 }}
              className="absolute right-[-30px] top-[-40px] w-[440px] lg:w-[500px] h-[500px] lg:h-[580px] opacity-50 md:opacity-100 pointer-events-none z-0"
            >
              <img src={vektorHero} alt="" aria-hidden="true" className="w-full h-full object-contain" />
            </motion.div>
            <motion.div
              initial={{ x: 200, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.7 }}
              className="absolute right-0 bottom-0 w-[340px] lg:w-[420px] h-[260px] lg:h-[320px] z-10"
            >
              <img src={gambarHero} alt="Barista Cofe Job" className="w-full h-full object-contain object-bottom" />
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BagianHero;
