import React, { useState, useEffect } from 'react';
import KartuStatistik from './komponen/KartuStatistik';
import GrafikTrenPelamar from './komponen/GrafikTrenPelamar';
import TabelPelamarTerbaru from './komponen/TabelPelamarTerbaru';
import GrafikStatusLamaran from './komponen/GrafikStatusLamaran';
import { motion } from 'framer-motion';
import { useAdmin } from '../../konteks/AdminContext';
import LoadingKopi from '../../komponen/LoadingKopi';

/**
 * IMPORT ASET DASHBOARD
 */
import groupPersonPng     from '../../aset/dashboard/Group.png';
import schoolBriefcasePng from '../../aset/dashboard/School Briefcase.png';
import warrantyPng        from '../../aset/dashboard/Warranty.png';
import scheduleDashPng    from '../../aset/dashboard/Schedule.png';

const SkeletonCard = () => (
    <div className="bg-[#EAE4DC]/50 animate-pulse rounded-[20px] h-[180px] w-full" />
);

const HalamanDashboardAdmin = () => {
    const { dashboardData, fetchDashboard, loading } = useAdmin();

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    // Tampilkan Loading Kopi tematik saat pertama kali memuat data (data masih kosong)
    if (loading && !dashboardData) {
        return <LoadingKopi />;
    }

    const dataStatistik = [
        { 
            id: 'pelamar',       
            judul: 'Pelamar',              
            nilai: dashboardData?.statistik?.total_pelamar?.toLocaleString() || '0', 
            ikon: groupPersonPng,     
            ikonAlt: 'Ikon Pelamar'       
        },
        { 
            id: 'lowongan',      
            judul: 'Lowongan Aktif',       
            nilai: dashboardData?.statistik?.lowongan_aktif?.toString() || '0',    
            ikon: schoolBriefcasePng, 
            ikonAlt: 'Ikon Lowongan'      
        },
        { 
            id: 'wawancara',     
            judul: 'Wawancara Terjadwal',  
            nilai: dashboardData?.statistik?.wawancara_terjadwal?.toString() || '0',    
            ikon: scheduleDashPng,    
            ikonAlt: 'Ikon Wawancara'     
        },
        { 
            id: 'terverifikasi', 
            judul: 'Lamaran Diterima',     
            nilai: dashboardData?.statistik?.lamaran_diterima?.toString() || '0',    
            ikon: warrantyPng,        
            ikonAlt: 'Ikon Diterima'      
        },
    ];

    const dataStatusLamaran = [
        { label: 'Diproses',  nilai: dashboardData?.distribusi_status?.Diproses || 0,  warna: '#F5B759' },
        { label: 'Wawancara', nilai: dashboardData?.distribusi_status?.Wawancara || 0, warna: '#67D9F0' },
        { label: 'Ditolak',   nilai: dashboardData?.distribusi_status?.Ditolak || 0,   warna: '#F05D5D' },
        { label: 'Diterima',  nilai: dashboardData?.distribusi_status?.Diterima || 0,  warna: '#27AE60' },
    ];

    return (
        <div className="halaman-dashboard-admin w-full min-h-full px-[32px] py-[30px] flex flex-col gap-[24px]">
            <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="judul-halaman font-poppins font-bold text-[32px] text-[#4B2E2B]"
            >
                CAFE Dashboard
            </motion.h1>

            {/* SECTION 1: KARTU STATISTIK */}
            <div className="baris-kartu-statistik grid grid-cols-4 gap-[20px]">
                {loading && !dashboardData ? (
                    <>
                        <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
                    </>
                ) : (
                    dataStatistik.map((kartu) => (
                        <KartuStatistik 
                            key={kartu.id} 
                            judul={kartu.judul} 
                            nilai={kartu.nilai} 
                            ikon={kartu.ikon} 
                            ikonAlt={kartu.ikonAlt} 
                        />
                    ))
                )}
            </div>

            {/* SECTION 2: GRAFIK TREN */}
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="pembungkus-grafik-tren w-full"
            >
                {loading && !dashboardData ? (
                    <div className="bg-[#EAE4DC]/50 animate-pulse rounded-[20px] h-[300px] w-full" />
                ) : (
                    <GrafikTrenPelamar dataTren={dashboardData?.tren_pelamar || []} />
                )}
            </motion.div>

            {/* SECTION 3: TABEL & STATUS */}
            <div className="seksi-bawah-dashboard grid grid-cols-10 gap-[24px] items-stretch">
                <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="kolom-pelamar flex flex-col col-span-7 gap-[12px]"
                >
                    <h2 className="judul-seksi font-poppins font-bold text-[24px] text-[#4B2E2B]">
                        Pelamar Terbaru
                    </h2>
                    <div className="flex-1">
                        {loading && !dashboardData ? (
                            <div className="bg-[#EAE4DC]/50 animate-pulse rounded-[20px] h-[400px] w-full" />
                        ) : (
                            <TabelPelamarTerbaru dataPelamar={dashboardData?.pelamar_terbaru || []} />
                        )}
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="kolom-status flex flex-col col-span-3 gap-[12px]"
                >
                    <h2 className="judul-seksi font-poppins font-bold text-[24px] text-[#4B2E2B]">
                        Status Lamaran
                    </h2>
                    <div className="flex-1">
                        {loading && !dashboardData ? (
                            <div className="bg-[#EAE4DC]/50 animate-pulse rounded-[20px] h-[400px] w-full" />
                        ) : (
                            <GrafikStatusLamaran dataStatus={dataStatusLamaran} />
                        )}
                    </div>
                </motion.div>
            </div>

            <div className="h-[20px]" />
        </div>
    );
};

export default HalamanDashboardAdmin;
