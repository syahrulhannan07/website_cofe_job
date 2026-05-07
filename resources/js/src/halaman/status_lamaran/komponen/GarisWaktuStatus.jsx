import React from 'react';
import KartuStatus from './KartuStatus';
import coffeeBeansIcon from '../../../aset/status_lamaran/Coffee Beans.png';

const GarisWaktuStatus = ({ lamaran }) => {
    // Warna sesuai Gambar 1
    const warnaGaris = '#3D2722'; 
    const warnaSimpul = '#3D2722';

    if (lamaran.length === 0) {
        return (
            <div className="area-kosong-lamaran py-32 flex flex-col items-center justify-center text-center">
                <div className="ikon-kosong text-[64px] mb-6 opacity-20">📂</div>
                <p className="font-poppins font-medium text-[20px] text-[#4B2E2B]/40 italic max-w-[400px]">
                    Belum ada riwayat lamaran yang ditemukan.
                </p>
            </div>
        );
    }

    return (
        <div className="wadah-timeline-lamaran relative mt-8 px-4">
            {/* Jalur Garis Vertikal - Posisi 30px dari kiri (Pusat Simpul) */}
            <div 
                className="jalur-garis absolute left-[34px] md:left-[44px] top-0 bottom-0 w-[4px]"
                style={{ backgroundColor: warnaGaris }}
            ></div>

            {/* Kontainer Item Timeline */}
            <div className="daftar-item-timeline flex flex-col gap-12 relative">
                {lamaran.map((item) => (
                    <div key={item.id} className="bungkus-item-timeline flex items-center">
                        {/* Simpul Timeline (Biji Kopi) - Tetap di tengah garis */}
                        <div className="area-simpul flex-shrink-0 w-[45px] md:w-[65px] flex justify-center z-20">
                            <div 
                                className="simpul-kopi w-[45px] h-[45px] md:w-[65px] md:h-[65px] rounded-full flex items-center justify-center shadow-lg"
                                style={{ backgroundColor: warnaSimpul }}
                            >
                                <img 
                                    src={coffeeBeansIcon} 
                                    alt="Ikon Kopi" 
                                    className="w-6 h-6 md:w-8 md:h-8 object-contain"
                                    style={{ 
                                        filter: 'sepia(1) saturate(1.5) brightness(1.2)' // Memberikan efek tan/gold yang cerah
                                    }}
                                />
                            </div>
                        </div>

                        {/* Kartu Status Utama - Memberi jarak dari simpul */}
                        <div className="wadah-kartu-lamaran flex-grow ml-6 md:ml-10">
                            <KartuStatus data={item} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GarisWaktuStatus;
