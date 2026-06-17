import React, { useState, useEffect } from 'react';
import Hero from './komponen/Hero';
import PanduanLamar from './komponen/PanduanLamar';
import CarouselPerusahaan from './komponen/CarouselPerusahaan';
import api from '../../layanan/api';
import { motion } from 'framer-motion';
import HalamanErrorKopi from '../../komponen/umum/HalamanErrorKopi';
import LoadingKopi from '../../komponen/umum/LoadingKopi';

const Perusahaan = () => {
    const [pencarian, setPencarian] = useState('');
    const [daftarPerusahaan, setDaftarPerusahaan] = useState([]);
    const [sedangMemuat, setSedangMemuat] = useState(true);
    const [error, setError] = useState(null);

    // Pengambilan data semua perusahaan terverifikasi dari API
    useEffect(() => {
        const ambilData = async () => {
            try {
                setSedangMemuat(true);
                const respons = await api.get('/perusahaan', { 
                    params: { per_page: 100 },
                    timeout: 15000
                });
                if (respons.data && respons.data.data) {
                    setDaftarPerusahaan(respons.data.data);
                    setError(null);
                }
            } catch (err) {
                console.error('Gagal mengambil data perusahaan:', err);
                if (err.code === 'ECONNABORTED' || !err.response) {
                    setError('timeout');
                } else {
                    setError('error');
                }
            } finally {
                setSedangMemuat(false);
            }
        };

        ambilData();
    }, []);

    // Filter lokal berdasarkan pencarian dari Hero
    const perusahaanTerfilter = daftarPerusahaan.filter(p => 
        p.nama_perusahaan.toLowerCase().includes(pencarian.toLowerCase())
    );

    if (error === 'timeout' || error === 'error') {
        return <HalamanErrorKopi code="500" message="Koneksi Terganggu" subMessage="Gagal memuat daftar kafe. Silakan periksa koneksi internet Anda." />;
    }

    return (
        <motion.main 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="wadah-halaman-perusahaan w-full min-h-screen bg-[#F3EDE6] pb-20"
        >
            {sedangMemuat && daftarPerusahaan.length === 0 ? (
                <LoadingKopi pesan="Menyiapkan Daftar Kafe..." />
            ) : (
                <>
                    <div className="container mx-auto px-4 md:px-8 mb-8">
                        {/* Hero Section */}
                        <Hero pencarian={pencarian} setPencarian={setPencarian} />
                    </div>

                    {/* Carousel Daftar Perusahaan */}
                    <CarouselPerusahaan 
                        data={perusahaanTerfilter} 
                        sedangMemuat={sedangMemuat} 
                    />
                </>
            )}

            <div className="container mx-auto px-4 md:px-8 mt-8">
                {/* Guide Section */}
                <PanduanLamar />
            </div>
        </motion.main>
    );
};

export default Perusahaan;
