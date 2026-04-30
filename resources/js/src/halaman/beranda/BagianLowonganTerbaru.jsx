import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import JobCard from '../lowongan/components/JobCard';
import { daftarLowongan } from '../lowongan/data/dummyJobs';

const BagianLowonganTerbaru = () => {
    const navigate = useNavigate();
    
    // Ambil 3 lowongan pertama untuk ditampilkan di beranda
    const lowonganTerbaru = daftarLowongan.slice(0, 3);

    return (
        <div className="flex w-full justify-center px-4 pb-[150px]">
            {/* Wadah Seksi Utama - Radius 50, BG #C69C6D */}
            <motion.section 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative w-full max-w-[1300px] bg-[#C69C6D] rounded-[50px] overflow-hidden pt-20 pb-32"
            >
                <div className="max-w-[1232px] mx-auto px-4 md:px-8">
                    {/* Header */}
                    <div className="flex flex-col mb-12">
                        <h2 className="font-poppins font-bold text-[36px] leading-[44px] text-[#4B2E2B] mb-4">
                            Lowongan Terbaru
                        </h2>
                        <p className="font-poppins font-normal text-[16px] leading-[24px] text-[#4B2E2B] max-w-[500px]">
                            Jelajahi berbagai lowongan pekerjaan yang tersedia dan temukan yang paling cocok untuk Anda.
                        </p>
                    </div>
  
                    {/* Grid Lowongan */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]">
                        {lowonganTerbaru.map((lowongan) => (
                            <JobCard 
                                key={lowongan.id} 
                                lowongan={lowongan} 
                                onDetail={(job) => {
                                    navigate('/lowongan', { state: { selectedJob: job, from: '/' } });
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                            />
                        ))}
                    </div>
                </div>
            </motion.section>
        </div>
    );
};

export default BagianLowonganTerbaru;
