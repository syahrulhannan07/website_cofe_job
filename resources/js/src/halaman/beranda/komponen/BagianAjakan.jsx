import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import gambarGabungSekarang from '../../../aset/beranda/img-gabung-sekarang.png';
import gambarCariLowongan from '../../../aset/beranda/img-cari-lowongan.png';

const BagianAjakan = () => {
    const navigate = useNavigate();

  return (
    <div className="wadah-ajakan flex w-full justify-center pb-8 md:pb-16 px-4 overflow-hidden">
        <section className="konten-grid w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Kartu Kiri — Pemasang Lowongan (Node 51:215) */}
            <motion.div 
                initial={{ x: -100, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="kartu-perusahaan relative overflow-hidden bg-[#6B8E23] rounded-3xl cursor-pointer group h-[340px]"
            >
                {/* Konten Teks — Posisi Deterministik (X: 90px, Y: 70px) */}
                <div className="area-teks absolute left-6 md:left-12 top-10 z-10 flex flex-col max-w-sm">
                    <h2 className="judul-kartu font-poppins font-bold text-2xl leading-snug text-white">
                        Ingin Pasang Iklan<br/>
                        Lowongan di Cofe Job?
                    </h2>
                    <div className="wadah-tombol mt-8">
                        <button 
                            onClick={() => {
                                navigate('/daftar', { state: { activeTab: 'Admin_Perusahaan' } });
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="tombol-gabung bg-[#F3EDE6] text-[#4B2E2B] font-poppins font-semibold text-base rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-105 w-[180px] h-[48px] flex items-center justify-center relative z-20"
                        >
                            Gabung Sekarang
                        </button>
                    </div>
                </div>

                {/* Ilustrasi — Rata Kanan Bawah */}
                <div className="area-ilustrasi absolute right-0 bottom-0 h-full w-[45%] flex items-end justify-center pointer-events-none pr-4 md:pr-6 pb-4">
                    <img
                        src={gambarGabungSekarang}
                        alt="Visual Pekerja"
                        className="gambar-ilustrasi h-[80%] w-auto object-contain object-bottom"
                    />
                </div>
            </motion.div>

            {/* Kartu Kanan — Pencari Kerja (Node 51:223) */}
            <motion.div 
                initial={{ x: 100, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="kartu-pelamar relative overflow-hidden bg-[#4B3B2B] rounded-3xl cursor-pointer group h-[340px]"
            >
                {/* Konten Teks — Posisi Deterministik */}
                <div className="area-teks absolute left-6 md:left-12 top-10 z-10 flex flex-col max-w-[380px]">
                    <h2 className="judul-kartu font-poppins font-bold text-2xl leading-snug text-white">
                        Cari Careermu dan<br/>
                        Lamar!
                    </h2>
                    <div className="wadah-tombol mt-8">
                        <button 
                            onClick={() => {
                                navigate('/lowongan');
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="tombol-cari bg-[#F3EDE6] text-[#4B3B2B] font-poppins font-semibold text-base rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-105 w-[180px] h-[48px] flex items-center justify-center relative z-20"
                        >
                            Cari Lowongan
                        </button>
                    </div>
                </div>

                {/* Ilustrasi — Rata Kanan Bawah */}
                <div className="area-ilustrasi absolute right-0 bottom-0 h-full w-[45%] flex items-end justify-center pointer-events-none pr-4 md:pr-6 pb-4">
                    <img
                        src={gambarCariLowongan}
                        alt="Visual Pencari Kerja"
                        className="gambar-ilustrasi h-[80%] w-auto object-contain object-bottom"
                    />
                </div>
            </motion.div>

        </section>
    </div>
  );
};

export default BagianAjakan;
