import React from 'react';

const daftarLowongan = [
    {
        id: 1,
        judul: 'Senior Barista',
        perusahaan: 'Indra Coffee Roasters',
        lokasi: 'Karangampel',
        gaji: 'IDR 3.5M - 4.5M',
        warnaLogo: '#3D2314',
        ikon: (
            <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
                <circle cx="18" cy="18" r="10" fill="#C69C6D" opacity="0.9"/>
                <path d="M18 10C18 10 13 14 13 18C13 22 18 26 18 26C18 26 23 22 23 18C23 14 18 10Z" fill="#7C4A1E" opacity="0.8"/>
                <path d="M12 18C14.5 16 17 18 18 18C19 18 21.5 16 24 18" stroke="#C69C6D" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
        ),
    },
    {
        id: 2,
        judul: 'Head Roaster',
        perusahaan: 'Mangga Dua Coffee Hub',
        lokasi: 'Jatibarang',
        gaji: 'IDR 5.0M - 7.0M',
        warnaLogo: '#2A4A3E',
        ikon: (
            <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
                <rect x="8" y="14" width="20" height="14" rx="2" fill="#C69C6D" opacity="0.8"/>
                <path d="M14 14V12C14 9.79 15.79 8 18 8C20.21 8 22 9.79 22 12V14" stroke="#A0D4B5" strokeWidth="2"/>
                <circle cx="18" cy="18" r="3" fill="#2A4A3E"/>
            </svg>
        ),
    },
    {
        id: 3,
        judul: 'Service Attendant',
        perusahaan: 'Cimanuk Brew House',
        lokasi: 'Indramayu Kota',
        gaji: 'IDR 1.8M - 2.2M',
        warnaLogo: '#2B7A6F',
        ikon: (
            <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
                <rect x="6" y="18" width="24" height="12" rx="1" fill="#F5C842" opacity="0.9"/>
                <path d="M4 18L18 8L32 18" fill="#E8A020" opacity="0.9"/>
                <rect x="14" y="22" width="8" height="8" rx="1" fill="#2B7A6F"/>
                <rect x="9" y="20" width="5" height="5" rx="0.5" fill="#F5E6A3"/>
                <rect x="22" y="20" width="5" height="5" rx="0.5" fill="#F5E6A3"/>
            </svg>
        ),
    },
];

// Ikon Lokasi
const IkonLokasi = () => (
    <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 0C4.24 0 2 2.24 2 5C2 8.75 7 14 7 14C7 14 12 8.75 12 5C12 2.24 9.76 0 7 0ZM7 6.5C6.17 6.5 5.5 5.83 5.5 5C5.5 4.17 6.17 3.5 7 3.5C7.83 3.5 8.5 4.17 8.5 5C8.5 5.83 7.83 6.5 7 6.5Z" fill="#9E8B7C"/>
    </svg>
);

// Ikon Gaji
const IkonGaji = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="1" y="3" width="14" height="10" rx="2" stroke="#9E8B7C" strokeWidth="1.3"/>
        <circle cx="8" cy="8" r="2.5" stroke="#9E8B7C" strokeWidth="1.3"/>
        <path d="M4 3V13" stroke="#9E8B7C" strokeWidth="1" strokeLinecap="round"/>
        <path d="M12 3V13" stroke="#9E8B7C" strokeWidth="1" strokeLinecap="round"/>
    </svg>
);

const BagianLowonganTerbaru = () => {
    return (
        <div className="flex w-full justify-center pb-12 md:pb-[100px] px-4">
            {/* Wadah Seksi Utama */}
            <section className="relative w-full max-w-[1300px] bg-[#C19A6B] rounded-[40px] md:rounded-[80px] p-8 md:p-[80px] lg:pb-[100px]">

                {/* Kepala Seksi */}
                <div className="mb-8 md:mb-[48px]">
                    <h2 className="font-poppins font-[700] text-3xl md:text-[48px] leading-tight md:leading-[64px] text-[#4B2E2B] mb-3 md:mb-[12px]">
                        Lowongan Terbaru
                    </h2>
                    <p className="font-['Lato'] font-[500] text-base md:text-[18px] leading-relaxed text-[#4B2E2B] opacity-80 max-w-[600px]">
                        Jelajahi profil cafe untuk menemukan tempat kerja yang tepat bagi Anda. Pelajari tentang pekerjaan, ulasan, budaya.
                    </p>
                </div>

                {/* Kisi Kartu Lowongan */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6">
                    {daftarLowongan.map((lowongan) => (
                        <div
                            key={lowongan.id}
                            className="bg-[#F5EFE8] rounded-[20px] p-6 md:p-7 flex flex-col justify-between
                                       transition-transform duration-300 hover:-translate-y-1 hover:shadow-md"
                        >
                            {/* Konten Atas */}
                            <div className="flex flex-col">
                                {/* Kotak Ikon Perusahaan */}
                                <div
                                    className="w-[52px] h-[52px] rounded-[12px] flex items-center justify-center mb-5 shrink-0"
                                    style={{ backgroundColor: lowongan.warnaLogo }}
                                >
                                    {lowongan.ikon}
                                </div>

                                {/* Judul & Nama Perusahaan */}
                                <h3 className="font-poppins font-[600] text-[20px] md:text-[22px] leading-[28px] text-[#2D1B0E] mb-1">
                                    {lowongan.judul}
                                </h3>
                                <p className="font-['Lato'] font-[400] text-[14px] text-[#5C4033] mb-5">
                                    {lowongan.perusahaan}
                                </p>

                                {/* Baris Info: Lokasi & Gaji berdampingan */}
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-7">
                                    <div className="flex items-center gap-[6px]">
                                        <IkonLokasi />
                                        <span className="font-['Lato'] font-[400] text-[13px] text-[#7A6153]">
                                            {lowongan.lokasi}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-[6px]">
                                        <IkonGaji />
                                        <span className="font-['Lato'] font-[400] text-[13px] text-[#7A6153]">
                                            {lowongan.gaji}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Tombol Aksi */}
                            <button className="w-full py-[13px] border border-[#C19A6B] text-[#A07840] bg-transparent
                                               font-poppins font-[500] text-[15px] rounded-[10px]
                                               transition-all duration-200 hover:bg-[#C19A6B] hover:text-white">
                                Lihat Detail Lowongan
                            </button>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default BagianLowonganTerbaru;
