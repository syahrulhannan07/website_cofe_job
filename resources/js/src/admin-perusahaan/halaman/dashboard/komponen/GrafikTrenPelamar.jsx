import React from 'react';
import { motion } from 'framer-motion';

const GrafikTrenPelamar = ({ dataTren }) => {
    // Jika tidak ada data, gunakan array kosong
    const tren = dataTren || [];
    
    const lebarSvg = 1000;
    const tinggiSvg = 250;
    const padding = 50;
    const areaLebar = lebarSvg - (padding * 2);
    const areaTinggi = tinggiSvg - (padding * 2);

    // Cari nilai maksimum untuk skala Y
    const nilaiMaks = Math.max(...tren.map(d => d.jumlah), 5); // Minimal skala 5
    
    // Mapping data ke koordinat SVG
    const dataPoin = tren.map((poin, indeks) => {
        const x = padding + (indeks * (areaLebar / (Math.max(tren.length - 1, 1))));
        const y = tinggiSvg - padding - (poin.jumlah / nilaiMaks * areaTinggi);
        return { x, y, label: poin.tanggal, nilai: poin.jumlah };
    });

    // Filter data agar hanya menyertakan poin yang memiliki label/dot yang tampil
    const dataTampil = dataPoin.filter((_, i) => 
        tren.length <= 7 || i % 5 === 0 || i === tren.length - 1
    );

    const pathGaris = dataTampil.reduce(
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
                    <defs>
                        <linearGradient id="gradienGrafik" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#4B2E2B" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#4B2E2B" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Garis Grid Horizontal */}
                    {[0, 0.25, 0.5, 0.75, 1].map((p) => (
                        <line
                            key={p}
                            x1={padding}
                            y1={padding + (p * areaTinggi)}
                            x2={lebarSvg - padding}
                            y2={padding + (p * areaTinggi)}
                            stroke="#4B2E2B"
                            strokeWidth="0.5"
                            strokeDasharray="5,5"
                            opacity="0.1"
                        />
                    ))}
                    
                    {/* Area di bawah garis (Gradient) */}
                    <motion.path
                        d={`${pathGaris} L ${dataTampil[dataTampil.length - 1]?.x} ${tinggiSvg - padding} L ${dataTampil[0]?.x} ${tinggiSvg - padding} Z`}
                        fill="url(#gradienGrafik)"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1.5, delay: 0.5 }}
                    />

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
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                    />

                    {/* Animasi Titik Dot (Hanya untuk tanggal yang tampil agar rapih) */}
                    {dataPoin.map((poin, i) => {
                        const tampilkanLabel = (tren.length <= 7 || i % 5 === 0 || i === tren.length - 1);
                        return (
                            <g key={i}>
                                {tampilkanLabel && (
                                    <>
                                        <motion.text 
                                            x={poin.x} y={tinggiSvg - 10} 
                                            textAnchor="middle" 
                                            className="font-poppins text-[12px] fill-[#4B2E2B] font-medium"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: (i * 0.05) + 0.7 }}
                                        >
                                            {poin.label}
                                        </motion.text>
                                        <motion.circle 
                                            cx={poin.x} cy={poin.y} r="5" 
                                            fill="#4B2E2B"
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ delay: (i * 0.05) + 0.5, duration: 0.3 }}
                                            className="cursor-pointer hover:r-7 transition-all" 
                                        >
                                            <title>{`${poin.label}: ${poin.nilai} Pelamar`}</title>
                                        </motion.circle>
                                    </>
                                )}
                            </g>
                        );
                    })}
                </svg>
            </div>
        </div>
    );
};

export default GrafikTrenPelamar;
