import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import placeholderProfile from '../../../aset/profil/placeholder_profil.jpg';

const KartuPerusahaan = ({ perusahaan }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            className="group relative"
        >
            <Link to={`/perusahaan/${perusahaan.id_perusahaan}`} className="block">
                <div className="aspect-square w-full bg-[#C69C6D] border-2 border-[#4B2E2B] rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all group-hover:shadow-[0_20px_40px_-15px_rgba(75,46,43,0.3)]">
                    <div className="w-20 h-20 bg-white rounded-full mb-4 shadow-inner border border-[#4B2E2B]/10 overflow-hidden flex items-center justify-center">
                        <img src={perusahaan.logo_perusahaan || placeholderProfile} alt={perusahaan.nama_perusahaan} className="w-full h-full object-cover" />
                    </div>

                    <h3 className="font-poppins font-bold text-lg text-[#4B2E2B] line-clamp-1 mb-4">
                        {perusahaan.nama_perusahaan}
                    </h3>

                    <div className="bg-[#F3EDE6] px-4 py-1.5 rounded-xl flex items-center gap-2 border border-[#4B2E2B]/5">
                        <span className="font-poppins font-semibold text-sm text-[#4B2E2B]">
                            {perusahaan.jumlah_lowongan} Pekerjaan
                        </span>
                    </div>

                    <div className="absolute inset-0 bg-[#4B2E2B] rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"></div>
                </div>
            </Link>
        </motion.div>
    );
};

export default KartuPerusahaan;
