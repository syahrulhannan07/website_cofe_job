import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

const KartuPerusahaan = ({ perusahaan }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            whileHover={{ y: -10 }}
            className="group relative"
        >
            <Link to={`/perusahaan/${perusahaan.id_perusahaan}`} className="block">
                <div className="aspect-square w-full bg-[#C69C6D] border-2 border-[#4B2E2B] rounded-[50px] p-8 flex flex-col items-center justify-center text-center transition-all group-hover:shadow-[0_20px_40px_-15px_rgba(75,46,43,0.3)]">
                    
                    {/* Logo Container */}
                    <div className="w-24 h-24 bg-white rounded-full p-4 mb-6 shadow-inner border border-[#4B2E2B]/10 overflow-hidden flex items-center justify-center">
                        {perusahaan.logo_perusahaan ? (
                            <img 
                                src={perusahaan.logo_perusahaan} 
                                alt={perusahaan.nama_perusahaan} 
                                className="w-full h-full object-contain"
                            />
                        ) : (
                            <div className="text-4xl font-bold text-[#4B2E2B]">
                                {perusahaan.nama_perusahaan.charAt(0)}
                            </div>
                        )}
                    </div>

                    <h3 className="font-poppins font-bold text-2xl text-[#4B2E2B] line-clamp-1 mb-6">
                        {perusahaan.nama_perusahaan}
                    </h3>

                    {/* Badge */}
                    <div className="bg-[#F3EDE6] px-6 py-2 rounded-xl flex items-center gap-2 border border-[#4B2E2B]/5">
                        <span className="font-poppins font-semibold text-[#4B2E2B]">
                            {perusahaan.jumlah_lowongan} Pekerjaan
                        </span>
                    </div>

                    {/* Hover Effect Overlay */}
                    <div className="absolute inset-0 bg-[#4B2E2B] rounded-[50px] opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"></div>
                </div>
            </Link>
        </motion.div>
    );
};

export default KartuPerusahaan;
