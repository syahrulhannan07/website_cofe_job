import React, { useEffect, useState } from 'react';
import KartuPerusahaan from './KartuPerusahaan';
import Paginasi from './Paginasi';
import layananPerusahaan from '../../../layanan/layananPerusahaan';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingKopi from '../../../komponen/umum/LoadingKopi';

const GridPerusahaan = ({ pencarian }) => {
    const [perusahaanList, setPerusahaanList] = useState([]);
    const [halaman, setHalaman] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPerusahaan = async () => {
            setLoading(true);
            try {
                const response = await layananPerusahaan.ambilSemuaPerusahaan({ 
                    search: pencarian,
                    page: halaman,
                    per_page: 20 
                });
                setPerusahaanList(response.data);
            } catch (err) {
                console.error("Gagal mengambil data perusahaan:", err);
                setError("Tidak dapat memuat data perusahaan.");
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchPerusahaan();
        }, 500); // Debounce search

        return () => clearTimeout(timeoutId);
    }, [pencarian, halaman]);

    if (loading && perusahaanList.length === 0) {
        return <LoadingKopi fullScreen={false} pesan="Menyeduh daftar perusahaan..." />;
    }

    if (error) {
        return (
            <div className="text-center py-20 bg-[#F3EDE6] rounded-[40px] my-12">
                <p className="text-[#4B2E2B] font-poppins text-lg">{error}</p>
                <button 
                    onClick={() => window.location.reload()}
                    className="mt-4 px-6 py-2 bg-[#4B2E2B] text-white rounded-full"
                >
                    Coba Lagi
                </button>
            </div>
        );
    }

    return (
        <div className="py-12">
            <div className="flex items-center justify-between mb-12">
                <div>
                    <h2 className="font-poppins font-bold text-3xl text-[#4B2E2B]">
                        Jelajahi Cafe & Coffee Shop
                    </h2>
                    <p className="text-[#4B2E2B] opacity-60 mt-2">
                        Temukan tempat kerja impian Anda dari daftar mitra kami.
                    </p>
                </div>
                <div className="hidden md:block">
                    <span className="text-[#4B2E2B] font-medium bg-[#C69C6D]/20 px-4 py-2 rounded-full">
                        {perusahaanList.length} Perusahaan Ditemukan
                    </span>
                </div>
            </div>

            <AnimatePresence mode="popLayout">
                {perusahaanList.length > 0 ? (
                    <>
                        <motion.div 
                            layout
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-12"
                        >
                            {perusahaanList.map((item) => (
                                <KartuPerusahaan key={item.id_perusahaan} perusahaan={item} />
                            ))}
                        </motion.div>
                        
                        {/* Pagination Section */}
                        <Paginasi 
                            totalHalaman={3} 
                            halamanSaatIni={halaman} 
                            setHalaman={setHalaman} 
                        />
                    </>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-20"
                    >
                        <div className="text-6xl mb-4">🔍</div>
                        <p className="text-[#4B2E2B] font-poppins text-xl">
                            Maaf, tidak ada perusahaan yang sesuai dengan pencarian Anda.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default GridPerusahaan;
