import React from 'react';
import gambarGabungSekarang from '../../aset/beranda/img-gabung-sekarang.png';
import gambarCariLowongan from '../../aset/beranda/img-cari-lowongan.png';

const BagianAjakan = () => {
    return (
        <div className="flex w-full justify-center pb-12 md:pb-[100px] px-4">
            <section className="w-full max-w-[1300px] grid grid-cols-1 lg:grid-cols-2 gap-[30px]">

                {/* Kartu Kiri — Pemasang Lowongan (Node 51:215) */}
                <div 
                    className="relative overflow-hidden bg-[#769833] rounded-[40px] md:rounded-[80px] cursor-pointer group"
                    style={{ height: '435px' }}
                >
                    {/* Konten Teks — Posisi Deterministik (X: 90px, Y: 70px) */}
                    <div className="absolute left-8 md:left-[90px] top-[70px] z-10 flex flex-col max-w-[500px]">
                        <h2 className="font-poppins font-bold text-[32px] md:text-[40px] leading-[1.3] md:leading-[60px] text-white md:min-h-[120px]">
                            Ingin Pasang Iklan<br/>
                            Lowongan di Cofe Job?
                        </h2>
                        <div className="mt-[61px]">
                            <button 
                                className="bg-[#F3EDE6] text-[#4B2E2B] font-poppins font-semibold text-[18px] md:text-[20px] rounded-[20px] transition-all duration-300 hover:shadow-xl hover:scale-105"
                                style={{ width: '254px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                Gabung Sekarang
                            </button>
                        </div>
                    </div>

                    {/* Ilustrasi — Rata Kanan Bawah */}
                    <div className="absolute right-0 bottom-0 h-full w-[45%] flex items-end justify-center pointer-events-none pr-4 md:pr-10 pb-4">
                        <img
                            src={gambarGabungSekarang}
                            alt="Visual Pekerja"
                            className="h-[80%] w-auto object-contain object-bottom"
                        />
                    </div>
                </div>

                {/* Kartu Kanan — Pencari Kerja (Node 51:223) */}
                <div 
                    className="relative overflow-hidden bg-[#4B3C2B] rounded-[40px] md:rounded-[80px] cursor-pointer group"
                    style={{ height: '435px' }}
                >
                    {/* Konten Teks — Posisi Deterministik */}
                    <div className="absolute left-8 md:left-[90px] top-[70px] z-10 flex flex-col max-w-[442px]">
                        <h2 className="font-poppins font-bold text-[32px] md:text-[40px] leading-[1.3] md:leading-[60px] text-white md:min-h-[120px]">
                            Cari Careermu dan<br/>
                            Lamar!
                        </h2>
                        <div className="mt-[61px]">
                            <button 
                                className="bg-[#F3EDE6] text-[#4B3C2B] font-poppins font-semibold text-[18px] md:text-[20px] rounded-[20px] transition-all duration-300 hover:shadow-xl hover:scale-105"
                                style={{ width: '201px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                Cari Lowongan
                            </button>
                        </div>
                    </div>

                    {/* Ilustrasi — Rata Kanan Bawah */}
                    <div className="absolute right-0 bottom-0 h-full w-[45%] flex items-end justify-center pointer-events-none pr-4 md:pr-10 pb-4">
                        <img
                            src={gambarCariLowongan}
                            alt="Visual Pencari Kerja"
                            className="h-[80%] w-auto object-contain object-bottom"
                        />
                    </div>
                </div>

            </section>
        </div>
    );
};

export default BagianAjakan;
