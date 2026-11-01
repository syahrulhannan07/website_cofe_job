import React from 'react';
import { useNavigate } from 'react-router-dom';
import logoutIcon from '../../../aset/profil/logout.svg';
import layananAutentikasi from '../../../layanan/layananAutentikasi';

const TombolKeluar = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        if (window.confirm("Apakah Anda yakin ingin keluar?")) {
            try {
                // Panggil endpoint logout di Laravel
                await layananAutentikasi.logout();
                
                // Hapus token dan data sesi lokal
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                
                // Arahkan ke halaman login
                navigate('/masuk');
            } catch (error) {
                console.error("Gagal logout:", error);
                // Tetap hapus lokal jika API gagal (opsional)
                localStorage.removeItem('token');
                navigate('/masuk');
            }
        }
    };

    return (
        <div className="area-tombol-keluar flex justify-start mt-8 mb-20">
            <button 
                onClick={handleLogout}
                className="tombol-keluar inline-flex w-fit max-w-full min-h-11 items-center gap-2 sm:gap-2.5 bg-[#E3CEB6] border border-[#4B2E2B] rounded-[10px] px-4 sm:px-5 py-2 hover:bg-[#d5bc9f] transition-colors group shadow-sm active:scale-95"
            >
                <div className="wadah-ikon w-6 h-6 shrink-0 flex items-center justify-center">
                    <img src={logoutIcon} alt="" className="w-5 h-5 opacity-80 group-hover:opacity-100 transition-opacity" />
                </div>
                <span className="font-poppins font-semibold text-sm sm:text-base whitespace-nowrap text-[#4B2E2B]">
                    Log Out
                </span>
            </button>
        </div>
    );
};

export default TombolKeluar;
