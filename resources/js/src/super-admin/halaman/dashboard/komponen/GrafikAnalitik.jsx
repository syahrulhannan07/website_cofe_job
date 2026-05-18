import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Dot } from 'recharts';

const dataTren = [
    { tgl: '1 April', nilai: 30 },
    { tgl: '5 April', nilai: 45 },
    { tgl: '10 April', nilai: 70 },
    { tgl: '15 April', nilai: 85 },
    { tgl: '20 April', nilai: 88 },
    { tgl: '25 April', nilai: 110 },
    { tgl: '30 April', nilai: 140 },
];

const GrafikAnalitik = () => {
    return (
        <div className="wadah-grafik-pertumbuhan bg-[#F3EDE6] rounded-[10px] p-8 border border-[#4B2E2B] relative h-[350px] overflow-hidden">
            {/* Overlay Judul Sesuai Figma */}
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
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={dataTren}
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
                        <Line 
                            type="monotone" 
                            dataKey="nilai" 
                            stroke="#4B2E2B" 
                            strokeWidth={3} 
                            dot={{ fill: '#4B2E2B', r: 5, strokeWidth: 2, stroke: '#F3EDE6' }}
                            activeDot={{ r: 8, fill: '#4B2E2B', stroke: '#FFF', strokeWidth: 2 }}
                            // Menambahkan filter shadow secara inline melalui defs jika diperlukan, 
                            // namun Recharts Line mendukung style
                            style={{ filter: 'drop-shadow(0px 3px 9px rgba(75, 46, 43, 0.5))' }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default GrafikAnalitik;
