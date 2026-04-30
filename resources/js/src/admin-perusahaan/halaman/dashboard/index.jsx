import React from 'react';
import KartuStatistik from './komponen/KartuStatistik';
import GrafikStatusLamaran from './komponen/GrafikStatusLamaran';
import { motion } from 'framer-motion';

/**
 * IMPORT ASET DASHBOARD
 */
import groupPersonPng     from '../../aset/dashboard/Group.png';
import schoolBriefcasePng from '../../aset/dashboard/School Briefcase.png';
import warrantyPng        from '../../aset/dashboard/Warranty.png';
import scheduleDashPng    from '../../aset/dashboard/Schedule.png';

const HalamanDashboardAdmin = () => {

    const dataStatistik = [
        { id: 'lowongan',      judul: 'Lowongan Aktif',       nilai: '45',    ikon: schoolBriefcasePng, ikonAlt: 'Ikon Lowongan'      },
        { id: 'wawancara',     judul: 'Wawancara Terjadwal',  nilai: '30',    ikon: scheduleDashPng,    ikonAlt: 'Ikon Wawancara'     },
        { id: 'terverifikasi', judul: 'Lamaran Diterima',     nilai: '12',    ikon: warrantyPng,        ikonAlt: 'Ikon Diterima'      },
    ];

    const dataStatusLamaran = [
        { label: 'Diproses',  nilai: 157, warna: '#F5B759' },
        { label: 'Wawancara', nilai: 38,  warna: '#67D9F0' },
        { label: 'Ditolak',   nilai: 43,  warna: '#F05D5D' },
        { label: 'Diterima',  nilai: 17,  warna: '#27AE60' },
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
            <div className="baris-kartu-statistik grid grid-cols-3 gap-[20px]">
                {dataStatistik.map((kartu) => (
                    <KartuStatistik 
                        key={kartu.id} 
                        judul={kartu.judul} 
                        nilai={kartu.nilai} 
                        ikon={kartu.ikon} 
                        ikonAlt={kartu.ikonAlt} 
                    />
                ))}
            </div>

            {/* SECTION 3: STATUS LAMARAN */}
            <div className="seksi-bawah-dashboard flex flex-col gap-[24px] items-stretch">
                <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="kolom-status w-full gap-[12px]"
                >
                    <h2 className="judul-seksi font-poppins font-bold text-[24px] text-[#4B2E2B]">
                        Status Lamaran
                    </h2>
                    <div className="h-[400px]">
                        <GrafikStatusLamaran dataStatus={dataStatusLamaran} />
                    </div>
                </motion.div>
            </div>

            <div className="h-[20px]" />
        </div>
    );
};

export default HalamanDashboardAdmin;
