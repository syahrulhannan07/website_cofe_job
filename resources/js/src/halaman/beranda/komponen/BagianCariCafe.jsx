import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import placeholderProfile from '../../../admin-perusahaan/aset/profil-perusahaan/placeholder_profile.png';
import LoadingKopi from '../../../komponen/umum/LoadingKopi';

import Paginasi from '../../../halaman/perusahaan/komponen/Paginasi';

const BagianCariCafe = ({ data = [], sedangMemuat = false, tampilkanPaginasi = false }) => {
  const navigate = useNavigate();
  return (
    <div 
        className="wadah-cari-cafe flex w-full relative justify-center bg-[#F3EDE6] pt-8 pb-12"
    >
        <section 
            className="konten-utama flex flex-col w-full max-w-6xl px-4"
        >
            {/* Kontainer Header */}
            <div className="area-header flex flex-col items-start text-left relative w-full gap-4 mb-8">
                <h2 
                    className="judul-seksi font-poppins font-bold text-3xl text-[#4B2E2B] leading-snug"
                >
                    Temukan Cafe Anda
                </h2>
                
                <p 
                    className="deskripsi-seksi font-lato font-medium text-base md:text-lg text-[#4B2E2B] leading-relaxed max-w-3xl"
                >
                    Jelajahi profil cafe untuk menemukan tempat kerja yang tepat bagi Anda. Pelajari tentang pekerjaan, ulasan, budaya perusahaan, keuntungan, dan tunjangan.
                </p>
            </div>

            {/* Kontainer Kartu */}
            <motion.div 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="daftar-kartu grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full gap-6 lg:gap-[10px]"
            >
                {sedangMemuat ? (
                    <div className="col-span-full w-full">
                        <LoadingKopi fullScreen={false} pesan="Menyeduh daftar cafe..." />
                    </div>
                ) : (
                    data.map((kafe) => (
                        <motion.div 
                            key={kafe.id_perusahaan} 
                            whileHover={{ y: -5, boxShadow: "0px 8px 20px rgba(75, 46, 43, 0.15)" }}
                            className="kartu-kafe-populer flex flex-col items-center relative bg-[#C69C6D] rounded-2xl border-[1px] border-[#4B2E2B] w-full max-w-[280px] h-[280px] mx-auto cursor-pointer group"
                            onClick={() => navigate(`/perusahaan/${kafe.id_perusahaan}`)}
                        >
                            {/* Logo */}
                            <div className="wadah-logo-cafe flex items-center justify-center relative w-[64px] h-[64px] mt-10 bg-[#F3EDE6] rounded-full overflow-hidden border border-[#4B2E2B]/10">
                                <img 
                                    src={kafe.logo_perusahaan || placeholderProfile} 
                                    alt={kafe.nama_perusahaan} 
                                    className="gambar-profil-kafe w-full h-full object-cover" 
                                />
                            </div>
                            
                            {/* Nama Cafe */}
                            <div className="area-nama-cafe flex items-center justify-center relative mt-2">
                                <span className="nama-cafe font-poppins font-semibold text-xl text-[#4B2E2B] leading-snug text-center px-4 line-clamp-1">
                                    {kafe.nama_perusahaan}
                                </span>
                            </div>
                            
                            {/* Tombol / CTA */}
                            <div className="area-tombol flex items-center justify-center relative w-full mt-5">
                                <div 
                                    className="tombol-jumlah-loker flex items-center justify-center relative w-[170px] h-[36px] bg-[#F3EDE6] rounded-[5px] transition-colors duration-300 group-hover:bg-[#4B2E2B] group-hover:text-[#F3EDE6] cursor-pointer"
                                >
                                    <span className="teks-tombol font-poppins font-semibold text-sm text-inherit">
                                        {kafe.jumlah_lowongan} Pekerjaan
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </motion.div>

            {/* Paginasi */}
            {tampilkanPaginasi && (
                <div className="mt-8">
                    <Paginasi />
                </div>
            )}
        </section>
    </div>
  );
};

export default BagianCariCafe;
