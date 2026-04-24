import React from 'react';
import { motion } from 'framer-motion';
import gambarGabungSekarang from '../../aset/beranda/img-gabung-sekarang.png';
import gambarCariLowongan from '../../aset/beranda/img-cari-lowongan.png';

const BagianAjakan = () => {
    return (
        <div className="flex w-full justify-center pb-12 md:pb-[150px] px-4 overflow-hidden">
            <section className="w-full max-w-[1300px] grid grid-cols-1 lg:grid-cols-2 gap-[30px]">

                {/* Kartu Kiri — Pemasang Lowongan (Node 51:215) */}
                <motion.div 
                    initial={{ x: -100, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative overflow-hidden bg-[#6B8E23] rounded-[80px] cursor-pointer group h-[435px]"
                >
                    {/* Konten Teks — Posisi Deterministik (X: 90px, Y: 70px) */}
                    <div className="absolute left-8 md:left-[90px] top-[70px] z-10 flex flex-col max-w-[500px]">
                        <h2 className="font-poppins font-bold text-[32px] md:text-[32px] leading-[48px] text-white">
                            Ingin Pasang Iklan<br/>
                            Lowongan di Cofe Job?
                        </h2>
                        <div className="mt-[61px]">
                            <button 
                                className="bg-[#F3EDE6] text-[#4B2E2B] font-poppins font-semibold text-[20px] rounded-[20px] transition-all duration-300 hover:shadow-xl hover:scale-105 w-[254px] h-[60px] flex items-center justify-center"
                            >
                                Gabung Sekarang
                            </button>
                        </div>
                    </div>

                    {/* Ilustrasi — Rata Kanan Bawah */}
                    <div className="absolute right-0 bottom-0 h-full w-[45%] flex items-end justify-center pointer-events-none pr-4 md:pr-10 pb-4">
                        <img
                            src={gambarGabungSekarang}
                            alt="Visual Pekerja"
                            className="h-[80%] w-auto object-contain object-bottom"
                        />
                    </div>
                </motion.div>

                {/* Kartu Kanan — Pencari Kerja (Node 51:223) */}
                <motion.div 
                    initial={{ x: 100, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                    className="relative overflow-hidden bg-[#4B3B2B] rounded-[80px] cursor-pointer group h-[435px]"
                >
                    {/* Konten Teks — Posisi Deterministik */}
                    <div className="absolute left-8 md:left-[90px] top-[70px] z-10 flex flex-col max-w-[442px]">
                        <h2 className="font-poppins font-bold text-[32px] md:text-[32px] leading-[48px] text-white">
                            Cari Careermu dan<br/>
                            Lamar!
                        </h2>
                        <div className="mt-[61px]">
                            <button 
                                className="bg-[#F3EDE6] text-[#4B3B2B] font-poppins font-semibold text-[20px] rounded-[20px] transition-all duration-300 hover:shadow-xl hover:scale-105 w-[258px] h-[60px] flex items-center justify-center"
                            >
                                Cari Lowongan
                            </button>
                        </div>
                    </div>

                    {/* Ilustrasi — Rata Kanan Bawah */}
                    <div className="absolute right-0 bottom-0 h-full w-[45%] flex items-end justify-center pointer-events-none pr-4 md:pr-10 pb-4">
                        <img
                            src={gambarCariLowongan}
                            alt="Visual Pencari Kerja"
                            className="h-[80%] w-auto object-contain object-bottom"
                        />
                    </div>
                </motion.div>

            </section>
        </div>
    );
};

export default BagianAjakan;
