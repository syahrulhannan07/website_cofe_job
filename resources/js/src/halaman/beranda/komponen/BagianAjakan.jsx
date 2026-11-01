import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import gambarGabungSekarang from '../../../aset/beranda/img-gabung-sekarang.png';
import gambarCariLowongan from '../../../aset/beranda/img-cari-lowongan.png';
import ilustrasiProfilPelamar from '../../../aset/beranda/ilustrasi-profil-pelamar.svg';

const BagianAjakan = () => {
    const navigate = useNavigate();
    const isPelamar = Boolean(localStorage.getItem('token')) && localStorage.getItem('peran') === 'Pelamar';

  return (
    <div className="wadah-ajakan flex w-full justify-center pb-8 md:pb-16 px-4 overflow-hidden">
        <section className="konten-grid w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Kartu Kiri — Ajakan sesuai peran pengguna */}
            <motion.div
                initial={{ x: -100, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`kartu-perusahaan relative overflow-hidden bg-[#6B8E23] rounded-3xl group ${isPelamar ? 'h-[400px] sm:h-[340px]' : 'h-[340px]'}`}
            >
                {/* Konten Teks */}
                <div className="area-teks absolute left-6 md:left-12 top-10 z-10 flex flex-col max-w-sm">
                    <h2 className="judul-kartu font-poppins font-bold text-2xl leading-snug text-white">
                        {isPelamar ? (
                            <>Siap Memulai Karier<br/>di Kafe Impian?</>
                        ) : (
                            <>Ingin Pasang Iklan<br/>Lowongan di Cofe Job?</>
                        )}
                    </h2>
                    <div className={`wadah-tombol ${isPelamar ? 'mt-6' : 'mt-8'}`}>
                        <button
                            type="button"
                            onClick={() => {
                                if (isPelamar) {
                                    navigate('/profil');
                                } else {
                                    navigate('/daftar', { state: { activeTab: 'Admin_Perusahaan' } });
                                }
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="tombol-gabung bg-[#F3EDE6] text-[#4B2E2B] font-poppins font-semibold text-base rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-105 w-[180px] h-[48px] flex items-center justify-center relative z-20"
                        >
                            {isPelamar ? 'Lengkapi Profil' : 'Gabung Sekarang'}
                        </button>
                    </div>
                </div>

                {/* Ilustrasi — Rata Kanan Bawah */}
                <div className="area-ilustrasi absolute right-0 bottom-0 h-full w-[45%] flex items-end justify-center pointer-events-none pr-4 md:pr-6 pb-4">
                    <img
                        src={isPelamar ? ilustrasiProfilPelamar : gambarGabungSekarang}
                        alt={isPelamar ? 'Ilustrasi profil dan CV pelamar' : 'Visual Pekerja'}
                        className={`gambar-ilustrasi w-auto object-contain object-bottom ${isPelamar ? 'h-[42%] sm:h-[50%]' : 'h-[80%]'}`}
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
