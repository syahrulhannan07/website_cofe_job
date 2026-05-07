import React from 'react';
import { useNavigate } from 'react-router-dom';

const KartuStatus = ({ data }) => {
    const navigate = useNavigate();
    // Warna sesuai Gambar 2
    const warnaAksen = '#FBB041'; // Kuning/Gold
    const warnaLatar = '#3D2722'; // Cokelat Gelap
    const warnaTeksUtama = '#F6E6D9'; // Cream Terang
    const warnaTeksSekunder = '#F6E6D9'; // Sama dengan utama namun dengan opacity

    return (
        <div className="kartu-lamaran-premium flex flex-col md:flex-row items-center rounded-[20px] p-5 md:p-6 mb-2 relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group"
             style={{ backgroundColor: warnaLatar }}>
            
            {/* Strip Aksen Kuning (Lebih lebar sesuai Gambar 2) */}
            <div className="aksen-kiri absolute left-0 top-0 bottom-0 w-[12px] md:w-[14px]"
                 style={{ backgroundColor: warnaAksen }}></div>

            {/* Bagian Kiri: Logo & Info Utama */}
            <div className="flex items-center flex-grow w-full md:w-auto mb-4 md:mb-0 ml-4 md:ml-6">
                {/* Logo Perusahaan (Kotak dengan rounded kecil sesuai Gambar 2) */}
                <div className="wadah-logo w-[70px] h-[70px] md:w-[85px] md:h-[85px] bg-[#1A1110] rounded-[16px] flex items-center justify-center mr-6 shadow-lg border border-white/5 flex-shrink-0">
                    {data.logo_perusahaan ? (
                        <img src={data.logo_perusahaan} alt={data.nama_perusahaan} className="w-full h-full object-cover rounded-[16px]" />
                    ) : (
                        <div className="ikon-dummy opacity-30 text-[32px]">☕</div>
                    )}
                </div>

                {/* Konten Teks */}
                <div className="konten-teks flex-grow">
                    <h3 className="font-poppins font-bold text-[20px] md:text-[24px] leading-tight mb-1"
                        style={{ color: warnaTeksUtama }}>
                        {data.posisi}
                    </h3>
                    <div className="info-tambahan space-y-0.5">
                        <p className="font-poppins font-medium text-[15px] md:text-[17px] opacity-80"
                           style={{ color: warnaTeksSekunder }}>
                            {data.nama_perusahaan}
                        </p>
                        <p className="font-poppins text-[13px] md:text-[14px] opacity-60"
                           style={{ color: warnaTeksSekunder }}>
                            Dikirim pada {data.tanggal_lamar}
                        </p>
                    </div>
                </div>
            </div>

            {/* Bagian Kanan: Status & Aksi */}
            <div className="area-kanan-premium flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center w-full md:w-auto gap-4 md:min-w-[180px] border-t border-white/5 md:border-none pt-4 md:pt-0 mt-2 md:mt-0 pr-2">
                {/* Pill Status (Kuning dengan teks gelap sesuai Gambar 2) */}
                <div className="pill-status px-8 py-2 md:py-2.5 rounded-full font-poppins font-bold text-[13px] md:text-[14px] shadow-md whitespace-nowrap"
                    style={{ backgroundColor: warnaAksen, color: '#3D2722' }}>
                    {data.status}
                </div>

                {/* Link Lihat Detail (Warna Kuning sesuai Gambar 2) */}
                <button 
                    onClick={() => navigate(`/status-lamaran/${data.id}`)}
                    className="flex items-center font-poppins font-semibold text-[14px] md:text-[15px] hover:opacity-80 transition-all whitespace-nowrap mt-2"
                        style={{ color: warnaAksen }}>
                    Lihat Detail
                    <svg className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default KartuStatus;
