import React from 'react';
import logoStarbucks from '../../aset/beranda/starbucks.png';

const BagianCariCafe = () => {
    const daftarCafe = [
        { nama: 'Starbucks', gambar: logoStarbucks },
        { nama: 'Starbucks', gambar: logoStarbucks },
        { nama: 'Starbucks', gambar: logoStarbucks },
        { nama: 'Starbucks', gambar: logoStarbucks },
    ];

    return (
        <div className="flex w-full justify-center pb-12 md:pb-[100px] px-4">
            <section className="w-full max-w-[1334px]">

                {/* Judul */}
                <h2 className="font-poppins font-[700] text-3xl md:text-[36px] leading-tight md:leading-[54px] text-[#4b2e2b] mb-4">
                    Temukan Cafe Anda
                </h2>

                {/* Deskripsi */}
                <p className="font-['Lato'] font-[500] text-base md:text-[24px] leading-relaxed md:leading-[1.2] text-[#4b2e2b] max-w-[1208px]">
                    Jelajahi profil cafe untuk menemukan tempat kerja yang tepat bagi Anda. Pelajari tentang pekerjaan, ulasan, budaya
                    perusahaan, keuntungan, dan tunjangan.
                </p>

                {/* Daftar Kartu Cafe */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mt-10 md:mt-[90px]">
                    {daftarCafe.map((cafe, indeks) => (
                        <div
                            key={indeks}
                            className="bg-[#c69c6d] rounded-[30px] md:rounded-[50px] border border-[#4b2e2b]
                                       flex flex-col items-center justify-center p-8 md:p-10
                                       aspect-square md:aspect-auto md:h-[317px]
                                       transition-all duration-300 ease-out hover:-translate-y-2
                                       hover:shadow-[0_10px_20px_rgba(75,46,43,0.2)] cursor-pointer"
                        >
                            {/* Logo Cafe */}
                            <div className="w-[80px] h-[80px] mb-6">
                                <img src={cafe.gambar} alt={cafe.nama} className="w-[80px] h-[80px] object-cover" />
                            </div>

                            {/* Nama Cafe */}
                            <div className="flex justify-center mb-6">
                                <span className="font-poppins font-[600] text-[20px] md:text-[24px] leading-[36px] text-[#4b2e2b]">
                                    {cafe.nama}
                                </span>
                            </div>

                            {/* Tombol Lowongan */}
                            <button className="w-full max-w-[200px] h-[42px] bg-[#f3ede6] rounded-[5px]
                                               flex items-center justify-center
                                               transition-colors duration-200 hover:bg-[#4b2e2b] group/tombol">
                                <span className="font-poppins font-[600] text-[15px] md:text-[16px] leading-[24px] text-[#4b2e2b]
                                                 transition-colors duration-200 group-hover/tombol:text-[#f3ede6]">
                                    4 Pekerjaan
                                </span>
                            </button>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default BagianCariCafe;
