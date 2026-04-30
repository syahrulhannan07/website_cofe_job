import React from 'react';
import { motion } from 'framer-motion';
import FormProfil from './komponen/FormProfil';
import FotoProfil from './komponen/FotoProfil';

const HalamanProfil = () => {
    // Varian animasi untuk elemen form
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="halaman-profil w-full min-h-full px-[32px] py-[30px] flex flex-col gap-[64px]">
            {/* HEADER HALAMAN */}
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="header-profil flex flex-col gap-[8px]"
            >
                <h1 className="judul-halaman font-poppins font-bold text-[32px] leading-tight text-[#4B2E2B]">
                    Profile Cafe
                </h1>
                <p className="subjudul-halaman font-poppins font-regular text-[16px] text-[#4B2E2B] opacity-80">
                    Perbarui informasi identitas dan detail operasional kafe Anda.
                </p>
            </motion.div>

            {/* KONTEN UTAMA (FORM & FOTO) */}
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="konten-profil flex flex-col lg:flex-row gap-[24px] items-start"
            >
                {/* KOMPONEN FORM */}
                <FormProfil variants={itemVariants} />

                {/* KOMPONEN FOTO */}
                <FotoProfil variants={itemVariants} />
            </motion.div>

            <div className="h-[40px]" />
        </div>
    );
};

export default HalamanProfil;
