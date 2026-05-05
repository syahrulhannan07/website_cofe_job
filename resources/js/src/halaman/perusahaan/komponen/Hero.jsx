import React from 'react';
import { motion } from 'framer-motion';
import vectorDrip from '../../../aset/perusahaan/Vector.png';
import heroImg from '../../../aset/perusahaan/img-1.svg';
import searchIcon from '../../../aset/perusahaan/Search.png';

const Hero = ({ pencarian, setPencarian }) => {
    return (
        <section className="relative w-full min-h-[450px] md:min-h-[600px] bg-[#4B2E2B] rounded-[80px] overflow-hidden px-8 md:px-16 py-28 md:py-48 flex flex-col md:flex-row items-end justify-between gap-12 shadow-2xl">
            {/* Background Drip Vector */}
            <div className="absolute top-0 left-0 w-full h-auto pointer-events-none z-0">
                <img 
                    src={vectorDrip} 
                    alt="Drip Background" 
                    className="w-full h-auto object-cover transform rotate-0"
                />
            </div>

            {/* Left Content */}
            <div className="absolute bottom-24 left-8 md:left-24 z-10 max-w-2xl text-center md:text-left">
                <motion.h1 
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="font-poppins font-bold text-2xl md:text-[48px] text-[#F3EDE6] leading-[1.2] md:leading-[72px] mb-12 max-w-[900px] mx-auto md:mx-0"
                >
                    Temukan Perusahaan<br className="hidden md:block" /> yang tepat untuk Anda!
                </motion.h1>

                {/* Search Bar */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="relative max-w-[747px] mx-auto md:mx-0"
                >
                    <div className="relative group">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center">
                            <img src={searchIcon} alt="Search" className="w-8 h-8 object-contain" />
                        </div>
                        <input
                            type="text"
                            placeholder="Cari Perusahaan....."
                            value={pencarian}
                            onChange={(e) => setPencarian(e.target.value)}
                            className="w-full h-16 md:h-[82px] bg-white border-2 border-[#C69C6D] rounded-[20px] pl-16 pr-8 text-xl font-poppins text-[#4B2E2B] focus:outline-none shadow-xl transition-all placeholder:text-[#C69C6D]/60"
                        />
                    </div>
                </motion.div>
            </div>

            {/* Right Content - Hero Image */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="absolute bottom-24 right-8 md:right-24 z-10"
            >
                <div className="w-[180px] h-[180px] md:w-[255px] md:h-[255px] rounded-full overflow-hidden shadow-2xl border-4 border-white/10">
                    <img 
                        src={heroImg} 
                        alt="Professional" 
                        className="w-full h-full object-cover"
                    />
                </div>
            </motion.div>
        </section>
    );
};

export default Hero;
