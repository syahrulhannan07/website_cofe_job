import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import layananSuperAdmin from '../../../layanan/layananSuperAdmin';
import BentoGridMetrik from './komponen/BentoGridMetrik';
import GrafikAnalitik from './komponen/GrafikAnalitik';
import TabelPendaftarTerbaru from './komponen/TabelPendaftarTerbaru';
import AntrianVerifikasi from './komponen/AntrianVerifikasi';

const DashboardSuperAdmin = () => {
    const [dataDashboard, setDataDashboard] = useState(null);
    const [sedangMemuat, setSedangMemuat] = useState(true);

    // Fetch seluruh data dashboard dari endpoint /superadmin/dashboard
    useEffect(() => {
        const ambilData = async () => {
            setSedangMemuat(true);
            try {
                const respons = await layananSuperAdmin.ambilDashboard();
                if (respons?.data) {
                    setDataDashboard(respons.data);
                }
            } catch (err) {
                console.error('Gagal memuat data dashboard:', err);
            } finally {
                setSedangMemuat(false);
            }
        };
        ambilData();
    }, []);

    return (
        <div className="wadah-halaman-dashboard flex-1 w-full flex flex-col p-5 md:p-8 lg:p-10 bg-[#F4ECE9] min-h-screen overflow-x-hidden">
            {/* Header Dashboard */}
            <div className="area-header-dashboard mb-8">
                <h1 className="judul-halaman font-poppins font-bold text-[32px] text-[#4B2E2B] tracking-tight">
                    CAFE Dashboard
                </h1>
                <div className="garis-aksen w-[60px] h-[4px] bg-[#C69C6D] mt-1 rounded-full" />
            </div>

            {/* Bento Grid Metrics */}
            <div className="wadah-metrik-bento mb-8">
                <BentoGridMetrik
                    statistik={dataDashboard?.statistik}
                    sedangMemuat={sedangMemuat}
                />
            </div>

            {/* Area Grafik Utama */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.5, delay: 0.4 }}
                className="area-visualisasi-data w-full"
            >
                <GrafikAnalitik
                    dataTren={dataDashboard?.tren_pertumbuhan}
                    sedangMemuat={sedangMemuat}
                />
            </motion.div>
            
            {/* Aktivitas & Antrian Section */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.5, delay: 0.5 }}
                className="mt-8 w-full"
            >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-end mb-4">
                    <h2 className="lg:col-span-2 font-poppins font-bold text-[20px] text-[#4B2E2B]">
                        Pendaftar Terbaru
                    </h2>
                    <h2 className="lg:col-span-1 font-poppins font-bold text-[20px] text-[#4B2E2B]">
                        Antrian Verifikasi
                    </h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch w-full">
                    <div className="lg:col-span-2 flex">
                        <TabelPendaftarTerbaru
                            dataPendaftar={dataDashboard?.pendaftar_terbaru}
                            sedangMemuat={sedangMemuat}
                        />
                    </div>
                    <div className="lg:col-span-1 flex">
                        <AntrianVerifikasi
                            dataAntrian={dataDashboard?.antrian_verifikasi}
                            sedangMemuat={sedangMemuat}
                        />
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default DashboardSuperAdmin;
