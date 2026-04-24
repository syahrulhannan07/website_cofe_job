import React from 'react';
import starbucksLogo from '../../../aset/beranda/starbucks.png';
import iconGaji from '../../../aset/lowongan/Icon1.svg';
import iconLokasiMini from '../../../aset/lowongan/Icon2.svg';

const JobCard = ({ lowongan }) => (
    <div className="bg-[#F3EDE6] border border-[#000000] rounded-[16px] p-[24px] w-full flex flex-col justify-between shadow-sm transition-transform hover:scale-[1.02] duration-300">
        <div className="flex flex-col gap-[20px]">
            {/* Logo Placeholder */}
            <div className="w-[56px] h-[56px] bg-[#F4ECE9] rounded-[12px] flex items-center justify-center shrink-0 overflow-hidden">
                <img src={starbucksLogo} alt="Logo" className="w-[40px] h-[40px] object-contain" />
            </div>

            {/* Titles */}
            <div className="flex flex-col gap-[4px]">
                <h3 className="font-manrope font-normal text-[20px] leading-[28px] text-[#1E1B19]">
                    {lowongan.judul}
                </h3>
                <p className="font-inter font-normal text-[14px] leading-[20px] text-[#50453E]">
                    {lowongan.perusahaan}
                </p>
            </div>

            {/* Metadata Pills */}
            <div className="flex flex-wrap gap-[8px] py-[8px] mb-[16px]">
                <div className="bg-[#F4ECE9] rounded-[6px] h-[24px] px-[8px] flex items-center gap-[4px]">
                    <img src={iconLokasiMini} alt="Location Icon" className="w-[9.33px] h-[11.66px]" />
                    <span className="font-inter font-medium text-[12px] text-[#82746D]">
                        {lowongan.lokasi}
                    </span>
                </div>
                <div className="bg-[#F4ECE9] rounded-[6px] h-[24px] px-[8px] flex items-center gap-[4px]">
                    <img src={iconGaji} alt="Salary Icon" className="w-[12.83px] h-[9.33px]" />
                    <span className="font-inter font-medium text-[12px] text-[#82746D]">
                        {lowongan.gaji}
                    </span>
                </div>
            </div>
        </div>

        {/* Button */}
        <button className="w-full h-[54px] border-[3px] border-[#C69C6D] rounded-[12px] 
                       font-inter font-normal text-[16px] text-[#82746D]
                       transition-all duration-300 hover:bg-[#C69C6D] hover:text-[#4B2E2B] active:scale-95">
            Lihat Detail Lowongan
        </button>
    </div>
);

export default JobCard;
