import React, { useState, useEffect } from 'react';
import KartuFotoProfil from './komponen/KartuFotoProfil';
import FormInformasiPribadi from './komponen/FormInformasiPribadi';
import BagianPendidikan from './komponen/BagianPendidikan';
import BagianPengalaman from './komponen/BagianPengalaman';
import BagianKeahlian from './komponen/BagianKeahlian';
import TombolKeluar from './komponen/TombolKeluar';
import LoadingKopi from '../../admin-perusahaan/komponen/LoadingKopi';
import layananProfil from '../../layanan/layananProfil';

const Profil = () => {
    const [profilData, setProfilData] = useState(null);
    const [loading, setLoading] = useState(true);

    const refreshData = async () => {
        try {
            const respons = await layananProfil.ambilProfil();
            if (respons.status === 'success') {
                setProfilData(respons.data);
            }
        } catch (error) {
            console.error("Gagal memuat profil:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshData();
    }, []);

    if (loading) return <LoadingKopi />;

    return (
        <div className="wadah-halaman-profil w-full font-poppins flex flex-col overflow-x-hidden bg-[#F3EDE6]">
            <main className="area-konten-utama flex-1 flex flex-col items-center py-12 md:py-20 px-4 relative">
                <div className="kontainer-halaman w-full max-w-[1234px] flex flex-col gap-[34px] z-10">
                    <div className="baris-info-utama flex flex-col lg:flex-row gap-[34px] items-stretch">
                        <div className="sisi-kiri-informasi lg:w-[863px] order-2 lg:order-1 flex flex-col">
                            <FormInformasiPribadi initialData={profilData} onRefresh={refreshData} />
                        </div>

                        <div className="sisi-kanan-foto lg:w-[337px] order-1 lg:order-2 flex flex-col">
                            <KartuFotoProfil initialData={profilData} />
                        </div>
                    </div>

                    <BagianPendidikan initialData={profilData?.pendidikan} onRefresh={refreshData} />
                    <BagianPengalaman initialData={profilData?.pengalaman_kerja} onRefresh={refreshData} />
                    <BagianKeahlian initialData={profilData?.skills} onRefresh={refreshData} />
                    <TombolKeluar />
                </div>
            </main>
        </div>
    );
};

export default Profil;
