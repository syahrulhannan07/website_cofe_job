import React from 'react';
import logoutIcon from '../../../aset/profil/logout.svg';

const TombolKeluar = () => {
    const handleLogout = () => {
        // Logika logout akan diimplementasikan nanti
        console.log("Logging out...");
        // Misalnya: window.location.href = '/masuk';
    };

    return (
        <div className="area-tombol-keluar flex justify-start mt-8 mb-20">
            <button 
                onClick={handleLogout}
                className="tombol-keluar flex items-center gap-4 bg-[#E3CEB6] border border-[#4B2E2B] rounded-[10px] px-6 py-2 hover:bg-[#d5bc9f] transition-colors group"
            >
                <div className="wadah-ikon w-10 h-10 flex items-center justify-center">
                    <img src={logoutIcon} alt="" className="w-8 h-8 opacity-80 group-hover:opacity-100 transition-opacity" />
                </div>
                <span className="font-poppins font-semibold text-[20px] text-[#4B2E2B]">
                    Log Out
                </span>
            </button>
        </div>
    );
};

export default TombolKeluar;
