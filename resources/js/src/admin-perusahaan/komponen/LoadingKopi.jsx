import React from 'react';
import { motion } from 'framer-motion';

const LoadingKopi = ({ fullScreen = true }) => {
    return (
        <div className={`flex flex-col items-center justify-center ${fullScreen ? 'fixed inset-0 z-[1000] bg-[#F3EDE6]' : 'w-full h-full p-10'}`}>
            <div className="relative w-24 h-24 mb-4">
                {/* Uap Kopi */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex gap-1">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            animate={{
                                y: [0, -20],
                                opacity: [0, 1, 0],
                                scale: [1, 1.2, 1.5]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: i * 0.4,
                                ease: "easeOut"
                            }}
                            className="w-1.5 h-6 bg-[#4B2E2B]/20 rounded-full blur-[1px]"
                        />
                    ))}
                </div>

                {/* Cangkir Kopi */}
                <div className="relative">
                    <svg viewBox="0 0 100 100" className="w-24 h-24 drop-shadow-lg">
                        {/* Body Cangkir */}
                        <path 
                            d="M20,40 Q20,80 50,80 Q80,80 80,40 Z" 
                            fill="#FFFFFF" 
                            stroke="#4B2E2B" 
                            strokeWidth="3"
                        />
                        {/* Gagang Cangkir */}
                        <path 
                            d="M80,45 Q95,45 95,55 Q95,65 80,65" 
                            fill="none" 
                            stroke="#4B2E2B" 
                            strokeWidth="3"
                        />
                        {/* Piring Bawah */}
                        <ellipse cx="50" cy="85" rx="35" ry="5" fill="#4B2E2B" opacity="0.1" />
                        
                        {/* Isi Kopi (Animasi Mengisi) */}
                        <motion.path
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: 1 }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                repeatType: "reverse",
                                ease: "easeInOut"
                            }}
                            style={{ originY: "bottom" }}
                            d="M23,45 Q23,77 50,77 Q77,77 77,45 Z"
                            fill="#4B2E2B"
                        />
                    </svg>
                </div>
            </div>
            
            <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="font-poppins font-medium text-[16px] text-[#4B2E2B]"
            >
                Menyeduh Data...
            </motion.p>
        </div>
    );
};

export default LoadingKopi;
