import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import JobCard from '../../lowongan/komponen/JobCard';

const BagianLowonganTerbaru = ({ data = [], sedangMemuat = false }) => {
    const navigate = useNavigate();
    const [indexHalaman, setIndexHalaman] = useState(0);
    const [lebarKartu, setLebarKartu] = useState(0);
    const wadahRef = useRef(null);
    
    const lowonganTerbaru = data;
    const totalItem = lowonganTerbaru.length;
    
    // Tentukan berapa banyak kartu yang tampil berdasarkan ukuran layar
    const getItemPerSlide = () => {
        if (window.innerWidth >= 1024) return 3;
        if (window.innerWidth >= 768) return 2;
        return 1;
    };

    const [itemPerSlide, setItemPerSlide] = useState(getItemPerSlide());

    useEffect(() => {
        const tanganiResize = () => {
            const currentItemPerSlide = getItemPerSlide();
            setItemPerSlide(currentItemPerSlide);
            if (wadahRef.current) {
                const gap = 24;
                const totalGap = gap * (currentItemPerSlide - 1);
                const containerWidth = wadahRef.current.offsetWidth;
                const cardWidth = (containerWidth - totalGap) / currentItemPerSlide;
                setLebarKartu(cardWidth + gap);
            }
        };
        
        tanganiResize();
        window.addEventListener('resize', tanganiResize);
        return () => window.removeEventListener('resize', tanganiResize);
    }, []);

    const geserKanan = () => {
        if (indexHalaman < totalItem - itemPerSlide) {
            setIndexHalaman(prev => prev + 1);
        }
    };

    const geserKiri = () => {
        if (indexHalaman > 0) {
            setIndexHalaman(prev => prev - 1);
        }
    };

    return (
        <div className="wadah-lowongan-terbaru flex w-full justify-center px-4 pb-16">
            {/* Wadah Seksi Utama */}
            <motion.section 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="seksi-utama relative w-full max-w-6xl bg-[#C69C6D] rounded-3xl overflow-hidden pt-12 pb-16"
            >
                <div className="konten-utama max-w-5xl mx-auto px-4 md:px-8">
                    {/* Header Tanpa Tombol Navigasi */}
                    <div className="area-header flex flex-col mb-8">
                        <h2 className="judul-seksi font-poppins font-bold text-3xl leading-snug text-[#4B2E2B] mb-4">
                            Lowongan Terbaru
                        </h2>
                        <p className="deskripsi-seksi font-poppins font-normal text-base leading-6 text-[#4B2E2B] max-w-md">
                            Jelajahi berbagai lowongan pekerjaan yang tersedia dan temukan yang paling cocok untuk Anda.
                        </p>
                    </div>
  
                    {/* Area Karosel dengan Tombol di Samping */}
                    <div className="area-karosel-relatif relative">
                        {/* Tombol Kiri (Floating) */}
                        {!sedangMemuat && indexHalaman > 0 && (
                            <button 
                                onClick={geserKiri}
                                className="absolute left-[-16px] md:left-[-32px] top-1/2 translate-y-[-40px] z-10 
                                           p-2 text-[#4B2E2B] hover:scale-125 transition-all duration-300
                                           hidden sm:block"
                            >
                                <ChevronLeft size={24} strokeWidth={1} />
                            </button>
                        )}

                        {/* Viewport Karosel */}
                        <div className="area-viewport-karosel relative overflow-hidden" ref={wadahRef}>
                            <motion.div 
                                className="area-daftar-lowongan flex gap-6"
                                animate={{ x: -(indexHalaman * (lebarKartu)) }}
                                transition={{ type: "spring", stiffness: 200, damping: 25 }}
                            >
                                {sedangMemuat ? (
                                    [1, 2, 3].map((item) => (
                                        <div 
                                            key={item} 
                                            className="bg-[#F3EDE6]/30 animate-pulse rounded-[24px] shrink-0" 
                                            style={{ width: `calc(${100 / itemPerSlide}% - ${(24 * (itemPerSlide - 1)) / itemPerSlide}px)`, height: '300px' }}
                                        />
                                    ))
                                ) : (
                                    lowonganTerbaru.map((lowongan) => (
                                        <div 
                                            key={lowongan.id} 
                                            className="wadah-kartu-lowongan shrink-0"
                                            style={{ width: `calc(${100 / itemPerSlide}% - ${(24 * (itemPerSlide - 1)) / itemPerSlide}px)` }}
                                        >
                                            <JobCard 
                                                lowongan={lowongan} 
                                                onDetail={(job) => {
                                                    navigate(`/lowongan/${job.id}`, { state: { job: job } });
                                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                                }}
                                            />
                                        </div>
                                    ))
                                )}
                            </motion.div>
                        </div>

                        {/* Tombol Kanan (Floating) */}
                        {!sedangMemuat && indexHalaman < totalItem - itemPerSlide && (
                            <button 
                                onClick={geserKanan}
                                className="absolute right-[-16px] md:right-[-32px] top-1/2 translate-y-[-40px] z-10 
                                           p-2 text-[#4B2E2B] hover:scale-125 transition-all duration-300
                                           hidden sm:block"
                            >
                                <ChevronRight size={24} strokeWidth={1} />
                            </button>
                        )}
                    </div>

                    {/* Indikator Halaman Minimalis */}
                    {!sedangMemuat && totalItem > itemPerSlide && (
                        <div className="indikator-halaman flex justify-center mt-10 gap-2">
                            {Array.from({ length: totalItem - itemPerSlide + 1 }).map((_, i) => (
                                <button 
                                    key={i}
                                    onClick={() => setIndexHalaman(i)}
                                    className={`h-1 rounded-full transition-all duration-500 
                                        ${i === indexHalaman ? 'w-8 bg-[#4B2E2B]' : 'w-2 bg-[#4B2E2B]/20'}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </motion.section>
        </div>
    );
};

export default BagianLowonganTerbaru;
