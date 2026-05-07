import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import starbucksLogo from '../../aset/beranda/starbucks.png';
import leftArrow from '../../aset/perusahaan/Left Arrow.png';
import JobCard from '../lowongan/komponen/JobCard';

const DetailPerusahaan = () => {
    const navigate = useNavigate();
    // Mock data berdasarkan Figma (Node 53:3308)
    const perusahaan = {
        nama: "Starbucks",
        tagline: "Coffee berkualitas di dunia",
        alamat: "Indramayu, Jl panjaitan nomer 13",
        deskripsi: "Starbucks adalah jaringan kedai kopi global asal Amerika Serikat yang didirikan tahun 1971 di Seattle, terkenal dengan komitmen menggunakan 100% biji kopi Arabika berkualitas tinggi yang diperoleh secara etis. Mereka menawarkan pengalaman \"third place\" (tempat ketiga setelah rumah dan kantor) dengan suasana nyaman, menyajikan berbagai minuman espresso, frappuccino, dan kopi biji utuh."
    };

    const lowonganList = [
        { 
            id: 1, 
            judul: "Senior Barista", 
            perusahaan: "Starbucks", 
            lokasi: "Karangampel", 
            gaji: "Rp 3.500.000 - 4.500.000" 
        },
        { 
            id: 2, 
            judul: "Store Manager", 
            perusahaan: "Starbucks", 
            lokasi: "Indramayu Kota", 
            gaji: "Rp 5.000.000 - 7.000.000" 
        },
        { 
            id: 3, 
            judul: "Shift Supervisor", 
            perusahaan: "Starbucks", 
            lokasi: "Jatibarang", 
            gaji: "Rp 4.000.000 - 5.000.000" 
        },
        { 
            id: 4, 
            judul: "Assistant Store Manager", 
            perusahaan: "Starbucks", 
            lokasi: "Indramayu Kota", 
            gaji: "Rp 4.500.000 - 6.000.000" 
        },
    ];

    return (
        <div className="flex flex-col w-full bg-[#F3EDE6] min-h-screen">
            {/* Header Perusahaan (Node 53:3309) */}
            <section className="w-full bg-[#4B2E2B] py-16 px-8 md:px-24 flex flex-col lg:flex-row items-center justify-between gap-12">
                <div className="flex flex-col md:flex-row items-center gap-12">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-[150px] h-[150px] bg-[#F3EDE6] rounded-full overflow-hidden flex items-center justify-center shrink-0 shadow-xl"
                    >
                        <img src={starbucksLogo} alt={perusahaan.nama} className="w-[110px] h-[110px] object-contain" />
                    </motion.div>
                    
                    <div className="flex flex-col text-center md:text-left">
                        <motion.h1 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="font-poppins font-bold text-[36px] md:text-[54px] text-[#F3EDE6] leading-tight"
                        >
                            {perusahaan.nama}
                        </motion.h1>
                        <motion.p 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="font-poppins font-regular text-[24px] md:text-[36px] text-[#F3EDE6] opacity-90"
                        >
                            {perusahaan.tagline}
                        </motion.p>
                    </div>
                </div>

                {/* Tombol Aksi (Sesuai Gambar) */}
                <div className="flex flex-col gap-5">
                    <motion.button
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="w-[200px] h-[61px] bg-[#C69C6D] rounded-[12px] font-inter font-bold text-[20px] text-[#F3EDE6] 
                                   shadow-[0_4px_4px_rgba(0,0,0,0.25)] hover:bg-[#b0895f] transition-all duration-300"
                    >
                        Tentang
                    </motion.button>
                    
                    <motion.button
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        onClick={() => navigate(-1)}
                        className="w-[200px] h-[61px] border border-[#F3EDE6] rounded-[12px] bg-transparent 
                                   flex items-center justify-center gap-2 shadow-[0_4px_4px_rgba(0,0,0,0.25)]
                                   hover:bg-[#F3EDE6]/10 transition-all duration-300 group"
                    >
                        <img 
                            src={leftArrow} 
                            alt="Back" 
                            className="w-[30px] h-[40px] object-contain group-hover:-translate-x-1 transition-transform" 
                        />
                        <span className="font-inter font-bold text-[24px] text-[#C69C6D]">
                            Kembali...
                        </span>
                    </motion.button>
                </div>
            </section>

            {/* Konten Utama */}
            <section className="max-w-[1300px] mx-auto w-full px-8 py-20 flex flex-col gap-16">
                
                {/* Sekilas Tentang Perusahaan (Node 376:386) */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col gap-10"
                >
                    <h2 className="font-poppins font-semibold text-[32px] text-[#4B2E2B] mb-4">
                        Sekilas tentang perusahaan
                    </h2>
                    
                    <div className="flex flex-col gap-8">
                        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2 md:gap-8 items-start">
                            <span className="font-poppins font-semibold text-[20px] text-[#4B2E2B]">Nama</span>
                            <span className="font-poppins font-regular text-[20px] text-[#4B2E2B]">{perusahaan.nama}</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2 md:gap-8 items-start">
                            <span className="font-poppins font-semibold text-[20px] text-[#4B2E2B]">Alamat</span>
                            <span className="font-poppins font-regular text-[20px] text-[#4B2E2B]">{perusahaan.alamat}</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2 md:gap-8 items-start">
                            <span className="font-poppins font-semibold text-[20px] text-[#4B2E2B]">Deskripsi</span>
                            <p className="font-poppins font-regular text-[20px] text-[#4B2E2B] text-justify leading-relaxed">
                                {perusahaan.deskripsi}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Bagian Lowongan (Node 53:3502) */}
                <div className="bg-[#C69C6D] rounded-[50px] px-[40px] py-[60px] md:px-[80px] md:py-[80px]">
                    <div className="flex flex-col gap-10">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="flex flex-col gap-4"
                        >
                            <h2 className="font-poppins font-bold text-[36px] text-[#4B2E2B]">
                                Lowongan di {perusahaan.nama}
                            </h2>
                            <p className="font-lato font-medium text-[24px] text-[#4B2E2B]">
                                Temukan karir impianmu di {perusahaan.nama}
                            </p>
                        </motion.div>

                        <div 
                            className="flex overflow-x-auto pb-8 gap-6 snap-x snap-mandatory scrollbar-hide"
                            style={{ 
                                scrollbarWidth: 'none', 
                                msOverflowStyle: 'none',
                                WebkitOverflowScrolling: 'touch'
                            }}
                        >
                            <style>
                                {`
                                    .scrollbar-hide::-webkit-scrollbar {
                                        display: none;
                                    }
                                `}
                            </style>
                            {lowonganList.map((lowongan, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex-shrink-0 w-[85%] sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] snap-start flex"
                                >
                                    <JobCard lowongan={lowongan} />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default DetailPerusahaan;
