import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const TataLetakAdmin = () => {
    const menuNavigasi = [
        { label: 'Dashboard', tautan: '/admin' },
        { label: 'Lowongan Saya', tautan: '/admin/lowongan' },
        { label: 'Pelamar', tautan: '/admin/pelamar' },
        { label: 'Profil Perusahaan', tautan: '/admin/profil' },
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex font-poppins">
            {/* Sidebar Admin Perusahaan */}
            <aside className="w-64 bg-[#4b2e2b] min-h-screen flex flex-col shrink-0">
                <div className="p-6 border-b border-[#5c3d39]">
                    <span className="text-[#c69c6d] font-bold text-xl">CAFE JOB</span>
                    <p className="text-[#f3ede6] text-xs mt-1 opacity-70">Admin Perusahaan</p>
                </div>

                <nav className="flex-1 p-4">
                    <ul className="space-y-2">
                        {menuNavigasi.map((menu, indeks) => (
                            <li key={indeks}>
                                <Link
                                    to={menu.tautan}
                                    className="block px-4 py-3 text-[#f3ede6] text-sm rounded-lg hover:bg-[#5c3d39] transition-colors"
                                >
                                    {menu.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>

            {/* Konten Utama */}
            <main className="flex-1 p-8 overflow-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default TataLetakAdmin;
