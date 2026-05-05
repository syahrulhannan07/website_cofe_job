import React, { useState } from 'react';
import Hero from './komponen/Hero';
import PanduanLamar from './komponen/PanduanLamar';
import BagianCariCafe from '../beranda/komponen/BagianCariCafe';
import { motion } from 'framer-motion';

const Perusahaan = () => {
    const [pencarian, setPencarian] = useState('');

    return (
        <motion.main 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="wadah-halaman-perusahaan w-full min-h-screen bg-[#F3EDE6] pt-24 pb-20"
        >
            <div className="container mx-auto px-4 md:px-8 mb-8">
                {/* Hero Section */}
                <Hero pencarian={pencarian} setPencarian={setPencarian} />
            </div>

            {/* Cafe Selection Section (Reused from Home) */}
            <BagianCariCafe tampilkanPaginasi={true} />

            <div className="container mx-auto px-4 md:px-8 mt-8">
                {/* Guide Section */}
                <PanduanLamar />
            </div>
        </motion.main>
    );
};

export default Perusahaan;
