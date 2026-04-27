import React from 'react';

const GrafikStatusLamaran = ({ dataStatus }) => {
    const lebarMaks  = 280; 
    const lebarMin   = 120; 
    const tinggiBlok = 35;
    const lebarSvg   = 300;
    const tinggiSvg  = 140;
    const pusatX     = lebarSvg / 2;

    const buatTrapezoid = (indeks, total) => {
        const selisih = (lebarMaks - lebarMin) / (total - 1);
        const lebarAtas  = lebarMaks - (indeks * selisih);
        const lebarBawah = lebarMaks - ((indeks + 1) * selisih);
        const y1 = indeks * tinggiBlok;
        const y2 = (indeks + 1) * tinggiBlok;
        const x1Kiri  = pusatX - lebarAtas / 2;
        const x1Kanan = pusatX + lebarAtas / 2;
        const x2Kiri  = pusatX - lebarBawah / 2;
        const x2Kanan = pusatX + lebarBawah / 2;
        return `M ${x1Kiri} ${y1} L ${x1Kanan} ${y1} L ${x2Kanan} ${y2} L ${x2Kiri} ${y2} Z`;
    };

    return (
        <div className="grafik-status-lamaran-container relative w-full h-full flex flex-col items-center justify-center bg-[#F3EDE6] border border-[#4B2E2B] rounded-[5px] p-3">
            <div className="area-svg-piramida w-full flex justify-center mt-[-10px]">
                <svg viewBox={`0 0 ${lebarSvg} ${tinggiSvg}`} className="w-full max-w-[280px] h-auto">
                    {dataStatus.map((item, i) => (
                        <g key={item.label}>
                            <path d={buatTrapezoid(i, dataStatus.length)} fill={item.warna} />
                            <text x={pusatX} y={i * tinggiBlok + tinggiBlok/2 + 5} textAnchor="middle" className="font-poppins font-black text-[14px] fill-[#000]">
                                {item.nilai}
                            </text>
                        </g>
                    ))}
                </svg>
            </div>
            <div className="area-legenda-absolute absolute bottom-[12px] left-[12px] flex flex-col gap-[2px]">
                {dataStatus.map((item) => (
                    <div key={item.label} className="item-legenda flex items-center gap-2">
                        <span className="bulat-warna w-[8px] h-[8px] rounded-full flex-shrink-0" style={{ backgroundColor: item.warna }} />
                        <span className="teks-legenda font-poppins text-[9px] font-medium text-black opacity-80">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GrafikStatusLamaran;
