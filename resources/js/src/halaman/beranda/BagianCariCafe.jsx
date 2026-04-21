import React from 'react';
import starbucksLogo from '../../aset/beranda/starbucks.png';

const BagianCariCafe = () => {
    return (
        <div 
            className="flex w-full relative justify-center bg-[#F3EDE6] pt-20"
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

                {/* Grid Kontainer Kartu */}
                <div 
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[24px] w-full"
                >
                    {[1, 2, 3, 4].map((item) => (
                        <div 
                            key={item} 
                            className="flex flex-col items-center justify-center relative bg-[#C69C6D] rounded-[50px] border-[1px] border-[#4B2E2B] p-8 w-full h-[317px] max-w-[317px] mx-auto"
                        >
                            {/* Logo */}
                            <div className="flex items-center justify-center relative w-[80px] h-[80px] mb-[10px] bg-[#F3EDE6] rounded-full overflow-hidden border border-[#4B2E2B]/10">
                                <img src={starbucksLogo} alt="Starbucks" className="w-[60px] h-[60px] object-contain" />
                            </div>
                            
                            {/* Nama Cafe */}
                            <div className="flex items-center justify-center relative mb-[30px]">
                                <span className="font-poppins font-semibold text-[24px] text-[#4B2E2B] leading-[36px]">
                                    Starbucks
                                </span>
                            </div>
                            
                            {/* Tombol / CTA */}
                            <div className="flex items-center justify-center relative w-full">
                                <div className="flex items-center justify-center relative w-full max-w-[198px] h-[42px] bg-[#F3EDE6] rounded-[5px]">
                                    <span className="font-poppins font-semibold text-[16px] text-[#4B2E2B]">
                                        4 Pekerjaan
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

            </section>
        </div>
    );
};

export default BagianCariCafe;
