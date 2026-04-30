import React from 'react';
import KartuStatistik from './komponen/KartuStatistik';
import GrafikTrenPelamar from './komponen/GrafikTrenPelamar';
import TabelPelamarTerbaru from './komponen/TabelPelamarTerbaru';
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
        { id: 'pelamar',       judul: 'Pelamar',              nilai: '1,245', ikon: groupPersonPng,     ikonAlt: 'Ikon Pelamar'       },
        { id: 'lowongan',      judul: 'Lowongan Aktif',       nilai: '45',    ikon: schoolBriefcasePng, ikonAlt: 'Ikon Lowongan'      },
        { id: 'wawancara',     judul: 'Wawancara Terjadwal',  nilai: '30',    ikon: scheduleDashPng,    ikonAlt: 'Ikon Wawancara'     },
        { id: 'terverifikasi', judul: 'Lamaran Diterima',     nilai: '12',    ikon: warrantyPng,        ikonAlt: 'Ikon Diterima'      },
    ];

    const dataPelamarTerbaru = [
        { id: 1,  nama: 'Syahrul',  posisi: 'Marketing',       tanggal: '30 April 2026', status: 'Pending'   },
        { id: 2,  nama: 'Ramadhan', posisi: 'Kasir',           tanggal: '12 April 2026', status: 'Pending'   },
        { id: 3,  nama: 'Juwaidi',  posisi: 'Waitress',        tanggal: '08 April 2026', status: 'Pending'   },
        { id: 4,  nama: 'Syjura',   posisi: 'Barista',         tanggal: '21 April 2026', status: 'Pending'   },
        { id: 5,  nama: 'Syjura',   posisi: 'Cleaning Service', tanggal: '21 April 2026', status: 'Pending'  },
        { id: 6,  nama: 'Ahmad',    posisi: 'Chef',            tanggal: '22 April 2026', status: 'Review'    },
        { id: 7,  nama: 'Budi',     posisi: 'Driver',          tanggal: '23 April 2026', status: 'Wawancara' },
        { id: 8,  nama: 'Citra',    posisi: 'Accounting',      tanggal: '24 April 2026', status: 'Pending'   },
        { id: 9,  nama: 'Dedi',     posisi: 'IT Support',      tanggal: '25 April 2026', status: 'Ditolak'   },
        { id: 10, nama: 'Eka',      posisi: 'Receptionist',    tanggal: '26 April 2026', status: 'Diterima'  },
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
            <div className="baris-kartu-statistik grid grid-cols-4 gap-[20px]">
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

            {/* SECTION 2: GRAFIK TREN */}
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="pembungkus-grafik-tren w-full"
            >
                <GrafikTrenPelamar />
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
                        <TabelPelamarTerbaru dataPelamar={dataPelamarTerbaru} />
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
                        <GrafikStatusLamaran dataStatus={dataStatusLamaran} />
                    </div>
                </motion.div>
            </div>

            <div className="h-[20px]" />
        </div>
    );
};

export default HalamanDashboardAdmin;
