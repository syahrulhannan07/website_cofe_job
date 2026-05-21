import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Format tanggal "2026-05-21" → "21 Mei"
const formatTanggalSingkat = (tglStr) => {
    const bulan = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
    const d = new Date(tglStr);
    return `${d.getDate()} ${bulan[d.getMonth()]}`;
};

const GrafikAnalitik = ({ dataTren, sedangMemuat }) => {
    // Sampling: tampilkan ~7 titik data agar label sumbu X tidak bertumpuk
    const dataDiproses = React.useMemo(() => {
        if (!dataTren || dataTren.length === 0) return [];
        const langkah = Math.max(1, Math.floor(dataTren.length / 7));
        return dataTren
            .filter((_, i) => i % langkah === 0 || i === dataTren.length - 1)
            .map((item) => ({
                tgl: formatTanggalSingkat(item.tanggal),
                perusahaan: item.perusahaan,
                pelamar: item.pelamar,
            }));
    }, [dataTren]);

    return (
        <div className="wadah-grafik-pertumbuhan bg-[#F3EDE6] rounded-[10px] p-8 border border-[#4B2E2B] relative h-[350px] overflow-hidden">
            <div className="flex justify-between items-start mb-10">
                <div className="flex items-center gap-2">
                    <div className="w-[15px] h-[16px] bg-[#4B2E2B] rounded-full" />
                    <h3 className="font-poppins font-bold text-[15px] text-[#4B2E2B]">
                        Tren harian
                    </h3>
                </div>
                <h2 className="font-poppins font-bold text-[32px] text-[#4B2E2B] leading-none">
                    Tren Pertumbuhan
                </h2>
            </div>
            
            <div className="area-visualisasi w-full h-[200px]">
                {sedangMemuat || dataDiproses.length === 0 ? (
                    <div className="indikator-memuat flex items-center justify-center h-full">
                        <span className="font-poppins text-[14px] text-[#4B2E2B]/50">
                            {sedangMemuat ? 'Memuat grafik...' : 'Belum ada data tren'}
                        </span>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={dataDiproses}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(75, 46, 43, 0.1)" />
                            <XAxis 
                                dataKey="tgl" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#4B2E2B', fontSize: 13, fontFamily: 'Poppins' }}
                                dy={15}
                            />
                            <YAxis hide={true} />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: '#4B2E2B', 
                                    color: '#FFF', 
                                    borderRadius: '8px',
                                    border: 'none',
                                    fontFamily: 'Poppins',
                                    fontSize: '12px'
                                }}
                                itemStyle={{ color: '#F3EDE6' }}
                                cursor={{ stroke: 'rgba(75, 46, 43, 0.2)', strokeWidth: 2 }}
                            />
                            <Legend 
                                verticalAlign="top" 
                                align="left"
                                iconType="circle"
                                wrapperStyle={{ fontFamily: 'Poppins', fontSize: '12px', paddingBottom: '8px' }}
                            />
                            {/* Garis tren pendaftaran kafe/perusahaan */}
                            <Line 
                                type="monotone" 
                                dataKey="perusahaan"
                                name="Kafe/Perusahaan"
                                stroke="#4B2E2B" 
                                strokeWidth={3} 
                                dot={{ fill: '#4B2E2B', r: 5, strokeWidth: 2, stroke: '#F3EDE6' }}
                                activeDot={{ r: 8, fill: '#4B2E2B', stroke: '#FFF', strokeWidth: 2 }}
                                style={{ filter: 'drop-shadow(0px 3px 9px rgba(75, 46, 43, 0.5))' }}
                            />
                            {/* Garis tren pendaftaran pelamar */}
                            <Line 
                                type="monotone" 
                                dataKey="pelamar"
                                name="Pelamar"
                                stroke="#FEAE2C" 
                                strokeWidth={3} 
                                dot={{ fill: '#FEAE2C', r: 5, strokeWidth: 2, stroke: '#F3EDE6' }}
                                activeDot={{ r: 8, fill: '#FEAE2C', stroke: '#FFF', strokeWidth: 2 }}
                                style={{ filter: 'drop-shadow(0px 3px 9px rgba(254, 174, 44, 0.4))' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};

export default GrafikAnalitik;
