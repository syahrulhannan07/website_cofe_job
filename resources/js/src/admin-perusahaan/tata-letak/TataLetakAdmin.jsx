import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import SidebarAdmin from '../komponen/SidebarAdmin';
import TopbarAdmin from '../komponen/TopbarAdmin';

const TataLetakAdmin = () => {
    const navigate = useNavigate();
    const [menuAktif, setMenuAktif] = useState('dashboard');

    const menanganiLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('peran');
        localStorage.removeItem('pengguna');
        navigate('/masuk');
    };

    return (
        <div className="layout-admin-utama h-screen w-screen overflow-hidden flex font-poppins bg-[#F3EDE6]">
            <SidebarAdmin 
                menuAktif={menuAktif} 
                setMenuAktif={setMenuAktif} 
                menanganiLogout={menanganiLogout} 
            />

            <div className="area-kanan-admin flex-1 flex flex-col min-h-0 h-full overflow-hidden">
                <TopbarAdmin />
                <main className="konten-halaman-admin flex-1 min-h-0 overflow-y-auto bg-[#F3EDE6]">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default TataLetakAdmin;
