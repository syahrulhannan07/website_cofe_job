import React from 'react';
import { motion } from 'framer-motion';
import starbucksLogo from '../../aset/beranda/starbucks.png';

const BagianCariCafe = () => {
    return (
        <div 
            className="flex w-full relative justify-center bg-[#F3EDE6] pt-20 pb-[90px]"
        >
            <section 
                className="flex flex-col w-full max-w-[1300px] px-4"
            >
                {/* Kontainer Header */}
                <div className="flex flex-col relative w-full gap-[36px] mb-12">
                    <h2 
                        className="font-poppins font-bold text-[36px] text-[#4B2E2B] leading-[54px]"
                    >
                        Temukan Cafe Anda
                    </h2>
                    
                    <p 
                        className="font-lato font-medium text-[24px] text-[#4B2E2B] leading-[28.8px] max-w-[1208px]"
                    >
                        Jelajahi profil cafe untuk menemukan tempat kerja yang tepat bagi Anda. Pelajari tentang pekerjaan, ulasan, budaya perusahaan, keuntungan, dan tunjangan.
                    </p>
                </div>

                {/* Kontainer Kartu */}
                <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="flex flex-wrap lg:flex-nowrap justify-between w-full gap-4 lg:gap-[10px]"
                >
                    {[1, 2, 3, 4].map((item, index) => (
                        <motion.div 
                            key={item} 
                            whileHover={{ y: -5, boxShadow: "0px 8px 20px rgba(75, 46, 43, 0.15)" }}
                            className="flex flex-col items-center relative bg-[#C69C6D] rounded-[50px] border-[1px] border-[#4B2E2B] w-full lg:w-[317px] h-[317px] shrink-0 cursor-pointer group"
                        >
                            {/* Logo */}
                            <div className="flex items-center justify-center relative w-[80px] h-[80px] mt-[60px] bg-[#F3EDE6] rounded-full overflow-hidden border border-[#4B2E2B]/10">
                                <img src={starbucksLogo} alt="Starbucks" className="w-[60px] h-[60px] object-contain" />
                            </div>
                            
                            {/* Nama Cafe */}
                            <div className="flex items-center justify-center relative mt-[10px]">
                                <span className="font-poppins font-semibold text-[24px] text-[#4B2E2B] leading-[36px]">
                                    Starbucks
                                </span>
                            </div>
                            
                            {/* Tombol / CTA */}
                            <div className="flex items-center justify-center relative w-full mt-[30px]">
                                <div className="flex items-center justify-center relative w-[198px] h-[42px] bg-[#F3EDE6] rounded-[5px] transition-colors duration-300 group-hover:bg-[#4B2E2B] group-hover:text-[#F3EDE6]">
                                    <span className="font-poppins font-semibold text-[16px] text-inherit">
                                        4 Pekerjaan
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

            </section>
        </div>
    );
};

export default BagianCariCafe;
