import React from 'react';
import plusIcon from '../../../aset/profil/Plus Math.png';
import backgroundVector from '../../../aset/profil/Vector.png';

const BagianKeahlian = () => {
    const daftarKeahlian = ['Ramah', 'Komunikatif', 'Bahasa Indonesia', 'Cool'];

    return (
        <div className="bagian-keahlian bg-[#C69C6D] rounded-[25px] p-8 md:p-10 relative overflow-hidden shadow-sm w-full min-h-[200px] flex flex-col justify-center">
            {/* Background Vector */}
            <div className="vektor-latar absolute bottom-0 left-0 w-full opacity-30 pointer-events-none z-0">
                <img src={backgroundVector} alt="" className="w-full h-auto object-cover" />
            </div>

            {/* Header Section */}
            <div className="area-header relative z-10 flex justify-between items-center mb-8">
                <h2 className="judul-seksi font-poppins font-semibold text-[28px] md:text-[32px] text-[#4B2E2B]">
                    Skill
                </h2>
                <button className="tombol-tambah flex items-center gap-2 border-[3px] border-[#4B2E2B] rounded-[20px] px-6 py-2 hover:bg-[#4B2E2B]/10 transition-colors">
                    <img src={plusIcon} alt="" className="w-8 h-8" />
                    <span className="font-poppins font-bold text-[20px] md:text-[24px] text-[#4B2E2B]">Tambah</span>
                </button>
            </div>

            {/* Skills Badges */}
            <div className="area-keahlian relative z-10 flex flex-wrap gap-4 md:gap-6">
                {daftarKeahlian.map((skill, index) => (
                    <div 
                        key={index} 
                        className="badge-keahlian bg-[#4B2E2B] px-8 py-3 rounded-[20px] flex items-center justify-center shadow-md hover:scale-105 transition-transform cursor-default"
                    >
                        <span className="font-poppins font-semibold text-[18px] md:text-[20px] text-[#C69C6D]">
                            {skill}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BagianKeahlian;
