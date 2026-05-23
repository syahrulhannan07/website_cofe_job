import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import api from '../../layanan/api';
import placeholderProfile from '../../aset/profil/placeholder_profil.jpg';
import leftArrow from '../../aset/perusahaan/Left Arrow.png';
import JobCard from '../lowongan/komponen/JobCard';
import HalamanErrorKopi from '../../komponen/umum/HalamanErrorKopi';
import LoadingKopi from '../../komponen/umum/LoadingKopi';

const DetailPerusahaan = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { state } = useLocation();

    // Gunakan data dari state rute jika tersedia agar tampilan muncul instan
    const [perusahaan, setPerusahaan] = useState(state?.perusahaan || null);
    const [sedangMemuat, setSedangMemuat] = useState(!state?.perusahaan);
    const [error, setError] = useState(null);

    useEffect(() => {
        const ambilDetailPerusahaan = async () => {
            try {
                if (!perusahaan) setSedangMemuat(true);
                const respons = await api.get(`/perusahaan/${id}`, { timeout: 10000 });
                if (respons.data && respons.data.data) {
                    setPerusahaan(respons.data.data);
                    setError(null);
                }
            } catch (err) {
                console.error('Gagal mengambil detail perusahaan:', err);
                if (err.response?.status === 404) {
                    setError(404);
                } else if (err.code === 'ECONNABORTED' || !err.response) {
                    setError('timeout');
                } else {
                    setError('error');
                }
            } finally {
                setSedangMemuat(false);
            }
        };

        if (id) {
            ambilDetailPerusahaan();
        }
    }, [id]);

    // Tampilkan Halaman Error jika terjadi masalah
    if (error === 404) {
        return <HalamanErrorKopi code={404} message="Perusahaan Tidak Ditemukan" subMessage="Maaf, profil kafe yang Anda cari tidak tersedia." />;
    }

    if (error === 'timeout' || error === 'error') {
        return <HalamanErrorKopi code="500" message="Koneksi Terganggu" subMessage="Gagal memuat profil kafe. Silakan periksa koneksi internet Anda." />;
    }

    if (sedangMemuat && !perusahaan) {
        return <LoadingKopi pesan="Menyiapkan Profil Kafe..." />;
    }

    if (!perusahaan) {
        return <HalamanErrorKopi code={404} message="Data Kosong" />;
    }

    return (
        <div className="flex flex-col w-full bg-[#F3EDE6] min-h-screen">
            {/* Header Perusahaan */}
            <section className="w-full bg-[#4B2E2B] py-16 px-8 md:px-24 flex flex-col lg:flex-row items-center justify-between gap-12">
                <div className="flex flex-col md:flex-row items-center gap-12">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-[150px] h-[150px] bg-[#F3EDE6] rounded-full overflow-hidden flex items-center justify-center shrink-0 shadow-xl border-4 border-[#C69C6D]/20"
                    >
                        <img 
                            src={perusahaan.logo_perusahaan || placeholderProfile} 
                            alt={perusahaan.nama_perusahaan} 
                            className="w-full h-full object-cover" 
                        />
                    </motion.div>
                    
                    <div className="flex flex-col text-center md:text-left">
                        <motion.h1 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="font-poppins font-bold text-[36px] md:text-[54px] text-[#F3EDE6] leading-tight"
                        >
                            {perusahaan.nama_perusahaan}
                        </motion.h1>
                        <motion.p 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="font-poppins font-regular text-[24px] md:text-[30px] text-[#C69C6D] opacity-90"
                        >
                            {perusahaan.tagline || "Coffee Experience Terbaik di Indramayu"}
                        </motion.p>
                    </div>
                </div>

                {/* Tombol Navigasi */}
                <div className="flex flex-col gap-5">
                    <motion.button
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="w-[200px] h-[61px] bg-[#C69C6D] rounded-[12px] font-inter font-bold text-[20px] text-[#F3EDE6] 
                                   shadow-[0_4px_4px_rgba(0,0,0,0.25)] hover:bg-[#b0895f] transition-all duration-300"
                    >
                        Tentang
                    </motion.button>
                    
                    <motion.button
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        onClick={() => navigate(-1)}
                        className="w-[200px] h-[61px] border border-[#F3EDE6] rounded-[12px] bg-transparent 
                                   flex items-center justify-center gap-2 shadow-[0_4px_4px_rgba(0,0,0,0.25)]
                                   hover:bg-[#F3EDE6]/10 transition-all duration-300 group"
                    >
                        <img 
                            src={leftArrow} 
                            alt="Back" 
                            className="w-[30px] h-[40px] object-contain group-hover:-translate-x-1 transition-transform" 
                        />
                        <span className="font-inter font-bold text-[24px] text-[#C69C6D]">
                            Kembali...
                        </span>
                    </motion.button>
                </div>
            </section>

            {/* Konten Utama */}
            <section className="max-w-[1300px] mx-auto w-full px-8 py-20 flex flex-col gap-16">
                
                {/* Sekilas Tentang Perusahaan */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col gap-10"
                >
                    <h2 className="font-poppins font-semibold text-[32px] text-[#4B2E2B] mb-4">
                        Sekilas tentang perusahaan
                    </h2>
                    
                    <div className="flex flex-col gap-8">
                        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2 md:gap-8 items-start">
                            <span className="font-poppins font-semibold text-[20px] text-[#4B2E2B]">Nama</span>
                            <span className="font-poppins font-regular text-[20px] text-[#4B2E2B]">{perusahaan.nama_perusahaan}</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2 md:gap-8 items-start">
                            <span className="font-poppins font-semibold text-[20px] text-[#4B2E2B]">Email Bisnis</span>
                            <span className="font-poppins font-regular text-[20px] text-[#4B2E2B]">{perusahaan.email || "-"}</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2 md:gap-8 items-start">
                            <span className="font-poppins font-semibold text-[20px] text-[#4B2E2B]">Alamat</span>
                            <span className="font-poppins font-regular text-[20px] text-[#4B2E2B]">
                                {perusahaan.alamat_perusahaan}
                                {perusahaan.kecamatan && !perusahaan.alamat_perusahaan.includes(perusahaan.kecamatan) && `, ${perusahaan.kecamatan}`}
                                {", Indramayu"}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2 md:gap-8 items-start">
                            <span className="font-poppins font-semibold text-[20px] text-[#4B2E2B]">Tanggal Berdiri</span>
                            <span className="font-poppins font-regular text-[20px] text-[#4B2E2B]">{perusahaan.tanggal_berdiri || "-"}</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2 md:gap-8 items-start">
                            <span className="font-poppins font-semibold text-[20px] text-[#4B2E2B]">Deskripsi</span>
                            <p className="font-poppins font-regular text-[20px] text-[#4B2E2B] text-justify leading-relaxed whitespace-pre-line">
                                {perusahaan.deskripsi || "Informasi deskripsi perusahaan belum tersedia."}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Bagian Lowongan Aktif */}
                <div className="bg-[#C69C6D] rounded-[50px] px-[40px] py-[60px] md:px-[80px] md:py-[80px]">
                    <div className="flex flex-col gap-10">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="flex flex-col gap-4"
                        >
                            <h2 className="font-poppins font-bold text-[36px] text-[#4B2E2B]">
                                Lowongan di {perusahaan.nama_perusahaan}
                            </h2>
                            <p className="font-lato font-medium text-[24px] text-[#4B2E2B]">
                                Temukan karir impianmu di {perusahaan.nama_perusahaan}
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {perusahaan.lowongan && perusahaan.lowongan.length > 0 ? (
                                perusahaan.lowongan.map((lowongan) => (
                                    <div key={lowongan.id} className="kartu-item-lowongan">
                                        <JobCard 
                                            lowongan={lowongan} 
                                            onDetail={(job) => {
                                                navigate(`/lowongan/${job.id}`, { state: { job: job } });
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                        />
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-10 text-center text-[#4B2E2B] font-poppins font-semibold text-[20px]">
                                    Belum ada lowongan aktif untuk saat ini.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default DetailPerusahaan;
