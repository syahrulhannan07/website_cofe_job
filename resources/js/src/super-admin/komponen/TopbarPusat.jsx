import React from 'react';
import ikonNotifikasi from '../aset/sidebar/Notification.png';

const TopbarPusat = () => {
    // Di aplikasi nyata, data ini mungkin dari localStorage atau API
    const sapaan = "Hai CEO Ramadhan";
    const peranSuperAdmin = "Super Admin";

    return (
        <header className="wadah-topbar-pusat w-full h-[100px] flex flex-col justify-center px-[40px] bg-transparent flex-shrink-0 relative">
            <div className="area-konten-topbar flex items-center justify-between w-full h-full pb-[10px]">
                
                {/* Ikon Notifikasi Kiri */}
                <div className="wadah-notifikasi flex items-center justify-center cursor-pointer">
                    <img src={ikonNotifikasi} alt="Notifikasi" className="w-[32px] h-[32px] object-contain" />
                </div>

                {/* Info Profil Kanan (Tanpa Avatar) */}
                <div className="area-profil-admin flex flex-col items-end justify-center">
                    <span className="teks-peran-admin font-inter font-semibold text-[16px] leading-tight text-black">
                        {peranSuperAdmin}
                    </span>
                    <span className="teks-sapaan-admin font-inter font-normal text-[14px] text-black mt-1">
                        {sapaan}
                    </span>
                </div>
            </div>

            {/* Garis Bawah (Pemisah) */}
            <div className="wadah-garis-pemisah absolute bottom-0 left-[32px] right-[32px]">
                <div className="garis-pemisah-topbar w-full border-t border-black border-opacity-80" />
            </div>
        </header>
    );
};

export default TopbarPusat;
