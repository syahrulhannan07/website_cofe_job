import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

// Aset SVG
import pencilSquareSvg from '../../../aset/profil-perusahaan/PencilSquare.svg';
import iconVerifSvg    from '../../../aset/profil-perusahaan/Iconverif.svg';

const FotoProfil = ({ variants }) => {
    const fileInputRef = useRef(null);
    const [previewImage, setPreviewImage] = useState(null);

    // Fungsi untuk memicu klik pada input file tersembunyi
    const handlePencilClick = () => {
        fileInputRef.current.click();
    };

    // Fungsi untuk menangani perubahan file (preview)
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="area-kanan-profil flex flex-col gap-[13px] w-[289px]">
            
            {/* INPUT FILE TERSEMBUNYI */}
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/png, image/jpeg"
                onChange={handleFileChange}
            />

            {/* KARTU 1: AVATAR / LOGO CAFE */}
            <motion.div 
                variants={variants}
                className="kartu-avatar w-full h-[322px] bg-[#EAE4DC] border border-[#CCCCCC] rounded-[20px] px-[24px] flex flex-col items-center shadow-sm"
            >
                {/* Judul Seksi (Top: 33px) */}
                <h3 className="mt-[33px] font-poppins font-semibold text-[24px] text-[#4B2E2B] leading-none">
                    Logo Cafe
                </h3>

                {/* Foto Profil (Gap: 13px) */}
                <div className="relative group mt-[13px]">
                    <div className="w-[158px] h-[158px] rounded-full bg-[#D9D9D9] border-2 border-[#CCCCCC] overflow-hidden flex items-center justify-center transition-transform duration-300 group-hover:scale-[1.02]">
                        {previewImage ? (
                            <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            /* Placeholder Icon jika belum ada gambar */
                            <svg className="w-20 h-20 text-[#A9A9A9]" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                            </svg>
                        )}
                    </div>
                    
                    {/* Tombol Edit Foto (Picu Upload) */}
                    <button 
                        onClick={handlePencilClick}
                        className="absolute bottom-[5px] right-[5px] w-[35px] h-[35px] border border-[#CCCCCC] rounded-full flex items-center justify-center shadow-md transition-all duration-300"
                    >
                        <img 
                            src={pencilSquareSvg} 
                            alt="Ubah Foto" 
                            className="w-[20px] h-[20px]"
                        />
                    </button>
                </div>

                {/* Info Format (Gap: 23px) */}
                <p className="mt-[23px] font-poppins font-medium text-[12px] text-[#4B2E2B]/80 text-center">
                    Format: PNG, JPG (Maks. 10MB)
                </p>
            </motion.div>

            {/* KARTU 2: STATUS VERIFIKASI */}
            <motion.div 
                variants={variants}
                className="kartu-verifikasi w-full h-[75px] bg-[#EAE4DC] border border-[#CCCCCC] rounded-[10px] px-[20px] flex items-center gap-[13px] shadow-sm"
            >
                {/* Icon Verif dengan Bulatan Putih & Shadow (Size: 42x42) */}
                <div className="w-[42px] h-[42px] bg-white rounded-full flex items-center justify-center shadow-[0_1px_2px_rgba(0,0,0,0.05)] shrink-0">
                    <img src={iconVerifSvg} alt="Verifikasi" className="w-[20px] h-[20px] object-contain" />
                </div>

                {/* Label & Status Badge (Horizontal Layout) */}
                <div className="flex items-center gap-[10px]">
                    <span className="font-poppins font-semibold text-[14px] text-[#4B2E2B] whitespace-nowrap">
                        Status Verifikasi
                    </span>
                    <div className="flex items-center justify-center w-[72px] h-[18px] bg-[#92E3A9] rounded-[10px] shrink-0">
                        <span className="font-poppins font-medium text-[10px] text-[#3EB661] leading-none">
                            Diterima
                        </span>
                    </div>
                </div>
            </motion.div>

        </div>
    );
};

export default FotoProfil;
