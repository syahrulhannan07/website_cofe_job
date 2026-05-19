import React, { useEffect, useState } from 'react';
import BagianHero from './komponen/BagianHero';
import BagianCariCafe from './komponen/BagianCariCafe';
import BagianAjakan from './komponen/BagianAjakan';
import BagianLowonganTerbaru from './komponen/BagianLowonganTerbaru';
import api from '../../layanan/api';

const Beranda = () => {
    const [dataBeranda, setDataBeranda] = useState({
        perusahaan_populer: [],
        lowongan_terbaru: []
    });
    const [sedangMemuat, setSedangMemuat] = useState(true);

    useEffect(() => {
        // Mengambil data dinamis untuk halaman beranda (Perusahaan Populer & Lowongan Terbaru)
        const ambilData = async () => {
            try {
                const respons = await api.get('/beranda');
                if (respons.data.status === 'success') {
                    setDataBeranda(respons.data.data);
                }
            } catch (error) {
                console.error('Gagal mengambil data beranda:', error);
            } finally {
                setSedangMemuat(false);
            }
        };

        ambilData();
    }, []);

    return (
        <div className="wadah-halaman-beranda w-full min-h-screen bg-[#F3EDE6]">
            <BagianHero />
            <BagianCariCafe 
                data={dataBeranda.perusahaan_populer} 
                sedangMemuat={sedangMemuat} 
            />
            <BagianAjakan />
            <BagianLowonganTerbaru 
                data={dataBeranda.lowongan_terbaru} 
                sedangMemuat={sedangMemuat} 
            />
        </div>
    );
};

export default Beranda;
