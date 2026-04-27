import React, { useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

const KartuStatistik = ({ judul, nilai, ikon, ikonAlt = '' }) => {
    // Menghapus koma atau karakter non-numerik untuk animasi
    const targetNilai = parseInt(nilai.toString().replace(/[^0-9]/g, '')) || 0;
    const count = useMotionValue(0);
    const rounded = useTransform(count, (latest) => {
        // Format kembali dengan ribuan jika nilai aslinya punya koma
        const formatted = Math.round(latest);
        if (nilai.toString().includes(',')) {
            return formatted.toLocaleString('en-US');
        }
        return formatted;
    });

    useEffect(() => {
        const controls = animate(count, targetNilai, { duration: 2, ease: "easeOut" });
        return controls.stop;
    }, [targetNilai]);

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="kartu-statistik relative w-full h-[144px] bg-[#C69C6D] border border-[#4B2E2B] rounded-[10px] flex flex-col items-center justify-center shadow-sm overflow-hidden"
        >
            <span className="judul-kartu absolute top-[12px] left-[12px] font-poppins font-medium text-[16px] text-[#4B2E2B]">
                {judul}
            </span>
            <motion.span className="nilai-kartu font-poppins font-bold text-[48px] text-[#4B2E2B]">
                {rounded}
            </motion.span>
            <div className="pembungkus-ikon-kartu absolute bottom-[10px] right-[10px] w-[50px] h-[50px]">
                <img 
                    src={ikon} 
                    alt={ikonAlt || judul} 
                    className="ikon-kartu w-full h-full object-contain opacity-70" 
                />
            </div>
        </motion.div>
    );
};

export default KartuStatistik;
