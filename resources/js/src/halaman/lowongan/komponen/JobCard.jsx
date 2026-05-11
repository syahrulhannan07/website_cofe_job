import React from 'react';
import { useNavigate } from 'react-router-dom';
import placeholderProfile from '../../../aset/profil/placeholder_profil.jpg';
import iconGaji from '../../../aset/lowongan/Icon1.svg';
import iconLokasiMini from '../../../aset/lowongan/Icon2.svg';

const JobCard = ({ lowongan, onDetail }) => {
    const navigate = useNavigate();

    return (
        <div className="bg-[#F3EDE6] rounded-[16px] p-[24px] w-full h-full flex flex-col justify-between transition-transform hover:scale-[1.02] duration-300">
            <div className="flex flex-col gap-[20px]">
                {/* Logo Perusahaan */}
                <div className="w-[56px] h-[56px] bg-[#F4ECE9] rounded-[12px] flex items-center justify-center shrink-0 overflow-hidden">
                    <img src={lowongan.logo_kafe || placeholderProfile} alt={lowongan.nama_kafe} className="w-full h-full object-cover" />
                </div>

                {/* Judul Posisi & Nama Kafe */}
                <div className="flex flex-col gap-[4px]">
                    <h3 className="teks-posisi-kerja font-manrope font-normal text-[20px] leading-[28px] text-[#1E1B19]">
                        {lowongan.posisi}
                    </h3>
                    <p className="font-inter font-normal text-[14px] leading-[20px] text-[#50453E]">
                        {lowongan.nama_kafe}
                    </p>
                </div>

                {/* Metadata Pills */}
                <div className="flex flex-wrap gap-[8px] pt-[12px] pb-[20px]">
                    <div className="label-lokasi-kecamatan bg-[#F4ECE9] rounded-[6px] h-[24px] px-[8px] flex items-center gap-[4px]">
                        <img src={iconLokasiMini} alt="Location Icon" className="w-[9.33px] h-[11.66px]" />
                        <span className="info-kecamatan-lokasi font-inter font-medium text-[12px] text-[#82746D]">
                            {lowongan.kecamatan}
                        </span>
                    </div>
                    <div className="kontainer-info-gaji bg-[#F4ECE9] rounded-[6px] h-[24px] px-[8px] flex items-center gap-[4px]">
                        <img src={iconGaji} alt="Salary Icon" className="w-[12.83px] h-[9.33px]" />
                        <span className="label-rentang-gaji font-inter font-medium text-[12px] text-[#82746D]">
                            {lowongan.gaji}
                        </span>
                    </div>
                </div>
            </div>

            {/* Button */}
            <button 
                onClick={() => {
                    if (onDetail) {
                        onDetail(lowongan);
                    } else {
                        navigate(`/lowongan/${lowongan.id || 1}`);
                    }
                }}
                className="tombol-navigasi-detail w-full h-[54px] border-[3px] border-[#C69C6D] rounded-[12px] 
                           font-inter font-normal text-[16px] text-[#82746D]
                           transition-all duration-300 hover:bg-[#C69C6D] hover:text-[#F3EDE6] active:scale-95"
            >
                Lihat Detail Lowongan
            </button>
        </div>
    );
};

export default JobCard;
