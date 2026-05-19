import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import placeholderProfile from '../../../admin-perusahaan/aset/profil-perusahaan/placeholder_profile.png';
import LoadingKopi from '../../../komponen/umum/LoadingKopi';

const CarouselPerusahaan = ({ data = [], sedangMemuat = false }) => {
    const navigate = useNavigate();
    const [halamanAktif, setHalamanAktif] = useState(0);
    const itemPerTampilan = 4;
    
    // Hitung total halaman berdasarkan jumlah data
    const totalHalaman = Math.ceil(data.length / itemPerTampilan);

    // Fungsi untuk navigasi carousel (bergeser per 4 kartu)
    const geserKanan = () => {
        if (halamanAktif < totalHalaman - 1) {
            setHalamanAktif(halamanAktif + 1);
        }
    };

    const geserKiri = () => {
        if (halamanAktif > 0) {
            setHalamanAktif(halamanAktif - 1);
        }
    };

    // Reset ke halaman 0 jika data berubah (pencarian)
    useEffect(() => {
        setHalamanAktif(0);
    }, [data.length]);

    // Ambil subset data untuk tampilan saat ini
    const dataTampilan = data.slice(
        halamanAktif * itemPerTampilan,
        (halamanAktif * itemPerTampilan) + itemPerTampilan
    );

    return (
        <section className="area-daftar-perusahaan-kopi w-full py-16 bg-[#F3EDE6]">
            <div className="container mx-auto px-4 md:px-8 max-w-[1300px]">
                {/* Header Section */}
                <div className="flex flex-col mb-12">
                    <h2 className="font-poppins font-bold text-[36px] text-[#4B2E2B] leading-tight mb-4">
                        Temukan Cafe Anda
                    </h2>
                    <p className="font-lato font-medium text-[20px] md:text-[24px] text-[#4B2E2B] opacity-80 max-w-[1100px]">
                        Jelajahi profil cafe untuk menemukan tempat kerja yang tepat bagi Anda. Pelajari tentang pekerjaan, ulasan, budaya perusahaan, keuntungan, dan tunjangan.
                    </p>
                </div>

                {/* Kontainer Carousel Utama */}
                <div className="kontainer-carousel-utama relative w-full overflow-hidden min-h-[350px]">
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={halamanAktif}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                        >
                            {sedangMemuat ? (
                                <div className="col-span-full">
                                    <LoadingKopi fullScreen={false} pesan="Menyeduh daftar cafe..." />
                                </div>
                            ) : dataTampilan.length > 0 ? (
                                dataTampilan.map((kafe) => (
                                    <motion.div 
                                        key={kafe.id_perusahaan}
                                        whileHover={{ y: -10 }}
                                        onClick={() => navigate(`/perusahaan/${kafe.id_perusahaan}`, { state: { perusahaan: kafe } })}
                                        className="kartu-kafe flex flex-col items-center bg-[#C69C6D] rounded-[50px] border border-[#4B2E2B] h-[317px] p-6 cursor-pointer group shadow-sm hover:shadow-xl transition-all duration-300"
                                    >
                                        {/* Foto Sampul/Logo Kafe */}
                                        <div className="wadah-logo flex items-center justify-center w-[100px] h-[100px] mt-8 bg-[#F3EDE6] rounded-full overflow-hidden border-2 border-[#4B2E2B]/10">
                                            <img 
                                                src={kafe.logo_perusahaan || placeholderProfile} 
                                                alt={kafe.nama_perusahaan} 
                                                className="foto-sampul-kafe w-full h-full object-cover"
                                            />
                                        </div>

                                        {/* Nama Kafe */}
                                        <h3 className="teks-nama-kafe mt-4 font-poppins font-semibold text-[24px] text-[#4B2E2B] text-center line-clamp-1">
                                            {kafe.nama_perusahaan}
                                        </h3>

                                        {/* Informasi Lowongan */}
                                        <div className="mt-auto mb-4 w-[200px] h-[45px] bg-[#F3EDE6] rounded-[10px] flex items-center justify-center group-hover:bg-[#4B2E2B] transition-colors duration-300">
                                            <span className="font-poppins font-bold text-[#4B2E2B] group-hover:text-[#F3EDE6]">
                                                {kafe.jumlah_lowongan} Pekerjaan
                                            </span>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="col-span-full py-20 text-center text-[#4B2E2B]/50 font-poppins">
                                    Tidak ada perusahaan yang ditemukan.
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Kontrol Navigasi (Dark Pill Style - Gambar 2) */}
                {totalHalaman > 1 && (
                    <div className="flex justify-center mt-12">
                        <div className="flex items-center bg-[#4B2E2B] rounded-full p-2 px-4 gap-4 shadow-lg scale-110 md:scale-125">
                            {/* Tombol Navigasi Kiri */}
                            <button 
                                onClick={geserKiri}
                                disabled={halamanAktif === 0}
                                className="tombol-navigasi-kiri w-10 h-10 flex items-center justify-center bg-[#F3EDE6] rounded-full disabled:opacity-30 hover:bg-[#C69C6D] transition-colors"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M15 18l-6-6 6-6"/>
                                </svg>
                            </button>

                            {/* Indikator Halaman (Maksimal 3 Angka) */}
                            <div className="flex items-center gap-2">
                                {(() => {
                                    // Logika untuk hanya menampilkan 3 angka saja
                                    let start = Math.max(0, halamanAktif - 1);
                                    let end = Math.min(totalHalaman, start + 3);
                                    
                                    // Geser start jika end mencapai batas akhir
                                    if (end - start < 3 && totalHalaman > 3) {
                                        start = Math.max(0, end - 3);
                                    }

                                    return [...Array(totalHalaman)].slice(start, end).map((_, i) => {
                                        const indexHalaman = start + i;
                                        return (
                                            <button
                                                key={indexHalaman}
                                                onClick={() => setHalamanAktif(indexHalaman)}
                                                className={`w-10 h-10 flex items-center justify-center rounded-full font-poppins font-bold text-[16px] transition-all
                                                    ${halamanAktif === indexHalaman 
                                                        ? 'bg-[#C69C6D] text-[#4B2E2B] scale-110 shadow-md' 
                                                        : 'bg-[#F3EDE6] text-[#4B2E2B] opacity-60 hover:opacity-100 hover:bg-[#C69C6D]/30'
                                                    }`}
                                            >
                                                {indexHalaman + 1}
                                            </button>
                                        );
                                    });
                                })()}
                            </div>

                            {/* Tombol Navigasi Kanan */}
                            <button 
                                onClick={geserKanan}
                                disabled={halamanAktif === totalHalaman - 1}
                                className="tombol-navigasi-kanan w-10 h-10 flex items-center justify-center bg-[#F3EDE6] rounded-full disabled:opacity-30 hover:bg-[#C69C6D] transition-colors"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 18l6-6-6-6"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default CarouselPerusahaan;
