import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Paginasi = ({ totalHalaman = 3, halamanSaatIni = 1, setHalaman }) => {
    return (
        <div className="flex items-center justify-center mt-8">
            <div className="flex items-center justify-center gap-2 bg-[#4B2E2B] h-12 px-6 rounded-full shadow-xl">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-8 h-8 rounded-full bg-[#F3EDE6] flex items-center justify-center text-[#4B2E2B] transition-all"
                    onClick={() => setHalaman && setHalaman(Math.max(1, halamanSaatIni - 1))}
                >
                    <ChevronLeft size={16} />
                </motion.button>

                {[...Array(totalHalaman)].map((_, i) => {
                    const nomor = i + 1;
                    const aktif = nomor === halamanSaatIni;
                    return (
                        <motion.button
                            key={nomor}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setHalaman && setHalaman(nomor)}
                            className={`w-8 h-8 rounded-full font-poppins font-bold text-xs transition-all ${aktif ? 'bg-[#C69C6D] text-[#F3EDE6]' : 'bg-[#F3EDE6] text-[#C69C6D] hover:bg-white'}`}
                        >
                            {nomor}
                        </motion.button>
                    );
                })}

                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-8 h-8 rounded-full bg-[#F3EDE6] flex items-center justify-center text-[#4B2E2B] transition-all"
                    onClick={() => setHalaman && setHalaman(Math.min(totalHalaman, halamanSaatIni + 1))}
                >
                    <ChevronRight size={16} />
                </motion.button>
            </div>
        </div>
    );
};

export default Paginasi;
