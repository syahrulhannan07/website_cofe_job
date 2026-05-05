import React from 'react';
import buildingIcon from '../../../aset/profil/Building.png';
import plusIcon from '../../../aset/profil/Plus Math.png';
import backgroundVector from '../../../aset/profil/Vector.png';

const BagianPengalaman = () => {
    return (
        <div className="bagian-pengalaman bg-[#C69C6D] rounded-[25px] p-8 md:p-10 relative overflow-hidden shadow-sm w-full min-h-[300px] flex flex-col justify-center">
            {/* Background Vector */}
            <div className="vektor-latar absolute bottom-0 left-0 w-full opacity-30 pointer-events-none z-0">
                <img src={backgroundVector} alt="" className="w-full h-auto object-cover" />
            </div>

            {/* Header Section */}
            <div className="area-header relative z-10 flex justify-between items-center mb-8">
                <h2 className="judul-seksi font-poppins font-semibold text-[28px] md:text-[32px] text-[#4B2E2B]">
                    Pengalaman
                </h2>
                <button className="tombol-tambah flex items-center gap-2 border-[3px] border-[#4B2E2B] rounded-[20px] px-6 py-2 hover:bg-[#4B2E2B]/10 transition-colors">
                    <img src={plusIcon} alt="" className="w-8 h-8" />
                    <span className="font-poppins font-bold text-[20px] md:text-[24px] text-[#4B2E2B]">Tambah</span>
                </button>
            </div>

            {/* Content Section */}
            <div className="area-konten relative z-10">
                <div className="pengalaman-item flex gap-6 relative">
                    {/* Icon & Timeline Line */}
                    <div className="timeline-pengalaman flex flex-col items-center">
                        <div className="wadah-ikon w-[60px] h-[60px] bg-white border-2 border-[#4B2E2B] rounded-[20px] flex items-center justify-center z-10 shadow-sm">
                            <img src={buildingIcon} alt="" className="w-10 h-10" />
                        </div>
                        <div className="garis-timeline w-[2px] h-[80px] bg-[#4B2E2B] opacity-50"></div>
                    </div>

                    {/* Text Info */}
                    <div className="info-pengalaman pt-1 flex flex-col">
                        <h3 className="nama-perusahaan-jabatan font-poppins font-semibold text-[18px] md:text-[22px] text-[#4B2E2B] leading-tight">
                            Teras Coffee - Waiter
                        </h3>
                        <p className="rentang-waktu font-poppins font-medium text-[16px] md:text-[18px] text-[#4B2E2B]/80 mt-1">
                            13 April 2023 - 2 Februari 2024
                        </p>
                        <p className="deskripsi-pengalaman font-poppins text-[14px] md:text-[16px] text-[#F3EDE6] mt-3 max-w-[850px] leading-relaxed">
                            Selama di teras coffe saya bertanggung jawab dalam menerima pesanan langsung dari costumer sekaligus menganter pesanan tersebut setelah di siapkan oleh tim dapur.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BagianPengalaman;
