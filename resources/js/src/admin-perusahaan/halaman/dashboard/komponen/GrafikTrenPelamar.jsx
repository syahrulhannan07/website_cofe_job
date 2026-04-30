import React from 'react';
import { motion } from 'framer-motion';

const GrafikTrenPelamar = () => {
    const dataPoin = [
        { x: 50,  y: 180, label: '1 April' },
        { x: 200, y: 150, label: '5 April' },
        { x: 350, y: 120, label: '10 April' },
        { x: 500, y: 90,  label: '15 April' },
        { x: 650, y: 85,  label: '20 April' },
        { x: 800, y: 140, label: '25 April' },
        { x: 950, y: 110, label: '30 April' },
    ];

    const lebarSvg = 1000;
    const tinggiSvg = 250;

    const pathGaris = dataPoin.reduce(
        (acc, poin, indeks) => (indeks === 0 ? `M ${poin.x} ${poin.y}` : `${acc} L ${poin.x} ${poin.y}`),
        ''
    );

    return (
        <div className="grafik-tren-pelamar w-full bg-[#F3EDE6] border border-[#4B2E2B] rounded-[10px] p-6 relative">
            <div className="header-grafik flex justify-between items-start mb-6">
                <div className="legend-kiri flex items-center gap-2">
                    <span className="dot-legend w-[10px] h-[10px] rounded-full bg-[#4B2E2B]" />
                    <span className="teks-legend font-poppins font-medium text-[12px] text-[#4B2E2B]">
                        Tren harian
                    </span>
                </div>
                <h2 className="judul-grafik font-poppins font-bold text-[28px] text-[#4B2E2B]">
                    Tren Pelamar
                </h2>
            </div>

            <div className="area-svg-grafik w-full overflow-hidden">
                <svg
                    viewBox={`0 0 ${lebarSvg} ${tinggiSvg}`}
                    className="grafik-svg w-full h-auto"
                    preserveAspectRatio="none"
                >
                    {[50, 100, 150, 200].map((y) => (
                        <line
                            key={y}
                            x1="0"
                            y1={y}
                            x2={lebarSvg}
                            y2={y}
                            stroke="#4B2E2B"
                            strokeWidth="0.5"
                            strokeDasharray="5,5"
                            opacity="0.1"
                        />
                    ))}
                    
                    {/* Animasi Garis Utama */}
                    <motion.path
                        d={pathGaris}
                        fill="none"
                        stroke="#4B2E2B"
                        strokeWidth="3"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 2.5, ease: "easeInOut" }}
                    />

                    {/* Animasi Titik Dot (Staggered) */}
                    {dataPoin.map((poin, i) => (
                        <g key={i}>
                            <motion.circle 
                                cx={poin.x} cy={poin.y} r="6" 
                                fill="#4B2E2B"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: (i * 0.3) + 0.5, duration: 0.5 }}
                                className="cursor-pointer hover:r-8 transition-all" 
                            />
                            <motion.text 
                                x={poin.x} y={tinggiSvg - 10} 
                                textAnchor="middle" 
                                className="font-poppins text-[12px] fill-[#4B2E2B] font-medium"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: (i * 0.3) + 0.7 }}
                            >
                                {poin.label}
                            </motion.text>
                        </g>
                    ))}
                </svg>
            </div>
        </div>
    );
};

export default GrafikTrenPelamar;
