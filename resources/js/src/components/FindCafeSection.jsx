import React from 'react';
import starbucksLogo from '../assets/beranda/starbucks.png';

const FindCafeSection = () => {
    // Definisi data cafe
    const cafes = [
        { name: 'Starbucks', img: starbucksLogo, leftClass: 'left-0' },
        { name: 'Starbucks', img: starbucksLogo, leftClass: 'left-[339px]' },
        { name: 'Starbucks', img: starbucksLogo, leftClass: 'left-[678px]' },
        { name: 'Starbucks', img: starbucksLogo, leftClass: 'left-[1017px]' },
    ];

    return (
        <div className="flex w-full justify-center pb-[100px]">
            {/* The wrapper that acts as the coordinate system, exactly 1334px width */}
            <section className="relative w-[1334px] h-[501px]">
                
                {/* Title */}
                <h2 className="absolute left-0 top-0 w-[450px] font-poppins font-[700] text-[36px] leading-[54px] text-[#4b2e2b]">
                    Temukan Cafe Anda
                </h2>

                {/* Subtitle */}
                <p className="absolute left-0 top-[90px] w-[1208px] font-['Lato'] font-[500] text-[24px] leading-[28.8px] text-[#4b2e2b]">
                    Jelajahi profil cafe untuk menemukan tempat kerja yang tepat bagi Anda. Pelajari tentang pekerjaan, ulasan, budaya
                    perusahaan, keuntungan, dan tunjangan.
                </p>

                {/* Cards Container */}
                {cafes.map((cafe, index) => (
                    <div 
                        key={index} 
                        className={`absolute ${cafe.leftClass} top-[184px] w-[317px] h-[317px] bg-[#c69c6d] rounded-[50px] border border-[#4b2e2b] 
                                    transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-[0_10px_20px_rgba(75,46,43,0.2)] cursor-pointer`}
                    >
                        {/* Logo - Static now */}
                        <div className="absolute left-[118px] top-[60px] w-[80px] h-[80px]">
                            <img src={cafe.img} alt={cafe.name} className="w-[80px] h-[80px] object-cover" />
                        </div>
                        
                        {/* Judul Teks */}
                        <div className="absolute left-[96px] top-[150px] w-[124px] h-[36px] flex justify-center">
                            <span className="font-poppins font-[600] text-[24px] leading-[36px] text-[#4b2e2b]">
                                {cafe.name}
                            </span>
                        </div>
                        
                        {/* Tombol dengan hover tersendiri */}
                        <button className="absolute left-[59px] top-[216px] w-[198px] h-[42px] bg-[#f3ede6] rounded-[5px] flex items-center justify-center transition-colors duration-200 hover:bg-[#4b2e2b] group/btn">
                            <span className="font-poppins font-[600] text-[16px] leading-[24px] text-[#4b2e2b] transition-colors duration-200 group-hover/btn:text-[#f3ede6]">
                                4 Pekerjaan
                            </span>
                        </button>
                    </div>
                ))}
            </section>
        </div>
    );
};

export default FindCafeSection;
