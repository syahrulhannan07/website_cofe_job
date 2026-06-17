import React from 'react';
import { useNavigate } from 'react-router-dom';
import placeholderProfile from '../../../aset/profil/placeholder_profil.jpg';
import iconGaji from '../../../aset/lowongan/Icon1.svg';
import iconLokasiMini from '../../../aset/lowongan/Icon2.svg';

const JobCard = ({ lowongan, onDetail }) => {
    const navigate = useNavigate();

    return (
        <div className="bg-[#F3EDE6] rounded-xl p-4 w-full h-full flex flex-col justify-between transition-transform hover:scale-[1.02] duration-300">
            <div className="flex flex-col gap-3">
                <div className="w-12 h-12 bg-[#F4ECE9] rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                    <img src={lowongan.logo_kafe || placeholderProfile} alt={lowongan.nama_kafe} className="w-full h-full object-cover" />
                </div>

                <div className="flex flex-col gap-1">
                    <h3 className="font-manrope font-normal text-base leading-snug text-[#1E1B19]">
                        {lowongan.posisi}
                    </h3>
                    <p className="font-inter font-normal text-xs leading-snug text-[#50453E]">
                        {lowongan.nama_kafe}
                    </p>
                </div>

                <div className="flex flex-wrap gap-2 pt-2 pb-3">
                    <div className="bg-[#F4ECE9] rounded-md h-5 px-2 flex items-center gap-1">
                        <img src={iconLokasiMini} alt="Location Icon" className="w-[9px] h-[11px]" />
                        <span className="font-inter font-medium text-[11px] text-[#82746D]">
                            {lowongan.kecamatan}
                        </span>
                    </div>
                    <div className="bg-[#F4ECE9] rounded-md h-5 px-2 flex items-center gap-1">
                        <img src={iconGaji} alt="Salary Icon" className="w-[12px] h-[9px]" />
                        <span className="font-inter font-medium text-[11px] text-[#82746D]">
                            {lowongan.gaji}
                        </span>
                    </div>
                </div>
            </div>

            <button 
                onClick={() => {
                    if (onDetail) {
                        onDetail(lowongan);
                    } else {
                        navigate(`/lowongan/${lowongan.id || 1}`);
                    }
                }}
                className="w-full h-10 border-2 border-[#C69C6D] rounded-lg font-inter font-normal text-sm text-[#82746D] transition-all duration-300 hover:bg-[#C69C6D] hover:text-[#F3EDE6] active:scale-95"
            >
                Lihat Detail Lowongan
            </button>
        </div>
    );
};

export default JobCard;
