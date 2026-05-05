import React from 'react';
import KartuFotoProfil from './komponen/KartuFotoProfil';
import FormInformasiPribadi from './komponen/FormInformasiPribadi';
import BagianPendidikan from './komponen/BagianPendidikan';
import BagianPengalaman from './komponen/BagianPengalaman';
import BagianKeahlian from './komponen/BagianKeahlian';
import TombolKeluar from './komponen/TombolKeluar';

const Profil = () => {
    return (
        <div className="wadah-halaman-profil w-full font-poppins flex flex-col overflow-x-hidden bg-[#F3EDE6]">
            
            <main className="area-konten-utama flex-1 flex flex-col items-center py-12 md:py-20 px-4 relative">

                <div className="kontainer-halaman w-full max-w-[1234px] flex flex-col gap-[34px] z-10">
                    {/* Baris 1: Informasi Pribadi & Foto */}
                    <div className="baris-info-utama flex flex-col lg:flex-row gap-[34px] items-stretch">
                        {/* Sisi Kiri: Form Informasi */}
                        <div className="sisi-kiri-informasi lg:w-[863px] order-2 lg:order-1 flex flex-col">
                            <FormInformasiPribadi />
                        </div>

                        {/* Sisi Kanan: Foto Profil */}
                        <div className="sisi-kanan-foto lg:w-[337px] order-1 lg:order-2 flex flex-col">
                            <KartuFotoProfil />
                        </div>
                    </div>

                    {/* Bagian Selanjutnya dengan gap yang sama (34px) */}
                    <BagianPendidikan />
                    <BagianPengalaman />
                    <BagianKeahlian />
                    <TombolKeluar />
                </div>
            </main>
        </div>
    );
};

export default Profil;
