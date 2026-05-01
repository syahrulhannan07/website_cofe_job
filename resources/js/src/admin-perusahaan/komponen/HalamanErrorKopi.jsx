import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const HalamanErrorKopi = ({ code = 404, message = "Oops! Cangkir ini sepertinya kosong." }) => {
    const navigate = useNavigate();

    return (
        <div className="fixed inset-0 z-[1100] bg-[#F3EDE6] flex flex-col items-center justify-center p-6 text-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md"
            >
                {/* Visual Error Kopi */}
                <div className="relative w-48 h-48 mx-auto mb-8">
                    <svg viewBox="0 0 100 100" className="w-full h-full opacity-20 absolute top-0 left-0">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="#4B2E2B" strokeWidth="1" strokeDasharray="5 5" />
                    </svg>
                    
                    <motion.div
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="relative z-10"
                    >
                        {/* Cangkir Pecah/Kosong */}
                        <svg viewBox="0 0 100 100" className="w-40 h-40 mx-auto">
                            <path 
                                d="M20,40 Q20,80 50,80 Q80,80 80,40" 
                                fill="none" 
                                stroke="#4B2E2B" 
                                strokeWidth="3"
                                strokeLinecap="round"
                            />
                            <path d="M25,45 L35,55 M65,45 L75,55" stroke="#4B2E2B" strokeWidth="2" opacity="0.5" />
                            <text x="50" y="55" fontSize="12" textAnchor="middle" fill="#4B2E2B" fontWeight="bold">!</text>
                        </svg>
                    </motion.div>
                </div>

                <h1 className="font-poppins font-bold text-[64px] text-[#4B2E2B] leading-none mb-2">
                    {code}
                </h1>
                <h2 className="font-poppins font-semibold text-[24px] text-[#4B2E2B] mb-4">
                    {message}
                </h2>
                <p className="font-poppins text-[16px] text-[#4B2E2B]/70 mb-8">
                    Halaman yang Anda cari mungkin sudah dipindahkan atau koneksi sedang terganggu. Mari kembali ke bar utama.
                </p>

                <button 
                    onClick={() => navigate('/admin')}
                    className="px-10 py-3 bg-[#4B2E2B] text-white rounded-full font-poppins font-bold text-[16px] hover:bg-[#3d2523] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                    Kembali ke Dashboard
                </button>
            </motion.div>
        </div>
    );
};

export default HalamanErrorKopi;
