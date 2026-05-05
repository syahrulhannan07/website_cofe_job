import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Paginasi = ({ totalHalaman = 3, halamanSaatIni = 1, setHalaman }) => {
    return (
        <div className="flex items-center justify-center">
            {/* Capsule Container (Node 53:1528) */}
            <div className="flex items-center justify-center gap-[10px] bg-[#4B2E2B] h-[77px] px-8 rounded-full shadow-xl">
                {/* Tombol Sebelumnya */}
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 rounded-full bg-[#F3EDE6] flex items-center justify-center text-[#4B2E2B] transition-all"
                    onClick={() => setHalaman && setHalaman(Math.max(1, halamanSaatIni - 1))}
                >
                    <ChevronLeft size={20} />
                </motion.button>

                {/* Nomor Halaman */}
                {[...Array(totalHalaman)].map((_, i) => {
                    const nomor = i + 1;
                    const aktif = nomor === halamanSaatIni;
                    
                    return (
                        <motion.button
                            key={nomor}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setHalaman && setHalaman(nomor)}
                            className={`w-10 h-10 rounded-full font-poppins font-bold text-sm transition-all ${
                                aktif 
                                    ? 'bg-[#C69C6D] text-[#F3EDE6]' 
                                    : 'bg-[#F3EDE6] text-[#C69C6D] hover:bg-white'
                            }`}
                        >
                            {nomor}
                        </motion.button>
                    );
                })}

                {/* Tombol Selanjutnya */}
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 rounded-full bg-[#F3EDE6] flex items-center justify-center text-[#4B2E2B] transition-all"
                    onClick={() => setHalaman && setHalaman(Math.min(totalHalaman, halamanSaatIni + 1))}
                >
                    <ChevronRight size={20} />
                </motion.button>
            </div>
        </div>
    );
};

export default Paginasi;
