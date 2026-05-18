import React from 'react';
import { motion } from 'framer-motion';

// Import Ikon
import ikonCafe from '../../../aset/dashboard/Icon cafe.svg';
import ikonGrup from '../../../aset/dashboard/Icon grup.svg';
import ikonCentang from '../../../aset/dashboard/Icon centang.svg';

const KartuBento = ({ judul, nilai, ikon, varian = 'standar', labelTambahan = '' }) => {
    if (varian === 'gelap') {
        return (
            <div className="flex flex-col justify-between p-6 bg-[#432C23] rounded-[12px] h-[151px] shadow-sm">
                <div className="flex justify-between items-start">
                    <div className="w-[46px] h-[45px] bg-white/10 rounded-[8px] flex items-center justify-center">
                        <img 
                            src={ikonCentang} 
                            alt="Icon" 
                            className="w-[22px] h-[21px]" 
                        />
                    </div>
                    <div className="bg-[#BA1A1A] px-2 py-0.5 rounded-full">
                        <span className="text-white font-bold text-[10px]">{nilai} {labelTambahan}</span>
                    </div>
                </div>
                <div className="mt-4">
                    <p className="text-[#F3EDE6] font-medium text-[12px] tracking-[0.6px] uppercase">{judul}</p>
                    <h3 className="text-white font-semibold text-[24px] mt-1">{nilai}</h3>
                </div>
            </div>
        );
    }

    if (varian === 'aksen') {
        return (
            <div className="flex flex-col justify-between p-6 bg-white rounded-[12px] h-[151px] shadow-sm border border-[#D3C3BE] border-l-[4px]" style={{ borderLeftColor: '#FEAE2C' }}>
                <div className="flex justify-between items-start">
                    <div className="w-[44px] h-[42px] bg-[#FFE1B4] rounded-[8px] flex items-center justify-center">
                        <img src={ikon} alt="Icon" className="w-[24px] h-[12px] object-contain" />
                    </div>
                </div>
                <div className="mt-4">
                    <p className="text-[#504440] font-medium text-[12px] tracking-[0.6px] uppercase">{judul}</p>
                    <h3 className="text-[#2B1810] font-semibold text-[24px] mt-1">{nilai}</h3>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col justify-between p-6 bg-white rounded-[12px] h-[151px] shadow-sm border border-[#D3C3BE]">
            <div className="flex justify-between items-start">
                <div className={`w-[44px] h-[42px] rounded-[8px] flex items-center justify-center ${judul.includes('KAFE') ? 'bg-[#FFDCC5]' : 'bg-[#FFDBC1]'}`}>
                    <img src={ikon} alt="Icon" className="w-[24px] h-[12px] object-contain" />
                </div>
            </div>
            <div className="mt-4">
                <p className="text-[#504440] font-medium text-[12px] tracking-[0.6px] uppercase">{judul}</p>
                <h3 className="text-[#2B1810] font-semibold text-[24px] mt-1">{nilai}</h3>
            </div>
        </div>
    );
};

const BentoGridMetrik = () => {
    const metrik = [
        {
            judul: 'TOTAL KAFE TERDAFTAR',
            nilai: '1,284',
            ikon: ikonCafe,
            varian: 'standar'
        },
        {
            judul: 'TOTAL PELAMAR TERDAFTAR',
            nilai: '45,920',
            ikon: ikonGrup,
            varian: 'standar'
        },
        {
            judul: 'KAFE AKTIF',
            nilai: '3,412',
            ikon: ikonCafe,
            varian: 'aksen'
        },
        {
            judul: 'VERIFIKASI KAFE',
            nilai: '42',
            labelTambahan: 'PENDING',
            ikon: ikonCentang,
            varian: 'gelap'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            {metrik.map((m, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                    <KartuBento {...m} />
                </motion.div>
            ))}
        </div>
    );
};

export default BentoGridMetrik;
