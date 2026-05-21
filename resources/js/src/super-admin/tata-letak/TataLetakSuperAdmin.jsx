import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import SidebarPusat from '../komponen/SidebarPusat';
import TopbarPusat from '../komponen/TopbarPusat';

/**
 * TataLetakSuperAdmin — Layout untuk panel Otoritas Pusat.
 * Menggunakan SidebarPusat dan TopbarPusat.
 */
const TataLetakSuperAdmin = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [menuAktif, setMenuAktif] = useState('dashboard');

    const menanganiLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('peran');
        localStorage.removeItem('pengguna');
        navigate('/auth/portal-pusat/login'); // [UPDATE LOGIC]
    };

    // Update menu aktif berdasarkan path
    useEffect(() => {
        const path = location.pathname;
        if (path.includes('verifikasi')) setMenuAktif('verifikasi');
        else if (path.includes('kelola-akun')) setMenuAktif('kelola-akun');
        else if (path.includes('laporan-sistem')) setMenuAktif('laporan-sistem');
        else setMenuAktif('dashboard');
    }, [location.pathname]);

    return (
        <div className="tata-letak-super-admin h-screen w-screen overflow-hidden flex font-poppins bg-[#F4ECE9]">
            {/* Sidebar Pusat */}
            <SidebarPusat 
                menuAktif={menuAktif} 
                setMenuAktif={setMenuAktif} 
                menanganiLogout={menanganiLogout} 
            />

            {/* Area Kanan */}
            <div className="area-kanan-super flex-1 flex flex-col min-h-0 h-full overflow-hidden">
                <TopbarPusat />
                <main className="konten-halaman-super flex-1 min-h-0 overflow-y-auto bg-[#F4ECE9]">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default TataLetakSuperAdmin;
