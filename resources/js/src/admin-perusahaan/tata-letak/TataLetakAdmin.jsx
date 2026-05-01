import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import SidebarAdmin from '../komponen/SidebarAdmin';
import TopbarAdmin from '../komponen/TopbarAdmin';
import { AdminProvider, useAdmin } from '../konteks/AdminContext';
import HalamanErrorKopi from '../komponen/HalamanErrorKopi';

const TataLetakAdminContent = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { identitas, fetchDashboard, error } = useAdmin();
    const [menuAktif, setMenuAktif] = useState('dashboard');

    const menanganiLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('peran');
        localStorage.removeItem('pengguna');
        navigate('/masuk');
    };

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    // Update menu aktif berdasarkan path
    useEffect(() => {
        const path = location.pathname;
        if (path.includes('profil')) setMenuAktif('profil');
        else if (path.includes('pelamar')) setMenuAktif('pelamar');
        else if (path.includes('lowongan')) setMenuAktif('lowongan');
        else if (path.includes('wawancara')) setMenuAktif('wawancara');
        else setMenuAktif('dashboard');
    }, [location.pathname]);

    // Jika terjadi error (misal 404 atau timeout)
    if (error) {
        return <HalamanErrorKopi code={error} message={error === 404 ? "Cangkir ini kosong (404)" : "Koneksi Terganggu"} />;
    }

    const isHalamanProfil = location.pathname === '/admin/profil';

    return (
        <div className="layout-admin-utama h-screen w-screen overflow-hidden flex font-poppins bg-[#F3EDE6]">
            <SidebarAdmin 
                menuAktif={menuAktif} 
                setMenuAktif={setMenuAktif} 
                menanganiLogout={menanganiLogout} 
            />

            <div className="area-kanan-admin flex-1 flex flex-col min-h-0 h-full overflow-hidden">
                {!isHalamanProfil && <TopbarAdmin identitas={identitas} />}
                <main className={`konten-halaman-admin flex-1 min-h-0 overflow-y-auto bg-[#F3EDE6] ${isHalamanProfil ? 'pt-[20px]' : ''}`}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

const TataLetakAdmin = () => (
    <AdminProvider>
        <TataLetakAdminContent />
    </AdminProvider>
);

export default TataLetakAdmin;
