import React from 'react';
import graduationCapIcon from '../../../aset/profil/Graduation Cap.png';
import pencilIcon from '../../../aset/profil/Pencil.png';
import backgroundVector from '../../../aset/profil/Vector.png';

const BagianPendidikan = () => {
    return (
        <div className="bagian-pendidikan bg-[#C69C6D] rounded-[25px] p-8 md:p-10 relative overflow-hidden shadow-sm w-full min-h-[250px] flex flex-col justify-center">
            {/* Background Vector */}
            <div className="vektor-latar absolute bottom-0 left-0 w-full opacity-30 pointer-events-none z-0">
                <img src={backgroundVector} alt="" className="w-full h-auto object-cover" />
            </div>

            {/* Header Section */}
            <div className="area-header relative z-10 flex justify-between items-center mb-6">
                <h2 className="judul-seksi font-poppins font-semibold text-[28px] md:text-[32px] text-[#4B2E2B]">
                    Pendidikan
                </h2>
                <button className="tombol-edit flex items-center gap-2 border-[3px] border-[#4B2E2B] rounded-[20px] px-6 py-2 hover:bg-[#4B2E2B]/10 transition-colors">
                    <img src={pencilIcon} alt="" className="w-8 h-8" />
                    <span className="font-poppins font-bold text-[20px] md:text-[24px] text-[#4B2E2B]">Edit</span>
                </button>
            </div>

            {/* Content Section */}
            <div className="area-konten relative z-10">
                <div className="pendidikan-item flex gap-6 relative">
                    {/* Icon & Timeline Line */}
                    <div className="timeline-pendidikan flex flex-col items-center">
                        <div className="wadah-ikon w-[60px] h-[60px] bg-white border-2 border-[#4B2E2B] rounded-[20px] flex items-center justify-center z-10 shadow-sm">
                            <img src={graduationCapIcon} alt="" className="w-11 h-11" />
                        </div>
                        <div className="garis-timeline w-[2px] h-[40px] bg-[#4B2E2B] opacity-50"></div>
                    </div>

                    {/* Text Info */}
                    <div className="info-pendidikan pt-1 flex flex-col justify-center">
                        <h3 className="nama-institusi font-poppins font-semibold text-[18px] md:text-[22px] text-[#4B2E2B] leading-tight">
                            Politeknik Negeri Indramayu - D4 Rekayasa Perangkat Lunak
                        </h3>
                        <p className="rentang-waktu font-poppins font-medium text-[16px] md:text-[18px] text-[#4B2E2B]/80 mt-1">
                            2024 - Sekarang
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BagianPendidikan;
