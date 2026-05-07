import React, { useState } from 'react';
import PenyaringStatus from './komponen/PenyaringStatus';
import GarisWaktuStatus from './komponen/GarisWaktuStatus';

const StatusLamaran = () => {
    const [statusAktif, setStatusAktif] = useState('Semua');
    const [kataKunci, setKataKunci] = useState('');

    // Data Mockup untuk pengujian antarmuka dengan 4 status berbeda
    const dataLamaran = [
        {
            id: 1,
            posisi: 'Senior Barista',
            nama_perusahaan: 'Indra Coffee Roasters',
            logo_perusahaan: null,
            tanggal_lamar: '20 Maret 2026',
            status: 'Diproses'
        },
        {
            id: 2,
            posisi: 'Head Roaster',
            nama_perusahaan: 'Mangga Dua Coffee Hub',
            logo_perusahaan: null,
            tanggal_lamar: '22 Maret 2026',
            status: 'Ditolak'
        },
        {
            id: 3,
            posisi: 'Service Attendant',
            nama_perusahaan: 'Cimanuk Brew House',
            logo_perusahaan: null,
            tanggal_lamar: '24 Maret 2026',
            status: 'Diterima'
        },
        {
            id: 4,
            posisi: 'Outlet Manager',
            nama_perusahaan: 'Dermayu Beans & Co.',
            logo_perusahaan: null,
            tanggal_lamar: '26 Maret 2026',
            status: 'Wawancara'
        }
    ];

    // Fungsi pemfilteran data secara real-time
    const dataTerpilih = dataLamaran.filter(item => {
        const cocokStatus = statusAktif === 'Semua' || item.status.toLowerCase().includes(statusAktif.toLowerCase());
        const cocokTeks = item.posisi.toLowerCase().includes(kataKunci.toLowerCase()) || 
                          item.nama_perusahaan.toLowerCase().includes(kataKunci.toLowerCase());
        return cocokStatus && cocokTeks;
    });

    return (
        <div className="halaman-status-lamaran-induk w-full min-h-screen bg-[#F3EDE6]">
            {/* Konten Utama Terpusat */}
            <main className="wadah-konten-maksimal w-full max-w-[1300px] mx-auto px-6 py-16 md:py-24">
                
                {/* Bagian Filter & Pencarian */}
                <section className="area-interaksi-status relative z-30">
                    <PenyaringStatus 
                        statusAktif={statusAktif} 
                        setStatusAktif={setStatusAktif} 
                        kataKunci={kataKunci}
                        setKataKunci={setKataKunci}
                    />
                </section>

                {/* Bagian Timeline & Kartu Status */}
                <section className="area-garis-waktu-lamaran mt-4">
                    <GarisWaktuStatus lamaran={dataTerpilih} />
                </section>
            </main>

            {/* Dekorasi Latar Belakang Halus */}
            <div className="dekorasi-lingkaran absolute top-0 right-0 w-[500px] h-[500px] bg-[#4B2E2B]/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
            <div className="dekorasi-lingkaran-2 absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#C69C6D]/10 rounded-full blur-[80px] -z-10 pointer-events-none"></div>
        </div>
    );
};

export default StatusLamaran;
