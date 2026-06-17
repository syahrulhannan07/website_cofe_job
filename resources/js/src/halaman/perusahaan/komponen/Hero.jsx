import React from 'react';
import { motion } from 'framer-motion';
import vectorDrip from '../../../aset/perusahaan/Vector.png';
import heroImg from '../../../aset/perusahaan/img-1.svg';
import searchIcon from '../../../aset/perusahaan/Search.png';

const Hero = ({ pencarian, setPencarian }) => {
    return (
        <div className="wadah-hero-perusahaan flex w-full justify-center mt-6 md:mt-8 mb-10 px-4">
            <section className="konten-hero-perusahaan relative w-full max-w-6xl bg-[#4B2E2B] rounded-3xl overflow-hidden">
                <div 
                    className="absolute top-0 left-0 w-full h-[25%] lg:h-[50%] pointer-events-none z-0"
                    style={{
                        backgroundColor: '#C69C6D',
                        maskImage: `url(${vectorDrip})`,
                        maskSize: '100% 100%',
                        maskPosition: 'top',
                        maskRepeat: 'no-repeat',
                        WebkitMaskImage: `url(${vectorDrip})`,
                        WebkitMaskSize: '100% 100%',
                        WebkitMaskPosition: 'top',
                        WebkitMaskRepeat: 'no-repeat'
                    }}
                />
                <div className="relative z-10 flex flex-col lg:flex-row items-stretch min-h-[340px] lg:min-h-[420px]">
                    <div className="relative z-20 w-full lg:w-1/2 flex flex-col items-start justify-center px-6 lg:px-12 pt-24 lg:pt-40 pb-4 lg:pb-0">
                        <div className="w-full">
                            <motion.h1
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8 }}
                                className="font-poppins font-bold text-xl md:text-3xl lg:text-4xl text-[#F3EDE6] leading-tight mb-4 md:mb-5"
                            >
                                Temukan Perusahaan yang tepat untuk Anda!
                            </motion.h1>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                                className="relative max-w-sm"
                            >
                                <div className="relative group">
                                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
                                        <img src={searchIcon} alt="" className="w-4 h-4 object-contain" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Cari Perusahaan....."
                                        value={pencarian}
                                        onChange={(e) => setPencarian(e.target.value)}
                                        className="w-full h-10 bg-white border border-[#C69C6D] rounded-lg pl-10 pr-3 text-sm font-poppins text-[#4B2E2B] focus:outline-none shadow transition-all placeholder:text-[#C69C6D]/60"
                                    />
                                </div>
                            </motion.div>
                        </div>

                        <motion.div
                            initial={{ x: 200, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 1.2, ease: "easeOut", delay: 0.7 }}
                            className="flex justify-end w-full mt-6 lg:hidden"
                        >
                            <img src={heroImg} alt="Professional" className="w-[120px] h-[95px] object-contain object-center" />
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ x: 200, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 1.2, ease: "easeOut", delay: 0.7 }}
                        className="hidden lg:block absolute right-[20px] top-[70%] -translate-y-1/2 w-[220px] h-[175px] z-10"
                    >
                        <img src={heroImg} alt="Professional" className="w-full h-full object-contain object-center" />
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default Hero;
